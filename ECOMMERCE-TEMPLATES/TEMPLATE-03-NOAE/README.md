# Noaé — Beauty & Cosmetics

Soft, minimal premium beauty design: gentle organic shapes, generous whitespace, and a calm visual hierarchy. Built for skincare, cosmetics, haircare, and wellness brands.

- **Palette:** Cream `#FBF7F4` · Dusty rose `#D9A9A0` · Sage `#A9B6A1` · Charcoal plum `#3A2E30` · Warm gold `#C9A66B`
- **Typography:** Cormorant Garamond italic (headings) + Nunito Sans / Work Sans (body)
- **Header:** logo left (italic serif wordmark), centered nav with soft underline hover, rounded search pill, icons right with soft count badges
- **Homepage order:** Announcement → Header → Hero → Shop by Concern/Category → Bestsellers → Editorial "ritual" story → New Arrivals → Ingredient spotlight → Reviews → Promo banner → Newsletter (skin-quiz style) → Footer

## What's included

| Path | What it is |
|---|---|
| `DEMO/` | Static HTML/CSS/vanilla-JS demo — open `DEMO/index.html` in a browser |
| `WORDPRESS/noae-theme/` | WordPress + WooCommerce theme source |
| `SHOPIFY/noae-theme/` | Shopify Online Store 2.0 theme source |
| `../../PACKAGES/WORDPRESS/noae-theme.zip` | Ready to upload via Appearance → Themes |
| `../../PACKAGES/SHOPIFY/noae-theme.zip` | Ready to upload via Online Store → Themes |

## Product data model

Demo product data lives in `DEMO/js/products.js` (~15 products across Skincare / Haircare / Wellness / Body): `id, name, slug, category, price, comparePrice, image, gallery, description, rating, reviewCount, badge, size/volume variants, skinType, stock, sku, keyIngredients, features, howToUse, careInstructions/storage, faqs`.

## WordPress custom fields (postmeta)

- `_noae_ingredients`, `_noae_how_to_use`, `_noae_skin_type`, `_noae_storage` — PDP tab content
- `_noae_faq` — serialized `{q, a}` array, mirrored into the visible FAQ accordion and `FAQPage` JSON-LD

Wishlist: user meta `_noae_wishlist` + guest cookie fallback (merged on login). Dedicated wishlist page template + `[noae_wishlist]` shortcode. PDP tabs are rendered full-width below the gallery/info grid (rather than nested inside the WooCommerce summary column) to match the demo's layout.

## Shopify metafields

Namespace `custom.*`: `custom.key_ingredients`, `custom.how_to_use`, `custom.skin_type`, `custom.storage`, `custom.faqs` (JSON array).

Wishlist: client-side, `localStorage` (key `noae_wishlist_v1`), keyed by product handle.

## Cart

Coupon demo code: **NOAE10**. Free-shipping message: *"Add ₹450 more to unlock FREE SHIPPING"*, threshold ₹1,999. On Shopify, the coupon field writes to the cart note rather than computing a fake discount.

## SEO/AEO

Unique titles (e.g. `Hydrating Skincare Products | Noaé`), meta descriptions, canonical URLs, robots meta, Open Graph + Twitter cards, and JSON-LD: `Organization`/`WebSite` (home), `BreadcrumbList` (category/product), `Product` + `Offer`, `FAQPage` (only when a visible FAQ exists). WordPress theme defers to Yoast/Rank Math for Product/OG schema when either plugin is active.
