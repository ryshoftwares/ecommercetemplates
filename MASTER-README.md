# E-Commerce Template Library

A collection of **4 premium e-commerce website designs**, each delivered as **3 synchronized implementations**:

1. **HTML / CSS / Vanilla JavaScript demo** — the master design, for showing clients a working prototype with no backend required.
2. **WordPress + WooCommerce theme** — a real, installable theme driven by live WooCommerce product/category data.
3. **Shopify Online Store 2.0 theme** — a real, uploadable theme driven by live Liquid product/collection data.

All three versions of a given template share the same layout, header, navigation, hero, typography, color system, product cards, product grid, product page, cart, buttons, spacing, footer, mobile behavior, and animation style. The HTML demo is the design source of truth; the WordPress and Shopify themes reproduce it using each platform's own real data model — nothing is hardcoded or faked.

**Total deliverable: 4 designs × 3 platforms = 12 complete implementations.**

Start here: **[CATALOGUE/index.html](CATALOGUE/index.html)** — a client-presentable gallery of all four templates with links to each live demo.

---

## The four templates

| # | Brand | Industry | Design style | Palette |
|---|-------|----------|---------------|---------|
| 01 | **Velora** | Fashion / clothing / accessories | Editorial luxury fashion — minimal, large photography, sophisticated whitespace | Black `#0A0A0A` · Ivory `#F7F3EC` · Warm beige `#C9B79C` · Charcoal `#2B2B2B` · Burgundy `#6E2A33` |
| 02 | **Ardea** | Furniture / home decor / lifestyle | Modern architectural luxury — asymmetrical editorial layouts, natural textures | Sand `#EDE6DA` · Terracotta `#A9603E` · Deep olive `#4B5A45` · Charcoal brown `#2E2A26` · Cream `#FAF7F2` |
| 03 | **Noaé** | Beauty / skincare / cosmetics / wellness | Soft premium beauty — organic shapes, gentle hierarchy, generous whitespace | Cream `#FBF7F4` · Dusty rose `#D9A9A0` · Sage `#A9B6A1` · Charcoal plum `#3A2E30` · Warm gold `#C9A66B` |
| 04 | **Modix** | Electronics / gadgets / technology | Clean, confident modern tech — spec-forward, precise grids, single accent color | White `#FFFFFF` · Off-white `#F5F6F8` · Charcoal `#17181C` · Slate `#4B5563` · Electric blue `#2F5DFF` |

Each template also has its own dedicated typography system, header design, homepage section order, hero copy, and product-page layout — they are four genuinely different designs, not one template re-skinned in four colors.

---

## Folder structure

```
ECOMMERCE-TEMPLATES/
├── TEMPLATE-01-VELORA/
│   ├── DEMO/                      ← open DEMO/index.html directly in a browser
│   ├── WORDPRESS/velora-theme/    ← installable WordPress/WooCommerce theme (unzipped)
│   ├── SHOPIFY/velora-theme/      ← uploadable Shopify theme (unzipped)
│   └── README.md                  ← template-specific documentation
├── TEMPLATE-02-ARDEA/    (same structure, ardea-theme)
├── TEMPLATE-03-NOAE/     (same structure, noae-theme)
└── TEMPLATE-04-MODIX/    (same structure, modix-theme)

PACKAGES/
├── WORDPRESS/   velora-theme.zip · ardea-theme.zip · noae-theme.zip · modix-theme.zip
└── SHOPIFY/     velora-theme.zip · ardea-theme.zip · noae-theme.zip · modix-theme.zip

CATALOGUE/
└── index.html   ← client-facing gallery of all 4 templates
```

The `WORDPRESS/` and `SHOPIFY/` folders under each template contain the theme source, unzipped, for review/editing. The `PACKAGES/` folder contains the same themes pre-zipped and ready to upload.

---

## Viewing the HTML demos

No installation needed. Open any of these directly in a browser:

- `ECOMMERCE-TEMPLATES/TEMPLATE-01-VELORA/DEMO/index.html`
- `ECOMMERCE-TEMPLATES/TEMPLATE-02-ARDEA/DEMO/index.html`
- `ECOMMERCE-TEMPLATES/TEMPLATE-03-NOAE/DEMO/index.html`
- `ECOMMERCE-TEMPLATES/TEMPLATE-04-MODIX/DEMO/index.html`

