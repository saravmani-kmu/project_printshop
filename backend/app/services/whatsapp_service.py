import httpx
from app.config import get_settings

settings = get_settings()


async def send_whatsapp(to: str, message: str):
    provider = settings.WHATSAPP_PROVIDER.lower()
    if provider == "meta":
        await _send_meta(to, message)
    elif provider == "twilio":
        await _send_twilio(to, message)
    else:
        print(f"[WHATSAPP STUB] To: {to} | Message: {message}")


async def _send_meta(to: str, message: str):
    url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_META_PHONE_NUMBER_ID}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "to": to.replace("+", "").replace(" ", ""),
        "type": "text",
        "text": {"body": message},
    }
    headers = {"Authorization": f"Bearer {settings.WHATSAPP_META_ACCESS_TOKEN}"}
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code != 200:
            print(f"[WHATSAPP META ERROR] {resp.text}")


async def _send_twilio(to: str, message: str):
    import base64
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    creds = base64.b64encode(f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}".encode()).decode()
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, data={
            "From": settings.TWILIO_WHATSAPP_FROM,
            "To": f"whatsapp:{to}",
            "Body": message,
        }, headers={"Authorization": f"Basic {creds}"})
        if resp.status_code not in (200, 201):
            print(f"[WHATSAPP TWILIO ERROR] {resp.text}")
