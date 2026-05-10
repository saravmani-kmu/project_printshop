import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

settings = get_settings()


def send_email(to: str, subject: str, html_body: str):
    if not settings.SMTP_USER:
        print(f"[EMAIL STUB] To: {to} | Subject: {subject}")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to, msg.as_string())
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to}: {e}")


def send_order_confirmation(user_email: str, user_name: str, order_number: str, total: float):
    send_email(
        to=user_email,
        subject=f"Order Confirmed – {order_number}",
        html_body=f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#7C3AED">PrintShop – Order Confirmed!</h2>
          <p>Hi {user_name},</p>
          <p>Your order <strong>{order_number}</strong> has been placed successfully.</p>
          <p>Total Amount: <strong>₹{total:.2f}</strong></p>
          <p>You can track your order status by logging into PrintShop.</p>
          <hr/>
          <p style="color:#6B7280;font-size:12px">Thank you for choosing PrintShop!</p>
        </div>
        """,
    )


def send_status_update(user_email: str, user_name: str, order_number: str, status: str, note: str | None):
    note_section = f"<p>Note: {note}</p>" if note else ""
    send_email(
        to=user_email,
        subject=f"Order Update – {order_number}",
        html_body=f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#7C3AED">PrintShop – Order Update</h2>
          <p>Hi {user_name},</p>
          <p>Your order <strong>{order_number}</strong> status has been updated to <strong>{status.upper()}</strong>.</p>
          {note_section}
          <p>Login to PrintShop to see full details.</p>
        </div>
        """,
    )


def send_admin_approval_email(to_email: str, admin_name: str, approval_url: str):
    send_email(
        to=to_email,
        subject="New Admin Registration Request – PrintShop",
        html_body=f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#7C3AED">Admin Registration Request</h2>
          <p><strong>{admin_name}</strong> has requested admin access to PrintShop.</p>
          <p>Click the button below to approve (link expires in 1 hour):</p>
          <a href="{approval_url}" style="background:#7C3AED;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">
            Approve Admin Access
          </a>
          <p style="color:#6B7280;font-size:12px">If you did not expect this, ignore this email.</p>
        </div>
        """,
    )
