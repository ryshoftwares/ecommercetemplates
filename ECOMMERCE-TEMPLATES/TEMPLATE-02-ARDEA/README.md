# Ardea — Home & Lifestyle

Modern architectural luxury for furniture, home decor, and lifestyle products: asymmetrical editorial layouts, natural textures, spacious product grids. Built for brands selling living-room, bedroom, kitchen, lighting, and decor pieces.

- **Palette:** Sand `#EDE6DA` · Terracotta `#A9603E` · Deep olive `#4B5A45` · Charcoal brown `#2E2A26` · Cream `#FAF7F2`
- **Typography:** Fraunces (headings) + Manrope (body)
- **Header:** logo left, centered mega-menu nav grouped by room (Living / Bedroom / Kitchen / Lighting / Decor), utility icons right, two-tier top bar
- **Homepage order:** Announcement → Header → Hero (asymmetric) → Shop by Room → Editorial spotlight → New Arrivals → Best Sellers → Brand story/craftsmanship → Reviews → Promo banner → Newsletter → Footer

## What's included

| Path | What it is |
|---|---|
| `DEMO/` | Static HTML/CSS/vanilla-JS demo — open `DEMO/index.html` in a browser |
| `WORDPRESS/ardea-theme/` | WordPress + WooCommerce theme source |
| `SHOPIFY/ardea-theme/` | Shopify Online Store 2.0 theme source |
| `../../PACKAGES/WORDPRESS/ardea-theme.zip` | Ready to upload via Appearance → Themes |
| `../../PACKAGES/SHOPIFY/ardea-theme.zip` | Ready to upload via Online Store → Themes |

## Product data model

Demo product data lives in `DEMO/js/products.js` (~15 products across Living Room / Bedroom / Lighting / Decor): `id, name, slug, category, price, comparePrice, image, gallery, description, rating, reviewCount, badge, finishes/colors, dimensions, stock, sku, features, materials, careInstructions, faqs`. Furniture uses **dimensions** (e.g. "L182 × D86 × H74 cm") instead of clothing sizes.

## WordPress custom fields (postmeta)

- `_ardea_dimensions`, `_ardea_materials`, `_ardea_features`, `_ardea_care` — PDP tab content
- `_ardea_faq` — serialized `{q, a}` array, mirrored into the visible FAQ accordion and `FAQPage` JSON-LD

Wishlist: user meta `_ardea_wishlist` + guest cookie fallback (merged on login). Dedicated wishlist page template + `[ardea_wishlist]` shortcode. Mega-menu is rendered by a custom `Walker_Nav_Menu` subclass that injects real product-category data — no manually-maintained 3-level menu required.

## Shopify metafields

Namespace `custom.*`: `custom.dimensions`, `custom.materials`, `custom.assembly_required`, `custom.care_instructions`, `custom.features`, `custom.faqs` (JSON array).

Wishlist: client-side, `localStorage` (key `ardea_wishlist_v1`), keyed by product handle.

## Cart

Coupon demo code: **ARDEA10**. Free-shipping message: *"Add ₹1,200 more to unlock FREE DELIVERY"*, threshold ₹6,000. On Shopify, the coupon field writes to the cart note rather than computing a fake discount.

## SEO/AEO

Unique titles (e.g. `Modern Living Room Furniture | Ardea`), meta descriptions, canonical URLs, robots meta, Open Graph + Twitter cards, and JSON-LD: `Organization`/`WebSite` (home), `BreadcrumbList` (category/product), `Product` + `Offer`, `FAQPage` (only when a visible FAQ exists). WordPress theme defers to Yoast/Rank Math for Product/OG schema when either plugin is active.
