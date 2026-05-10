"""
Run: python -m seeds.seed_data
Seeds products, variants, templates, discounts, and app_config.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal, engine
from app.models import *
from app.database import Base


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(Product).count() > 0:
            print("Database already seeded. Skipping.")
            return

        # ── App Config ───────────────────────────────────────────────
        configs = [
            AppConfig(key="max_upload_size_mb", value="10", description="Maximum upload file size in MB"),
            AppConfig(key="allowed_upload_extensions", value="jpg,jpeg,png,pdf,svg", description="Allowed file extensions"),
            AppConfig(key="notification_mobile", value="+919999999999", description="WhatsApp notification mobile"),
            AppConfig(key="admin_approval_email", value="admin@printshop.com", description="Email to receive admin requests"),
            AppConfig(key="whatsapp_provider", value="stub", description="WhatsApp provider: stub/meta/twilio"),
            AppConfig(key="business_name", value="PrintShop India", description="Business name shown on site"),
            AppConfig(key="business_tagline", value="Design & Print. Fast. Affordable.", description="Homepage tagline"),
        ]
        db.add_all(configs)

        # ── Products + Variants + Templates ────────────────────────────

        products_data = [
            {
                "name": "Visiting Cards",
                "description": "Premium quality visiting cards with sharp print and smooth finish. Make a lasting first impression.",
                "icon": "credit-card",
                "sort_order": 1,
                "variants": [
                    {"label": "100 Cards", "quantity": 100, "retail_price": 299, "b2b_price": 199},
                    {"label": "250 Cards", "quantity": 250, "retail_price": 499, "b2b_price": 349},
                    {"label": "500 Cards", "quantity": 500, "retail_price": 799, "b2b_price": 549},
                    {"label": "1000 Cards", "quantity": 1000, "retail_price": 1299, "b2b_price": 899},
                ],
                "templates": [
                    {"name": "Classic Professional", "preview_image": "/templates/vc_classic.png"},
                    {"name": "Modern Minimal", "preview_image": "/templates/vc_minimal.png"},
                    {"name": "Bold Corporate", "preview_image": "/templates/vc_corporate.png"},
                    {"name": "Creative Colorful", "preview_image": "/templates/vc_colorful.png"},
                ],
            },
            {
                "name": "Bill Books",
                "description": "Customised bill books with your business logo and details. Available in single and duplicate copy.",
                "icon": "book-open",
                "sort_order": 2,
                "variants": [
                    {"label": "50 Pages (Single Copy)", "quantity": 50, "retail_price": 399, "b2b_price": 299},
                    {"label": "100 Pages (Duplicate)", "quantity": 100, "retail_price": 699, "b2b_price": 499},
                    {"label": "200 Pages (Duplicate)", "quantity": 200, "retail_price": 1199, "b2b_price": 849},
                ],
                "templates": [
                    {"name": "Standard GST Bill", "preview_image": "/templates/bb_gst.png"},
                    {"name": "Simple Receipt", "preview_image": "/templates/bb_receipt.png"},
                    {"name": "Invoice Format", "preview_image": "/templates/bb_invoice.png"},
                ],
            },
            {
                "name": "Greeting Cards",
                "description": "Beautiful greeting cards for festivals, birthdays, and special occasions. Personalised with your message.",
                "icon": "gift",
                "sort_order": 3,
                "variants": [
                    {"label": "25 Cards", "quantity": 25, "retail_price": 499, "b2b_price": 349},
                    {"label": "50 Cards", "quantity": 50, "retail_price": 849, "b2b_price": 599},
                    {"label": "100 Cards", "quantity": 100, "retail_price": 1399, "b2b_price": 999},
                ],
                "templates": [
                    {"name": "Festival Wishes", "preview_image": "/templates/gc_festival.png"},
                    {"name": "Birthday Celebration", "preview_image": "/templates/gc_birthday.png"},
                    {"name": "Corporate Thank You", "preview_image": "/templates/gc_corporate.png"},
                ],
            },
            {
                "name": "Pamphlets & Flyers",
                "description": "Eye-catching pamphlets and flyers for promotions, events, and advertisements.",
                "icon": "file-text",
                "sort_order": 4,
                "variants": [
                    {"label": "100 Pieces (A5)", "quantity": 100, "retail_price": 599, "b2b_price": 399},
                    {"label": "250 Pieces (A5)", "quantity": 250, "retail_price": 999, "b2b_price": 699},
                    {"label": "500 Pieces (A4)", "quantity": 500, "retail_price": 1799, "b2b_price": 1299},
                ],
                "templates": [
                    {"name": "Sale Promotion", "preview_image": "/templates/pf_sale.png"},
                    {"name": "Event Announcement", "preview_image": "/templates/pf_event.png"},
                    {"name": "Restaurant Menu", "preview_image": "/templates/pf_menu.png"},
                ],
            },
            {
                "name": "Stickers & Labels",
                "description": "Custom stickers and labels for products, packaging, and branding.",
                "icon": "tag",
                "sort_order": 5,
                "variants": [
                    {"label": "100 Stickers (Small)", "quantity": 100, "retail_price": 249, "b2b_price": 179},
                    {"label": "250 Stickers (Medium)", "quantity": 250, "retail_price": 499, "b2b_price": 349},
                    {"label": "500 Stickers (Large)", "quantity": 500, "retail_price": 849, "b2b_price": 599},
                ],
                "templates": [
                    {"name": "Product Label", "preview_image": "/templates/sl_product.png"},
                    {"name": "Address Label", "preview_image": "/templates/sl_address.png"},
                    {"name": "Brand Sticker", "preview_image": "/templates/sl_brand.png"},
                ],
            },
            {
                "name": "Calendars",
                "description": "Custom wall and desk calendars with your brand. Perfect for corporate gifting.",
                "icon": "calendar",
                "sort_order": 6,
                "variants": [
                    {"label": "25 Desk Calendars", "quantity": 25, "retail_price": 1499, "b2b_price": 1099},
                    {"label": "50 Wall Calendars", "quantity": 50, "retail_price": 2499, "b2b_price": 1799},
                    {"label": "100 Wall Calendars", "quantity": 100, "retail_price": 4499, "b2b_price": 3299},
                ],
                "templates": [
                    {"name": "Modern Grid", "preview_image": "/templates/cal_grid.png"},
                    {"name": "Photo Calendar", "preview_image": "/templates/cal_photo.png"},
                    {"name": "Minimal Corporate", "preview_image": "/templates/cal_corporate.png"},
                ],
            },
        ]

        for pd in products_data:
            templates_data = pd.pop("templates")
            variants_data = pd.pop("variants")
            product = Product(**pd)
            db.add(product)
            db.flush()

            for vd in variants_data:
                db.add(ProductVariant(product_id=product.id, **vd))

            for td in templates_data:
                db.add(Template(product_id=product.id, is_seeded=True, **td))

        # ── Discounts ─────────────────────────────────────────────────
        discounts = [
            Discount(
                name="Morning Early Bird",
                type="percentage", value=10,
                applies_to="both", trigger_type="time_of_day",
                trigger_config={"start": "09:00", "end": "11:00"},
            ),
            Discount(
                name="B2B Bulk Discount",
                type="percentage", value=15,
                applies_to="b2b", trigger_type="always",
            ),
            Discount(
                name="Loyal Customer Reward",
                type="flat", value=100,
                applies_to="retail", trigger_type="loyalty",
                trigger_config={"months_since_join": 6},
            ),
            Discount(
                name="Festive Season Offer",
                type="percentage", value=20,
                applies_to="both", trigger_type="season",
                trigger_config={"months": [10, 11, 1]},  # Oct, Nov, Jan
                is_active=False,
            ),
        ]
        db.add_all(discounts)

        db.commit()
        print("Database seeded successfully!")
        print(f"  - {len(products_data)} products with variants and templates")
        print(f"  - {len(discounts)} discount rules")
        print(f"  - {len(configs)} app config entries")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
