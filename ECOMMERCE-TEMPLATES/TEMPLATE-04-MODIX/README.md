# Modix — Technology & Gadgets

Clean, confident modern technology design: spec-forward product presentation, precise grids, and a single electric-blue accent — deliberately not a "gaming" aesthetic. Built for electronics, smartphones, laptops, audio, smart-home, and wearables brands.

- **Palette:** White `#FFFFFF` · Off-white `#F5F6F8` · Charcoal `#17181C` · Slate `#4B5563` · Electric blue accent `#2F5DFF`
- **Typography:** Space Grotesk (headings) + Inter (body) + JetBrains Mono (spec/SKU accents)
- **Header:** bold logo left, mega-dropdown category nav with mini spec-chip product highlights, dark charcoal utility strip that collapses on scroll
- **Homepage order:** Announcement → Header → Hero (product-forward) → Shop by Category → Comparison/spec-highlight strip → New Arrivals → Best Sellers → Engineering/design story → Reviews → Promo banner → Newsletter → Footer

## What's included

| Path | What it is |
|---|---|
| `DEMO/` | Static HTML/CSS/vanilla-JS demo — open `DEMO/index.html` in a browser |
| `WORDPRESS/modix-theme/` | WordPress + WooCommerce theme source |
| `SHOPIFY/modix-theme/` | Shopify Online Store 2.0 theme source |
| `../../PACKAGES/WORDPRESS/modix-theme.zip` | Ready to upload via Appearance → Themes |
| `../../PACKAGES/SHOPIFY/modix-theme.zip` | Ready to upload via Online Store → Themes |

## Product data model

Demo product data lives in `DEMO/js/products.js` (~15 products across Audio / Smartphones / Laptops / Smart Home / Wearables): `id, name, slug, category, price, comparePrice, image, gallery, description, rating, reviewCount, badge, colors, variants, stock, sku, specifications, boxContents, warranty, features, faqs`.

## WordPress custom fields (postmeta)

- `_modix_specifications` — serialized key/value array, drives the spec table, PDP tabs, JSON-LD, mega-menu spec chips, and the homepage compare strip
- `_modix_features`, `_modix_box_contents`, `_modix_warranty` — PDP tab content
- `_modix_faq` — serialized `{q, a}` array, mirrored into the visible FAQ accordion and `FAQPage` JSON-LD
- `_modix_spec_highlights` (optional) — curated chips for the mega-menu product highlights

Wishlist: user meta `_modix_wishlist` + guest cookie fallback (merged on login). Mega-menu is rendered by a `Walker_Nav_Menu` subclass that attaches a spec-chip product panel to every top-level nav item resolving to a real product category.

## Shopify metafields

Namespace `custom.*`: `custom.specifications` (JSON label/value array, rendered by a shared `snippets/spec-table.liquid` used on both the PDP and the compare strip), `custom.features`, `custom.box_contents`, `custom.warranty`, `custom.faqs`, `custom.compatibility` (filterable via Search & Discovery).

Wishlist: client-side, `localStorage` (key `modix_wishlist_v1`), keyed by product handle.

## Cart

Coupon demo code: **MODIX10**. Free-shipping message: *"Add ₹999 more to unlock FREE SHIPPING"*, threshold ₹2,999. On Shopify, the coupon field writes to the cart note rather than computing a fake discount.

## SEO/AEO

Unique titles (e.g. `Wireless Audio & Headphones | Modix`), meta descriptions, canonical URLs, robots meta, Open Graph + Twitter cards, and JSON-LD: `Organization`/`WebSite` (home), `BreadcrumbList` (category/product), `Product` + `Offer`, `FAQPage` (only when a visible FAQ exists). Specifications/box-contents/warranty content doubles as answer-engine-friendly (AEO) copy — the exact factual detail a shopping assistant or comparison query needs. WordPress theme defers to Yoast/Rank Math for Product/OG schema when either plugin is active.
