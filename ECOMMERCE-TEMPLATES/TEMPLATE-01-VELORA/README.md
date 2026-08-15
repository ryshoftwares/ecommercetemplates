# Velora — Luxury Fashion

Editorial luxury fashion template: minimal layout, large photography, sophisticated whitespace. Built for clothing/accessories brands that want a high-end fashion-magazine feel rather than a generic storefront look.

- **Palette:** Black `#0A0A0A` · Ivory `#F7F3EC` · Warm beige `#C9B79C` · Charcoal `#2B2B2B` · Burgundy accent `#6E2A33`
- **Typography:** Playfair Display / Cormorant Garamond (headings) + Jost / Inter (body) — see `DEMO/css/style.css` for the exact pairing used
- **Header:** centered wordmark logo, utility icons split either side, primary nav below
- **Homepage order:** Announcement → Header → Hero → Editorial quote → Featured Categories → New Arrivals → Brand story → Best Sellers → Promo banner → Reviews → Newsletter → Footer

## What's included

| Path | What it is |
|---|---|
| `DEMO/` | Static HTML/CSS/vanilla-JS demo — open `DEMO/index.html` in a browser |
| `WORDPRESS/velora-theme/` | WordPress + WooCommerce theme source |
| `SHOPIFY/velora-theme/` | Shopify Online Store 2.0 theme source |
| `../../PACKAGES/WORDPRESS/velora-theme.zip` | Ready to upload via Appearance → Themes |
| `../../PACKAGES/SHOPIFY/velora-theme.zip` | Ready to upload via Online Store → Themes |

## Product data model

Demo product data lives in `DEMO/js/products.js` (~15 products across Dresses / Outerwear / Knitwear / Accessories): `id, name, slug, category, price, comparePrice, image, gallery, description, rating, reviewCount, badge, colors, sizes, stock, sku, features, materials, careInstructions, faqs`.

## WordPress custom fields (postmeta)

Set these on individual products to populate the PDP tabs and FAQ (all optional — the page still renders correctly without them):

- `_velora_features`, `_velora_materials` — tab content
- `_velora_faq` — serialized array of `{q, a}` pairs, mirrored into the visible FAQ accordion and `FAQPage` JSON-LD

Wishlist: user meta `_velora_wishlist` for logged-in customers, a cookie fallback for guests (merged on login). Wishlist page: dedicated page template + `[velora_wishlist]` shortcode (chosen over a My Account endpoint so guests can use it too).

## Shopify metafields

Namespace `custom.*` on the Product resource: `custom.features`, `custom.materials`, `custom.care_instructions`, `custom.size_guide`, `custom.faqs` (JSON array), `custom.rating` / `custom.rating_count`, `custom.related_products`.

Wishlist: client-side only, `localStorage` (key `velora_wishlist_v1`), keyed by product handle.

## Cart

Coupon demo code: **VELORA10** (10% off). Free-shipping message: *"Add ₹850 more to unlock FREE SHIPPING"*, threshold ₹4,000 (demo) / configurable via theme/customizer settings on WordPress and Shopify. On Shopify, the coupon field writes to the cart note/attributes rather than computing a fake discount — real codes are validated at Shopify checkout.

## SEO/AEO

Unique titles/meta descriptions per page (e.g. `Silk Tailored Dress | Velora`), canonical URLs, robots meta (indexable content pages; `noindex` on cart/checkout/wishlist/search), Open Graph + Twitter cards, and JSON-LD: `Organization`/`WebSite` (home), `BreadcrumbList` (category/product), `Product` + `Offer` (product, from real price/SKU/availability), `FAQPage` (product, only when the visible FAQ is present). On WordPress, Product/OG schema is skipped automatically when Yoast SEO or Rank Math is active, to avoid duplicate schema.
