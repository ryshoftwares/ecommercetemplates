/* ==========================================================================
   VELORA — Product Data & Rendering Helpers
   Single source of truth for all product listings across the site.
   URL convention: product.html?slug=<slug>  ·  category.html?cat=<category-slug>
   (documented also in js/app.js and each HTML page header comment)
   ========================================================================== */

(function (global) {
  "use strict";

  var IMG = "assets/images/";

  var PRODUCTS = [
    {
      id: 1,
      name: "Silk Tailored Dress",
      slug: "silk-tailored-dress",
      category: "Dresses",
      categorySlug: "dresses",
      price: 12800,
      comparePrice: null,
      image: IMG + "velora-dress-silhouette-black.svg",
      imageAlt: "Silk tailored dress in black, fitted bodice with a fluid midi skirt, styled on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-dress-silhouette-black.svg", alt: "Front view of the silk tailored dress in black with a structured waist seam" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Close detail of the silk dress fabric showing its soft sheen and drape" },
        { src: IMG + "velora-dress-silhouette-black.svg", alt: "Three-quarter view of the silk tailored dress in black" }
      ],
      description: "A fluid silk dress cut with a fitted bodice and a bias-cut midi skirt that moves with every step, finished with a concealed back zip for a clean silhouette.",
      rating: 4.8,
      reviewCount: 126,
      badge: "New",
      colors: ["Black", "Ivory"],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 14,
      sku: "VEL-DR-001",
      brand: "VELORA",
      features: [
        "100% mulberry silk with a soft, non-cling drape",
        "Concealed back-zip closure for a smooth finish",
        "Bias-cut midi skirt that moves fluidly when walking",
        "Fully lined in breathable viscose"
      ],
      materials: "Shell: 100% mulberry silk. Lining: 100% viscose. Made with OEKO-TEX certified dyes.",
      careInstructions: "Dry clean only. Store on a padded hanger away from direct sunlight. Steam lightly to release travel creases; avoid direct heat on the silk surface.",
      faqs: [
        { q: "Does the Silk Tailored Dress run true to size?", a: "Yes, this style is cut true to size with a fitted bodice. If you're between sizes or prefer a looser drape through the waist, we recommend sizing up." },
        { q: "Is the silk fabric see-through?", a: "The dress is fully lined in viscose, so it is not sheer when worn. The silk shell itself has a light natural translucency typical of pure silk." },
        { q: "Can I return this dress if it doesn't fit?", a: "Yes, unworn pieces with tags attached can be returned within 30 days of delivery for a full refund or exchange." }
      ]
    },
    {
      id: 2,
      name: "Velvet Wrap Dress",
      slug: "velvet-wrap-dress",
      category: "Dresses",
      categorySlug: "dresses",
      price: 14200,
      comparePrice: 17800,
      image: IMG + "velora-dress-silhouette-burgundy.svg",
      imageAlt: "Deep burgundy velvet wrap dress with a self-tie waist belt on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-dress-silhouette-burgundy.svg", alt: "Front view of the burgundy velvet wrap dress with tie waist" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Close detail of the velvet pile catching the light" },
        { src: IMG + "velora-dress-silhouette-burgundy.svg", alt: "Side view of the velvet wrap dress showing the wrap-front skirt" }
      ],
      description: "A jewel-toned velvet dress with a true wrap front, self-tie waist belt, and a softly gathered skirt that flatters through the hip.",
      rating: 4.9,
      reviewCount: 98,
      badge: "Sale",
      colors: ["Burgundy", "Black"],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 9,
      sku: "VEL-DR-002",
      brand: "VELORA",
      features: [
        "Plush cotton-blend velvet with a soft, non-shedding pile",
        "True wrap front with interior tie for a secure, adjustable fit",
        "Self-tie waist belt to define the silhouette",
        "Midi length with a gently gathered skirt"
      ],
      materials: "Shell: 92% cotton, 8% elastane velvet. Lining: 100% polyester crepe.",
      careInstructions: "Dry clean recommended. If hand-washing, use cold water and lay flat to dry. Steam from the reverse side only to preserve the velvet pile.",
      faqs: [
        { q: "How does the wrap front stay closed?", a: "The dress has an interior tie at the waist plus the outer self-tie belt, so the wrap front stays securely closed throughout the day." },
        { q: "Is the velvet warm enough for winter?", a: "Yes, the cotton-blend velvet has a substantial weight that makes it well suited to autumn and winter wear, especially layered with the Wool Tailored Coat." },
        { q: "What's the current discount on this dress?", a: "This style is marked down from ₹17,800 to ₹14,200 for a limited time while stock lasts, shown automatically at checkout." }
      ]
    },
    {
      id: 3,
      name: "Ivory Column Gown",
      slug: "ivory-column-gown",
      category: "Dresses",
      categorySlug: "dresses",
      price: 21500,
      comparePrice: null,
      image: IMG + "velora-dress-silhouette-ivory.svg",
      imageAlt: "Floor-length ivory column gown with a fluid silhouette on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-dress-silhouette-ivory.svg", alt: "Front view of the ivory column gown, full length" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Detail of the satin-back crepe fabric of the ivory gown" },
        { src: IMG + "velora-dress-silhouette-ivory.svg", alt: "Back view of the ivory column gown showing the fitted waist" }
      ],
      description: "A floor-length column gown in satin-back crepe, cut on the bias for a fluid line that follows the body without clinging.",
      rating: 5.0,
      reviewCount: 41,
      badge: "Bestseller",
      colors: ["Ivory", "Black"],
      sizes: ["XS", "S", "M", "L"],
      stock: 7,
      sku: "VEL-DR-003",
      brand: "VELORA",
      features: [
        "Bias-cut satin-back crepe for a fluid, body-following line",
        "Fitted waist seam with hidden boning for structure",
        "Floor-sweeping hem finished by hand",
        "Includes a matching fabric belt"
      ],
      materials: "100% satin-back crepe (polyester). Interior boning: flexible polyester.",
      careInstructions: "Dry clean only. Hang immediately after wear on a padded hanger to prevent creasing. Do not steam directly on the satin face.",
      faqs: [
        { q: "Is this gown suitable for a formal event?", a: "Yes, the Ivory Column Gown is designed for black-tie and formal occasions, with a floor-length hem and a fitted, structured bodice." },
        { q: "Will the ivory colour show through under venue lighting?", a: "The crepe fabric has enough weight and a satin back that it does not become sheer under standard event lighting." },
        { q: "Can this be tailored to my height?", a: "The gown is cut long to allow for hemming. We recommend having it tailored by a professional to your exact heel height before the event." }
      ]
    },
    {
      id: 4,
      name: "Pleated Midi Dress",
      slug: "pleated-midi-dress",
      category: "Dresses",
      categorySlug: "dresses",
      price: 10600,
      comparePrice: null,
      image: IMG + "velora-dress-silhouette-black.svg",
      imageAlt: "Charcoal pleated midi dress with a fitted waist on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-dress-silhouette-black.svg", alt: "Front view of the charcoal pleated midi dress" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Detail of the fine knife-pleating on the midi dress skirt" },
        { src: IMG + "velora-dress-silhouette-black.svg", alt: "Side view of the pleated midi dress in motion" }
      ],
      description: "Knife-pleated from waist to hem, this midi dress holds its shape in motion and pairs equally well with flats or heels.",
      rating: 4.6,
      reviewCount: 73,
      badge: "New",
      colors: ["Charcoal", "Burgundy"],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 20,
      sku: "VEL-DR-004",
      brand: "VELORA",
      features: [
        "Permanent knife-pleating from waist to hem",
        "Fitted, seamed waist for definition",
        "Wrinkle-resistant technical crepe",
        "Machine washable on a gentle cycle"
      ],
      materials: "100% technical polyester crepe with permanent pleat-set finish.",
      careInstructions: "Machine wash cold, gentle cycle, inside a wash bag. Hang to dry to preserve the pleats. Do not iron directly over the pleating.",
      faqs: [
        { q: "Do the pleats loosen after washing?", a: "No, the pleats are heat-set permanently into the fabric and will hold their shape through repeated gentle machine washes." },
        { q: "Is this dress office-appropriate?", a: "Yes, the tailored fit and knife-pleat skirt make it suitable for both the office and evening occasions, depending on styling." },
        { q: "What shoes work best with this length?", a: "The midi length pairs well with both low block heels for daytime and a strappy heel for evening." }
      ]
    },
    {
      id: 5,
      name: "Wool Tailored Coat",
      slug: "wool-tailored-coat",
      category: "Outerwear",
      categorySlug: "outerwear",
      price: 24500,
      comparePrice: null,
      image: IMG + "velora-outerwear-camel.svg",
      imageAlt: "Camel wool tailored coat with structured shoulders on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-outerwear-camel.svg", alt: "Front view of the camel wool tailored coat, buttoned" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Close detail of the dense wool weave of the tailored coat" },
        { src: IMG + "velora-outerwear-camel.svg", alt: "Back view of the camel wool coat showing the tailored seaming" }
      ],
      description: "A structured double-faced wool coat with a notched collar and horn-effect buttons, tailored to skim the body through the shoulder and waist.",
      rating: 4.9,
      reviewCount: 154,
      badge: "Bestseller",
      colors: ["Camel", "Charcoal"],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 11,
      sku: "VEL-OW-001",
      brand: "VELORA",
      features: [
        "Double-faced wool for structure without bulk",
        "Notched collar with a tailored, single-breasted front",
        "Horn-effect buttons and interior welt pocket",
        "Fully lined through the body and sleeves"
      ],
      materials: "Shell: 80% wool, 20% polyamide. Lining: 100% viscose.",
      careInstructions: "Dry clean only. Brush gently with a soft garment brush after wear. Store on a wide-shouldered hanger.",
      faqs: [
        { q: "Is this coat warm enough for winter?", a: "Yes, the double-faced wool construction gives it a substantial weight suitable for cold-weather wear, and it layers well over knitwear." },
        { q: "What size should I order if I plan to layer underneath?", a: "The coat has a tailored but not restrictive fit. If you plan to wear it over thick knitwear regularly, we suggest sizing up by one." },
        { q: "How long does delivery take for outerwear?", a: "Standard delivery for outerwear is 3-5 business days across India, with express delivery available at checkout." }
      ]
    },
    {
      id: 6,
      name: "Belted Trench Coat",
      slug: "belted-trench-coat",
      category: "Outerwear",
      categorySlug: "outerwear",
      price: 19800,
      comparePrice: null,
      image: IMG + "velora-outerwear-ivory.svg",
      imageAlt: "Ivory belted trench coat with a storm flap on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-outerwear-ivory.svg", alt: "Front view of the ivory belted trench coat, belt tied" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Detail of the cotton-twill weave used on the trench coat" },
        { src: IMG + "velora-outerwear-ivory.svg", alt: "Side view of the ivory trench coat showing the storm flap and belt" }
      ],
      description: "A classic cotton-twill trench with a storm flap, epaulettes, and a self-fabric belt, cut in a longer length for modern proportion.",
      rating: 4.7,
      reviewCount: 89,
      badge: "New",
      colors: ["Ivory", "Black"],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 16,
      sku: "VEL-OW-002",
      brand: "VELORA",
      features: [
        "Water-resistant cotton-twill finish",
        "Storm flap and epaulettes for classic trench detailing",
        "Self-fabric belt with D-ring buckle",
        "Longer, updated proportion below the knee"
      ],
      materials: "100% cotton with a water-resistant finish. Lining: 100% polyester.",
      careInstructions: "Dry clean recommended for structure. Spot clean light marks with a damp cloth. Re-apply water-resistant spray annually.",
      faqs: [
        { q: "Is the trench coat actually waterproof?", a: "It is water-resistant, not fully waterproof — it will handle light rain and drizzle well but is not intended for sustained heavy rainfall." },
        { q: "Will an ivory trench stain easily?", a: "The finish resists light staining, but we recommend spot-cleaning marks promptly and avoiding prolonged contact with dark surfaces." },
        { q: "What is worn underneath the trench in the lookbook?", a: "In our New Season lookbook it's styled over the Ribbed Merino Turtleneck and the Pleated Midi Dress." }
      ]
    },
    {
      id: 7,
      name: "Cashmere Blend Cape",
      slug: "cashmere-blend-cape",
      category: "Outerwear",
      categorySlug: "outerwear",
      price: 22800,
      comparePrice: null,
      image: IMG + "velora-outerwear-camel.svg",
      imageAlt: "Camel cashmere-blend cape with a draped silhouette on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-outerwear-camel.svg", alt: "Front view of the camel cashmere-blend cape" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Close detail of the brushed cashmere-blend fabric of the cape" },
        { src: IMG + "velora-outerwear-camel.svg", alt: "Side view of the cape showing the arm slits and draped fall" }
      ],
      description: "An oversized cape in a brushed cashmere blend with covered arm slits and a draped, sculptural fall from the shoulders.",
      rating: 4.8,
      reviewCount: 52,
      badge: null,
      colors: ["Camel", "Ivory"],
      sizes: ["One Size"],
      stock: 13,
      sku: "VEL-OW-003",
      brand: "VELORA",
      features: [
        "Brushed cashmere-wool blend for softness and warmth",
        "Covered arm slits so the cape stays secure while worn",
        "Sculptural, draped silhouette designed to layer over tailoring",
        "Generous one-size fit"
      ],
      materials: "70% wool, 20% cashmere, 10% polyamide.",
      careInstructions: "Dry clean only. Store flat or on a wide hanger; avoid hanging by narrow hooks, which can stretch the shoulder line.",
      faqs: [
        { q: "How does a one-size cape fit different body types?", a: "The cape is designed with a generous, draped cut that sits at roughly hip length on most heights between 155cm and 178cm." },
        { q: "Can I wear this over the Wool Tailored Coat?", a: "The cape is intended as an alternative to a coat rather than a layer over one, given its draped, arm-slit construction." },
        { q: "Does the cashmere blend shed or pill?", a: "Light pilling is normal with brushed cashmere blends over time; a fabric shaver on the lowest setting will keep it looking fresh." }
      ]
    },
    {
      id: 8,
      name: "Quilted Field Jacket",
      slug: "quilted-field-jacket",
      category: "Outerwear",
      categorySlug: "outerwear",
      price: 15200,
      comparePrice: 18000,
      image: IMG + "velora-outerwear-ivory.svg",
      imageAlt: "Charcoal quilted field jacket with a stand collar on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-outerwear-ivory.svg", alt: "Front view of the charcoal quilted field jacket, zipped" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Detail of the diamond-quilted stitching on the field jacket" },
        { src: IMG + "velora-outerwear-ivory.svg", alt: "Side view of the quilted field jacket showing the patch pockets" }
      ],
      description: "A lightly padded field jacket with diamond quilting, a stand collar, and patch pockets, built for transitional weather.",
      rating: 4.5,
      reviewCount: 67,
      badge: "Sale",
      colors: ["Charcoal", "Camel"],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 18,
      sku: "VEL-OW-004",
      brand: "VELORA",
      features: [
        "Lightweight diamond quilting with recycled polyfill",
        "Stand collar and full-zip front with snap storm flap",
        "Two patch pockets at the hip",
        "Elasticated inner cuffs for a close fit"
      ],
      materials: "Shell: 100% recycled polyester. Fill: recycled polyfill insulation.",
      careInstructions: "Machine wash cold on a gentle cycle. Do not tumble dry on high heat; reshape and dry flat to maintain the quilting loft.",
      faqs: [
        { q: "What temperature range is this jacket suited for?", a: "The lightweight fill makes it ideal for mild winters and shoulder seasons — roughly 8-18°C worn on its own, or colder when layered." },
        { q: "Is this jacket machine washable?", a: "Yes, unlike our wool outerwear this jacket is machine washable on a gentle cold cycle, making it easy to care for." },
        { q: "Why is this jacket discounted?", a: "The Quilted Field Jacket is part of our current seasonal sale, reduced from ₹18,000 to ₹15,200 while stock lasts." }
      ]
    },
    {
      id: 9,
      name: "Cashmere Crewneck Sweater",
      slug: "cashmere-crewneck-sweater",
      category: "Knitwear",
      categorySlug: "knitwear",
      price: 11400,
      comparePrice: null,
      image: IMG + "velora-knitwear-beige.svg",
      imageAlt: "Beige cashmere crewneck sweater with ribbed trims on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-knitwear-beige.svg", alt: "Front view of the beige cashmere crewneck sweater" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Close detail of the fine-gauge cashmere knit" },
        { src: IMG + "velora-knitwear-beige.svg", alt: "Side view of the cashmere crewneck sweater" }
      ],
      description: "A fine-gauge crewneck knitted from pure cashmere with ribbed cuffs and hem, designed as an everyday layering essential.",
      rating: 4.9,
      reviewCount: 203,
      badge: "Bestseller",
      colors: ["Beige", "Black", "Ivory"],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 25,
      sku: "VEL-KN-001",
      brand: "VELORA",
      features: [
        "100% pure cashmere, 12-gauge knit",
        "Ribbed crewneck, cuffs, and hem for shape retention",
        "Relaxed, easy fit through the body",
        "Sits at the high hip"
      ],
      materials: "100% cashmere.",
      careInstructions: "Hand wash cold in a wool-safe detergent or dry clean. Dry flat on a towel, reshaping while damp. Never wring or tumble dry.",
      faqs: [
        { q: "Will this cashmere sweater pill?", a: "Some pilling is natural with pure cashmere after repeated wear; we recommend a cashmere comb every few weeks to keep it looking new." },
        { q: "Is the fit oversized or fitted?", a: "The Cashmere Crewneck has a relaxed, easy fit rather than a tight one — size down for a closer silhouette." },
        { q: "How should I store cashmere in the off-season?", a: "Fold rather than hang, store with cedar blocks against moths, and keep in a breathable cotton bag rather than plastic." }
      ]
    },
    {
      id: 10,
      name: "Ribbed Merino Turtleneck",
      slug: "ribbed-merino-turtleneck",
      category: "Knitwear",
      categorySlug: "knitwear",
      price: 8600,
      comparePrice: null,
      image: IMG + "velora-knitwear-charcoal.svg",
      imageAlt: "Charcoal ribbed merino turtleneck with a fitted silhouette on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-knitwear-charcoal.svg", alt: "Front view of the charcoal ribbed merino turtleneck" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Detail of the fine ribbing on the merino turtleneck" },
        { src: IMG + "velora-knitwear-charcoal.svg", alt: "Side view of the ribbed merino turtleneck" }
      ],
      description: "A close-fitting turtleneck in extra-fine merino, ribbed throughout for a second-skin layer that works under tailoring or alone.",
      rating: 4.7,
      reviewCount: 118,
      badge: null,
      colors: ["Charcoal", "Burgundy"],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 22,
      sku: "VEL-KN-002",
      brand: "VELORA",
      features: [
        "Extra-fine merino wool, naturally temperature-regulating",
        "Fully ribbed construction for a close, flattering fit",
        "Fitted turtleneck collar that doesn't restrict the neck",
        "Designed to layer under coats and jackets"
      ],
      materials: "100% extra-fine merino wool.",
      careInstructions: "Machine washable on a wool cycle at 30°C in a mesh bag, or hand wash. Dry flat. Do not bleach.",
      faqs: [
        { q: "Is merino wool itchy against the skin?", a: "Extra-fine merino has a much finer fibre diameter than standard wool, so most wearers find it soft and non-itchy even directly on skin." },
        { q: "Can this turtleneck be machine washed?", a: "Yes, unlike our cashmere pieces this merino style can go in the machine on a dedicated wool cycle, making it easier to care for day to day." },
        { q: "What size is best for wearing under the Wool Tailored Coat?", a: "Its fitted, low-bulk knit is designed specifically to sit smoothly under structured outerwear — order your usual size." }
      ]
    },
    {
      id: 11,
      name: "Oversized Alpaca Cardigan",
      slug: "oversized-alpaca-cardigan",
      category: "Knitwear",
      categorySlug: "knitwear",
      price: 13600,
      comparePrice: null,
      image: IMG + "velora-knitwear-beige.svg",
      imageAlt: "Beige oversized alpaca cardigan with patch pockets on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-knitwear-beige.svg", alt: "Front view of the beige oversized alpaca cardigan" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Close detail of the brushed alpaca knit texture" },
        { src: IMG + "velora-knitwear-beige.svg", alt: "Side view of the oversized alpaca cardigan draped open" }
      ],
      description: "An oversized cardigan in brushed alpaca wool with dropped shoulders, patch pockets, and horn buttons for an off-duty layer.",
      rating: 4.8,
      reviewCount: 84,
      badge: "New",
      colors: ["Beige", "Charcoal"],
      sizes: ["S/M", "L/XL"],
      stock: 15,
      sku: "VEL-KN-003",
      brand: "VELORA",
      features: [
        "Brushed alpaca-wool blend, lightweight yet warm",
        "Dropped shoulder for an oversized, relaxed fit",
        "Two patch pockets and horn button closure",
        "Sits at the mid-thigh"
      ],
      materials: "60% alpaca, 40% wool.",
      careInstructions: "Dry clean or hand wash cold. Dry flat away from direct heat. Store folded to preserve the dropped-shoulder shape.",
      faqs: [
        { q: "How oversized is the fit?", a: "It's designed to be worn oversized with room to layer a turtleneck underneath. If you prefer a closer fit, size down to S/M." },
        { q: "Is alpaca warmer than wool?", a: "Alpaca fibre is naturally lighter and often warmer than sheep's wool of the same weight, with a soft, slightly fuzzy hand-feel." },
        { q: "Does this cardigan come in petite sizing?", a: "Currently it's offered in two relaxed size bands, S/M and L/XL, designed to suit a range of heights given its oversized cut." }
      ]
    },
    {
      id: 12,
      name: "Cropped Knit Vest",
      slug: "cropped-knit-vest",
      category: "Knitwear",
      categorySlug: "knitwear",
      price: 6200,
      comparePrice: 7400,
      image: IMG + "velora-knitwear-charcoal.svg",
      imageAlt: "Charcoal cropped knit vest layered over a blouse on an abstract editorial silhouette",
      gallery: [
        { src: IMG + "velora-knitwear-charcoal.svg", alt: "Front view of the charcoal cropped knit vest" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Detail of the rib-knit trim on the cropped vest" },
        { src: IMG + "velora-knitwear-charcoal.svg", alt: "Side view of the cropped knit vest" }
      ],
      description: "A cropped sleeveless knit vest with rib-trimmed armholes, designed to layer over blouses and shirting without adding bulk.",
      rating: 4.4,
      reviewCount: 39,
      badge: "Sale",
      colors: ["Charcoal", "Beige"],
      sizes: ["XS", "S", "M", "L"],
      stock: 12,
      sku: "VEL-KN-004",
      brand: "VELORA",
      features: [
        "Lightweight cotton-wool blend knit",
        "Rib-trimmed armholes and hem",
        "Cropped length designed for high-waisted trousers and skirts",
        "Layers cleanly under blazers"
      ],
      materials: "55% cotton, 45% wool.",
      careInstructions: "Hand wash cold or dry clean. Dry flat. Cool iron on reverse if needed.",
      faqs: [
        { q: "What can I wear underneath the vest?", a: "It's designed to layer over blouses, turtlenecks, or shirting — the rib-trimmed armholes sit comfortably over most sleeve widths." },
        { q: "Is this vest true to size or cropped tight?", a: "It runs true to size through the body; the cropped length is intentional and sits just above the natural waist." },
        { q: "Why is this vest on sale?", a: "It's part of our current knitwear promotion, reduced from ₹7,400 to ₹6,200 for a limited time." }
      ]
    },
    {
      id: 13,
      name: "Leather Structured Tote",
      slug: "leather-structured-tote",
      category: "Accessories",
      categorySlug: "accessories",
      price: 18900,
      comparePrice: null,
      image: IMG + "velora-accessory-bag.svg",
      imageAlt: "Black structured leather tote bag with top handles on a plain editorial backdrop",
      gallery: [
        { src: IMG + "velora-accessory-bag.svg", alt: "Front view of the black structured leather tote" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Close detail of the pebbled leather grain on the tote" },
        { src: IMG + "velora-accessory-bag.svg", alt: "Side view of the leather tote showing the top handles and structured base" }
      ],
      description: "A structured tote in full-grain leather with a reinforced base, dual top handles, and an interior zip pocket sized for daily essentials.",
      rating: 4.9,
      reviewCount: 167,
      badge: "Bestseller",
      colors: ["Black", "Burgundy"],
      sizes: ["One Size"],
      stock: 10,
      sku: "VEL-AC-001",
      brand: "VELORA",
      features: [
        "Full-grain leather with a pebbled texture that resists scuffing",
        "Reinforced structured base holds its shape when set down",
        "Interior zip pocket plus two slip pockets",
        "Dual top handles with a 10cm drop"
      ],
      materials: "100% full-grain leather, cotton-twill lining, brass-tone hardware.",
      careInstructions: "Wipe with a dry soft cloth after use. Apply a leather protectant twice a year and avoid prolonged exposure to direct sun.",
      faqs: [
        { q: "What fits inside the Leather Structured Tote?", a: "The main compartment comfortably fits a 14-inch laptop, an A4 folder, or everyday essentials with room for a light jacket." },
        { q: "Does the leather scratch easily?", a: "The pebbled full-grain finish is chosen specifically because it resists light scuffing better than smooth leather, though we still recommend gentle handling." },
        { q: "Is this bag adjustable for a shoulder carry?", a: "It's designed as a top-handle tote; the handle drop is 10cm, suited to hand-carry or the crook of the arm rather than shoulder wear." }
      ]
    },
    {
      id: 14,
      name: "Silk Twill Scarf",
      slug: "silk-twill-scarf",
      category: "Accessories",
      categorySlug: "accessories",
      price: 4200,
      comparePrice: null,
      image: IMG + "velora-accessory-scarf.svg",
      imageAlt: "Burgundy silk twill scarf with a hand-rolled edge laid flat on an editorial backdrop",
      gallery: [
        { src: IMG + "velora-accessory-scarf.svg", alt: "Flat lay of the burgundy silk twill scarf" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Close detail of the silk twill weave and hand-rolled hem" },
        { src: IMG + "velora-accessory-scarf.svg", alt: "Folded view of the silk twill scarf" }
      ],
      description: "A generously sized silk twill scarf finished with a hand-rolled edge, versatile enough to wear at the neck, on a bag handle, or as a headscarf.",
      rating: 4.6,
      reviewCount: 74,
      badge: "New",
      colors: ["Burgundy", "Beige"],
      sizes: ["90cm x 90cm"],
      stock: 30,
      sku: "VEL-AC-002",
      brand: "VELORA",
      features: [
        "100% silk twill with a substantial, luxurious hand-feel",
        "Hand-rolled edge finished by skilled artisans",
        "Generous 90cm x 90cm square format",
        "Versatile styling: neck, hair, or handbag handle"
      ],
      materials: "100% silk twill.",
      careInstructions: "Dry clean or gently hand wash in cold water with a silk-safe detergent. Iron on the lowest setting while slightly damp.",
      faqs: [
        { q: "How many ways can this scarf be worn?", a: "The 90cm square format is intentionally versatile — customers wear it as a neck scarf, tied on a bag handle, as a headscarf, or as a belt." },
        { q: "Is the hand-rolled edge fragile?", a: "The hand-rolled hem is a durable traditional finishing technique used on fine silk scarves and will hold up well with the recommended gentle care." },
        { q: "Does this scarf make a good gift?", a: "Yes, it arrives in a branded VELORA gift box at no extra charge, making it a popular gifting choice." }
      ]
    },
    {
      id: 15,
      name: "Gold-Plated Hoop Earrings",
      slug: "gold-plated-hoop-earrings",
      category: "Accessories",
      categorySlug: "accessories",
      price: 3400,
      comparePrice: null,
      image: IMG + "velora-accessory-jewelry.svg",
      imageAlt: "Gold-plated hoop earrings displayed on an editorial jewellery backdrop",
      gallery: [
        { src: IMG + "velora-accessory-jewelry.svg", alt: "Pair of gold-plated hoop earrings, front view" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Close detail of the polished gold-plated finish on the hoops" },
        { src: IMG + "velora-accessory-jewelry.svg", alt: "Angled view of the gold-plated hoop earrings" }
      ],
      description: "Lightweight hoop earrings in 18k gold-plated brass, sized to wear from morning meetings through to evening events.",
      rating: 4.5,
      reviewCount: 112,
      badge: null,
      colors: ["Gold"],
      sizes: ["3cm hoop"],
      stock: 40,
      sku: "VEL-AC-003",
      brand: "VELORA",
      features: [
        "18k gold plating over a brass base for durability and shine",
        "Lightweight construction comfortable for all-day wear",
        "Secure hinged closure",
        "Hypoallergenic surgical-steel post"
      ],
      materials: "Brass base with 18k gold plating, surgical-steel post.",
      careInstructions: "Keep dry and avoid contact with perfume or lotion. Store in the provided pouch to prevent tarnishing.",
      faqs: [
        { q: "Will these earrings tarnish over time?", a: "The 18k gold plating is durable but will gradually fade with heavy wear; keeping them dry and stored in the pouch when not worn extends their shine." },
        { q: "Are these earrings hypoallergenic?", a: "The posts are surgical steel, which is suitable for most sensitive ears, though the plated brass hoop itself is not fully nickel-free." },
        { q: "What size are the hoops?", a: "Each hoop measures 3cm in diameter — a versatile mid-size that suits both everyday and evening styling." }
      ]
    },
    {
      id: 16,
      name: "Leather Ankle Boots",
      slug: "leather-ankle-boots",
      category: "Accessories",
      categorySlug: "accessories",
      price: 16800,
      comparePrice: 19500,
      image: IMG + "velora-accessory-boots.svg",
      imageAlt: "Black leather ankle boots with a block heel on an editorial backdrop",
      gallery: [
        { src: IMG + "velora-accessory-boots.svg", alt: "Side view of the black leather ankle boots" },
        { src: IMG + "velora-editorial-texture.svg", alt: "Close detail of the smooth leather upper and stitched sole of the boots" },
        { src: IMG + "velora-accessory-boots.svg", alt: "Front view of the black leather ankle boots" }
      ],
      description: "Ankle boots in smooth leather with a 5cm block heel and a side zip, built on a rounded toe last for all-day comfort.",
      rating: 4.7,
      reviewCount: 145,
      badge: "Sale",
      colors: ["Black", "Camel"],
      sizes: ["36", "37", "38", "39", "40", "41"],
      stock: 8,
      sku: "VEL-AC-004",
      brand: "VELORA",
      features: [
        "Smooth full-grain leather upper",
        "5cm block heel for stability and all-day comfort",
        "Interior side zip for easy on-and-off",
        "Leather-covered insole with cushioned footbed"
      ],
      materials: "Upper: 100% leather. Sole: rubber. Insole: leather-covered foam.",
      careInstructions: "Wipe clean with a damp cloth and leather cleaner. Use a shoe tree when not worn. Water-and-stain protect before first wear.",
      faqs: [
        { q: "Do these boots run true to size?", a: "Yes, they're cut true to standard EU sizing. If you have a wider foot, we suggest sizing up half a size for comfort." },
        { q: "Is a 5cm heel comfortable for all-day wear?", a: "The block heel shape and cushioned footbed are designed specifically for all-day comfort, unlike a thin stiletto heel of the same height." },
        { q: "Can I exchange for a different size after delivery?", a: "Yes, unworn boots in original packaging can be exchanged for a different size within 30 days of delivery, free of charge." }
      ]
    }
  ];

  var CATEGORIES = [
    {
      slug: "dresses",
      name: "Dresses",
      image: IMG + "velora-category-dresses.svg",
      imageAlt: "Editorial imagery representing the VELORA Dresses collection",
      intro: "Our dress collection spans fluid silk slips, structured velvet wraps, and floor-length column gowns, each cut to move with the body rather than against it. Every silhouette is designed in-house and produced in small batches, so fit and fabric quality remain consistent across the range. Whether you're dressing for the office, a formal evening, or a weekend event, you'll find a considered piece here rather than a trend-led one."
    },
    {
      slug: "outerwear",
      name: "Outerwear",
      image: IMG + "velora-category-outerwear.svg",
      imageAlt: "Editorial imagery representing the VELORA Outerwear collection",
      intro: "VELORA outerwear is built around a small set of enduring shapes — the tailored wool coat, the belted trench, the draped cape — updated each season in new colourways rather than reinvented from scratch. We favour natural and recycled fibres with real structure, so each piece holds its silhouette over years of wear, not just one winter."
    },
    {
      slug: "knitwear",
      name: "Knitwear",
      image: IMG + "velora-category-knitwear.svg",
      imageAlt: "Editorial imagery representing the VELORA Knitwear collection",
      intro: "From fine-gauge cashmere crewnecks to oversized alpaca cardigans, our knitwear is designed as everyday layering pieces first and statement knits second. We work directly with mills that specialise in natural fibres, which is why you'll find merino, cashmere, and alpaca throughout the range rather than synthetic blends."
    },
    {
      slug: "accessories",
      name: "Accessories",
      image: IMG + "velora-category-accessories.svg",
      imageAlt: "Editorial imagery representing the VELORA Accessories collection",
      intro: "The accessories edit covers structured leather bags, silk scarves, fine jewellery, and footwear — the finishing details that carry an outfit from day to evening. Each piece is chosen to pair easily with the rest of the VELORA range, so building a considered wardrobe around a few key pieces is straightforward."
    }
  ];

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  function getAllProducts() { return PRODUCTS.slice(); }

  function getProductBySlug(slug) {
    if (!slug) return null;
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
    }
    return null;
  }

  function getProductsByCategory(categorySlug) {
    return PRODUCTS.filter(function (p) { return p.categorySlug === categorySlug; });
  }

  function getRelatedProducts(product, limit) {
    limit = limit || 4;
    return PRODUCTS.filter(function (p) {
      return p.categorySlug === product.categorySlug && p.id !== product.id;
    }).slice(0, limit);
  }

  function getCategoryBySlug(slug) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].slug === slug) return CATEGORIES[i];
    }
    return null;
  }

  function getAllCategories() { return CATEGORIES.slice(); }

  function formatPrice(amount) {
    return "₹" + Math.round(amount).toLocaleString("en-IN");
  }

  function discountPercent(price, comparePrice) {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  }

  function renderStars(rating) {
    var full = Math.round(rating);
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += i <= full ? "★" : "☆";
    }
    return out;
  }

  function colorToHex(name) {
    var map = {
      "Black": "#0A0A0A",
      "Ivory": "#F7F3EC",
      "Burgundy": "#6E2A33",
      "Camel": "#B08A5C",
      "Charcoal": "#2B2B2B",
      "Beige": "#C9B79C",
      "Gold": "#C6A664"
    };
    return map[name] || "#C9B79C";
  }

  // ---------------------------------------------------------------------
  // Card / suggestion markup builders (used by index, shop, category, search)
  // ---------------------------------------------------------------------
  function productCardHTML(p, opts) {
    opts = opts || {};
    var lazy = opts.eager ? "" : ' loading="lazy"';
    var wDiscount = discountPercent(p.price, p.comparePrice);
    var badgeClass = p.badge ? "badge-" + p.badge.toLowerCase().replace(/\s+/g, "-") : "";
    var badgeHTML = p.badge ? '<span class="product-badge ' + badgeClass + '">' + p.badge + "</span>" : "";
    var secondaryImg = p.gallery && p.gallery[1] ? p.gallery[1].src : p.image;
    var secondaryAlt = p.gallery && p.gallery[1] ? p.gallery[1].alt : p.imageAlt;
    var priceHTML = '<div class="product-price"><span class="price-current">' + formatPrice(p.price) + "</span>";
    if (p.comparePrice) {
      priceHTML += '<span class="price-compare">' + formatPrice(p.comparePrice) + "</span>";
      priceHTML += '<span class="price-discount">-' + wDiscount + "%</span>";
    }
    priceHTML += "</div>";
    var colorsHTML = '<div class="product-colors">' + p.colors.map(function (c) {
      return '<span class="color-dot" style="background:' + colorToHex(c) + '" title="' + c + '"></span>';
    }).join("") + "</div>";

    return (
      '<article class="product-card" data-product-id="' + p.id + '">' +
        '<div class="product-media">' +
          '<a href="product.html?slug=' + p.slug + '" aria-label="View ' + p.name + '">' +
            '<img class="img-primary" src="' + p.image + '" alt="' + p.imageAlt + '" width="600" height="800"' + lazy + '>' +
            '<img class="img-secondary" src="' + secondaryImg + '" alt="' + secondaryAlt + '" width="600" height="800" loading="lazy">' +
          "</a>" +
          badgeHTML +
          '<button type="button" class="wishlist-toggle" data-wishlist-toggle data-id="' + p.id + '" aria-label="Add ' + p.name + ' to wishlist" aria-pressed="false">' +
            '<svg viewBox="0 0 24 24" stroke-width="1.6"><path d="M12 21s-7.5-4.6-10-9.2C0.3 8.3 2 4.5 5.7 4c2-.3 3.7.7 4.9 2.3C11.8 4.7 13.5 3.7 15.5 4c3.7.5 5.4 4.3 3.7 7.8C20 16.4 12 21 12 21z"/></svg>' +
          "</button>" +
          '<div class="product-card-actions">' +
            '<button type="button" class="btn btn-ivory btn-sm" data-quickview data-slug="' + p.slug + '">Quick View</button>' +
            '<button type="button" class="btn btn-primary btn-sm" data-quickadd data-slug="' + p.slug + '">Quick Add</button>' +
          "</div>" +
        "</div>" +
        '<div class="product-info">' +
          '<div class="product-cat">' + p.category + "</div>" +
          '<h3 class="product-name"><a href="product.html?slug=' + p.slug + '">' + p.name + "</a></h3>" +
          '<div class="product-rating"><span class="stars">' + renderStars(p.rating) + "</span><span>" + p.rating.toFixed(1) + " (" + p.reviewCount + ")</span></div>" +
          priceHTML +
          colorsHTML +
        "</div>" +
      "</article>"
    );
  }

  function renderProductGrid(container, products, opts) {
    if (!container) return;
    if (!products.length) {
      container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" stroke-width="1.2" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg><h3>No products found</h3><p class="text-muted">Try adjusting your filters or search terms.</p></div>';
      return;
    }
    container.innerHTML = products.map(function (p) { return productCardHTML(p, opts); }).join("");
  }

  global.VeloraProducts = {
    all: getAllProducts,
    getBySlug: getProductBySlug,
    getByCategory: getProductsByCategory,
    getRelated: getRelatedProducts,
    getCategoryBySlug: getCategoryBySlug,
    allCategories: getAllCategories,
    formatPrice: formatPrice,
    discountPercent: discountPercent,
    renderStars: renderStars,
    colorToHex: colorToHex,
    cardHTML: productCardHTML,
    renderGrid: renderProductGrid
  };
})(window);