Each demo is a fully self-contained static site (HTML/CSS/vanilla JS, no build step, no backend). Cart, wishlist, search, filtering, and recently-viewed all work via `localStorage`. For the closest-to-production experience (correct relative paths, no browser file:// restrictions on some features), serve the `DEMO/` folder with any static file server, e.g.:

```
npx serve ECOMMERCE-TEMPLATES/TEMPLATE-01-VELORA/DEMO
```

---

## Installing a WordPress theme

1. In WordPress Admin: **Appearance → Themes → Add New → Upload Theme**.
2. Upload the matching zip from `PACKAGES/WORDPRESS/` (e.g. `velora-theme.zip`).
3. Click **Install Now**, then **Activate**.
4. Install and activate the **WooCommerce** plugin if it isn't already active — the theme requires it for shop/product/cart/checkout functionality.
5. Under **WooCommerce → Settings**, set your store's currency, shipping zones, and payment gateways.
6. Add products under **Products → Add New** (simple or variable products, categories, images, sale prices) — the theme renders everything from real WooCommerce data, so products appear automatically in the homepage/shop/category grids.
7. Under **Appearance → Customize**, set the logo, hero heading/subheading/image/CTAs, announcement bar text, footer text, and social links — see each template's own README for the exact list of customizer options.
8. Under **Appearance → Menus**, assign a menu to the **Primary** and **Footer** locations.

Each theme's product page reads additional content (specifications, materials, ingredients, FAQs, care instructions — field names vary per template) from WordPress custom fields (postmeta) on each product, documented in the template's own README and in code comments inside `inc/woocommerce.php`. These are optional — the page still works and looks correct without them, just with shorter tab content.

---

## Installing a Shopify theme

1. In Shopify Admin: **Online Store → Themes**.
2. Click **Add theme → Upload zip file**.
3. Upload the matching zip from `PACKAGES/SHOPIFY/` (e.g. `velora-theme.zip`).
4. Once uploaded, click **Actions → Publish** to make it the live theme (or preview it first via **Actions → Preview**).
5. Click **Customize** to open the Shopify Theme Editor — set the logo, colors, typography, announcement bar, hero content, featured collections, image/text sections, testimonials, newsletter block, footer, and social links.
6. Add products and collections as usual under **Products** and **Collections** — the theme's product cards, grids, and product pages all render from real Shopify product/collection objects.
7. Optionally configure the documented product **metafields** (namespace `custom.*` — exact keys are listed in each template's README and in comments inside `sections/main-product.liquid`) to populate specifications/ingredients/dimensions/FAQ content on the product page.

**Two platform-honest limitations, by design, on every Shopify theme in this library:**
- **Wishlist** — Shopify has no native wishlist object. Each theme implements it client-side via `localStorage`, keyed by product handle. This works great for demos and single-device shoppers; a merchant wanting wishlists synced across devices/logged-in customers should add a wishlist app.
- **Discount codes in the cart** — the cart's coupon field never computes a fake discount client-side. It saves the entered code to the cart's note/attributes (visible to the merchant) and tells the shopper the code is validated at checkout, which is how Shopify discount codes actually work.

---

## Customization summary

| | WordPress | Shopify |
|---|---|---|
| Logo, colors, typography | Customizer | Theme Editor → Theme settings |
| Hero content | Customizer | Theme Editor → Hero section |
| Announcement bar | Customizer | Theme Editor → Announcement bar section |
| Homepage sections | Front Page template + Customizer | Theme Editor (drag/reorder sections + blocks) |
| Footer / social links | Customizer | Theme Editor → Footer section |
| Products / categories | Products / Product categories (WooCommerce) | Products / Collections |
| Extra product content (specs, ingredients, FAQ, etc.) | Custom fields (postmeta) — see template README | Metafields (`custom.*` namespace) — see template README |

---

## SEO & AEO

Every implementation (demo, WordPress, Shopify) includes, as real architecture rather than an afterthought:

- Semantic HTML5, one `H1` per page, logical heading hierarchy
- Unique page titles and meta descriptions per page/product/category
- Canonical URLs and appropriate `robots` directives (indexable content pages; `noindex` on cart/checkout/wishlist/search/account-like pages)
- Open Graph and Twitter Card metadata
- JSON-LD structured data: `Organization`/`OnlineStore` + `WebSite` (homepage), `BreadcrumbList` (category/product), `Product` + `Offer` (product pages, from real price/SKU/availability data), `FAQPage` only where a matching visible FAQ exists
- Descriptive image filenames and alt text, lazy-loading below the fold (never on the hero/LCP image), explicit image dimensions to avoid layout shift
- Answer-friendly, factual product content (Overview / Features / Specifications / Shipping / Returns / Care / FAQ) — the same content model that helps AI shopping assistants and answer engines understand the catalogue, not just search engines
- On WordPress: the theme detects Yoast SEO / Rank Math and defers to them for Product/Organization/OG schema rather than emitting duplicates, while still providing Breadcrumb/FAQ schema
- On Shopify: SEO relies on Shopify's own native canonical/sitemap/robots behavior wherever the platform already handles it correctly, rather than fighting it

---

## A note on placeholder content

The demos and default theme settings use hand-authored SVG placeholder imagery (not stock photos) and realistic, non-lorem-ipsum sample copy and product data, so every template is genuinely presentable to a client out of the box. Before a real launch, a merchant should replace:

- Placeholder product images with real photography
- Sample product data with the client's actual catalogue
- Sample testimonials/reviews with real customer reviews
- Placeholder contact details and social links with the client's real information

---

## Per-template documentation

- [`ECOMMERCE-TEMPLATES/TEMPLATE-01-VELORA/README.md`](ECOMMERCE-TEMPLATES/TEMPLATE-01-VELORA/README.md)
- [`ECOMMERCE-TEMPLATES/TEMPLATE-02-ARDEA/README.md`](ECOMMERCE-TEMPLATES/TEMPLATE-02-ARDEA/README.md)
- [`ECOMMERCE-TEMPLATES/TEMPLATE-03-NOAE/README.md`](ECOMMERCE-TEMPLATES/TEMPLATE-03-NOAE/README.md)
- [`ECOMMERCE-TEMPLATES/TEMPLATE-04-MODIX/README.md`](ECOMMERCE-TEMPLATES/TEMPLATE-04-MODIX/README.md)
