/* ==========================================================================
   MODIX — js/products.js
   Centralized product data + render helpers.
   Loaded before every other JS module (app.js, cart.js, filters.js,
   product.js, search.js, wishlist.js) which all read window.MODIX_PRODUCTS
   and use the helpers below to avoid duplicating markup logic.
   ========================================================================== */

(function () {
  "use strict";

  /* Categories shown in nav / shop-by-category / filters.
     `slug` is the query-param value used across category.html?cat=<slug>
     and shop.html?category=<slug>. `intro` is the longer, AEO-friendly
     paragraph rendered on category.html (kept here so the copy never
     drifts from the product data it describes). */
  var CATEGORIES = [
    { slug: "audio", name: "Audio", short: "Headphones, earbuds & speakers built for accurate sound.", icon: "audio",
      intro: "Modix Audio covers four products built around one idea: accurate, low-distortion sound you can trust across commutes, workouts and studio sessions. The lineup runs from the noise-cancelling Pulse headphones and pocketable Aria earbuds to the rugged IP67 Boom speaker and the studio-reference Studio Pro. Every driver is hand-tuned in-house and every battery-life figure is measured on a standardized mixed-use benchmark, not a best-case spec." },
    { slug: "smartphones", name: "Smartphones", short: "Flagship and everyday phones with all-day battery life.", icon: "phone",
      intro: "Modix Smartphones spans three tiers — the flagship Phone 12 Pro, the everyday Phone 12, and the essentials-focused Phone SE — so the display size, camera system and battery capacity scale with what you're willing to pay. All three share the same 5G radio, USB-C charging and at least a 1-year hardware warranty, and every listed spec below comes straight from our internal product data sheets." },
    { slug: "laptops", name: "Laptops", short: "Thin, fast laptops for work, study and creative projects.", icon: "laptop",
      intro: "Modix Laptops includes three fanless-to-powerhouse machines: the 1.1kg Book Slim 13 for students, the 1.3kg Book Air 14 for everyday productivity, and the discrete-GPU Book Pro 16 for video editing and 3D work. Every model ships with a documented battery-life figure, a 1-year hardware warranty extendable to 3 years via Modix Care+, and the same USB-C charging standard." },
    { slug: "smart-home", name: "Smart Home", short: "Speakers, cameras and lighting that work together.", icon: "home",
      intro: "Modix Smart Home connects three devices — the Hub smart speaker with a built-in Thread/Zigbee radio, the 2K Cam indoor security camera, and the 16-million-colour Glow bulb kit — into one system controlled from the Modix Home app. Hub acts as the hub itself, so most homes only need one Hub speaker plus a Wi-Fi router to get voice control, live camera feeds and scheduled lighting working together." },
    { slug: "wearables", name: "Wearables", short: "Watches and bands that track fitness and health.", icon: "watch",
      intro: "Modix Wearables covers three fitness and health devices: the swim-proof Watch Active, the titanium expedition-grade Watch Pro, and the 14-day-battery Band Fit Tracker. Every device tracks continuous heart rate and sleep, pairs with iOS 14+ and Android 9+ over Bluetooth, and is backed by at least a 1-year limited warranty on the case and internal electronics." }
  ];

  var IMG = {
    hero: "assets/images/modix-hero-technology-refined.svg",
    pulse: "assets/images/modix-pulse-wireless-headphones.svg",
    aria: "assets/images/modix-aria-true-wireless-earbuds.svg",
    boom: "assets/images/modix-boom-portable-speaker.svg",
    studio: "assets/images/modix-studio-pro-over-ear-headphones.svg",
    phone: "assets/images/modix-phone-silhouette.svg",
    laptop: "assets/images/modix-laptop-silhouette.svg",
    hub: "assets/images/modix-smart-speaker-silhouette.svg",
    cam: "assets/images/modix-security-camera-silhouette.svg",
    glow: "assets/images/modix-smart-bulb-kit.svg",
    watch: "assets/images/modix-watch-silhouette.svg",
    band: "assets/images/modix-fitness-band.svg",
    editorial: "assets/images/modix-engineering-design-studio.svg"
  };

  /* ------------------------------------------------------------------
     PRODUCTS
     Prices are INR (integer rupees). `compareprice` is the pre-discount
     MRP used for badge/discount math; equal to price when no discount.
     `specifications` is an ordered array of {label, value} used to
     render both the PDP spec table and Product/Offer JSON-LD.
     ------------------------------------------------------------------ */
  var PRODUCTS = [
    {
      id: 1,
      sku: "MDX-AU-PULSE-BLK",
      slug: "modix-pulse-wireless-headphones",
      name: "Modix Pulse Wireless Headphones",
      brand: "MODIX",
      category: "audio",
      price: 8999,
      comparePrice: 10999,
      rating: 4.6,
      reviewCount: 312,
      badge: "Best Seller",
      stock: 42,
      image: IMG.pulse,
      gallery: [
        { src: IMG.pulse, alt: "Modix Pulse Wireless Headphones, front angle on a white studio background" },
        { src: IMG.pulse, alt: "Modix Pulse Wireless Headphones, folded flat showing ear cup hinge" },
        { src: IMG.pulse, alt: "Modix Pulse Wireless Headphones with charging cable and carry pouch" }
      ],
      colors: [
        { name: "Charcoal", hex: "#17181C" },
        { name: "Off-White", hex: "#F5F6F8" },
        { name: "Electric Blue", hex: "#2F5DFF" }
      ],
      variantType: "storage",
      variants: [],
      description: "Over-ear wireless headphones with active noise cancellation, 40-hour battery life and a precision-tuned 40mm driver for clear, balanced sound on every commute.",
      features: [
        "Hybrid active noise cancellation with a dedicated transparency mode",
        "40 hours of playback on a single charge, 10-minute fast charge for 5 extra hours",
        "40mm dynamic drivers tuned for balanced, low-distortion sound",
        "Multipoint Bluetooth 5.3 pairs with two devices at once",
        "Memory-foam ear cushions rated for all-day comfort"
      ],
      specifications: [
        { label: "Driver Size", value: "40mm dynamic" },
        { label: "Battery Life", value: "40 hrs (ANC on: 32 hrs)" },
        { label: "Charging", value: "USB-C, fast charge 10 min = 5 hrs" },
        { label: "Connectivity", value: "Bluetooth 5.3, multipoint, 3.5mm wired" },
        { label: "Noise Cancellation", value: "Hybrid ANC + transparency mode" },
        { label: "Weight", value: "268g" },
        { label: "Compatibility", value: "iOS 14+, Android 9+, Windows 10+, macOS 11+" },
        { label: "Water Resistance", value: "Not rated (indoor/commute use)" }
      ],
      boxContents: ["Modix Pulse Wireless Headphones", "USB-C charging cable (1m)", "3.5mm audio cable", "Hard-shell carry case", "Quick start guide"],
      warranty: "1-year international limited warranty covering manufacturing defects in materials and workmanship. Battery capacity is warrantied to retain at least 80% capacity for the first 12 months of normal use.",
      faqs: [
        { q: "Do the Pulse headphones work with both Android and iPhone?", a: "Yes. Pulse pairs over Bluetooth 5.3 with any iOS 14+, Android 9+, Windows 10+ or macOS 11+ device, and multipoint lets you stay connected to two of those devices at the same time." },
        { q: "How long does the battery actually last with ANC on?", a: "With active noise cancellation switched on you get roughly 32 hours of playback; with ANC off that extends to 40 hours. A 10-minute USB-C fast charge adds about 5 hours of listening time." },
        { q: "What's included in the box?", a: "Every Pulse order ships with the headphones, a 1m USB-C charging cable, a 3.5mm wired audio cable for flights or backup listening, a hard-shell carry case, and a quick start guide." },
        { q: "What does the warranty cover?", a: "Pulse is covered by a 1-year international limited warranty against manufacturing defects, and Modix separately warranties the battery to hold at least 80% of its original capacity through the first year of normal use." }
      ]
    },
    {
      id: 2,
      sku: "MDX-AU-ARIA-BLK",
      slug: "modix-aria-true-wireless-earbuds",
      name: "Modix Aria True Wireless Earbuds",
      brand: "MODIX",
      category: "audio",
      price: 5499,
      comparePrice: 6499,
      rating: 4.4,
      reviewCount: 486,
      badge: "New",
      stock: 65,
      image: IMG.aria,
      gallery: [
        { src: IMG.aria, alt: "Modix Aria True Wireless Earbuds resting beside their charging case" },
        { src: IMG.aria, alt: "Modix Aria True Wireless Earbuds charging case open showing both earbuds" },
        { src: IMG.aria, alt: "Modix Aria True Wireless Earbuds close-up of the touch-control surface" }
      ],
      colors: [
        { name: "Charcoal", hex: "#17181C" },
        { name: "Off-White", hex: "#F5F6F8" }
      ],
      variantType: "storage",
      variants: [],
      description: "Compact true wireless earbuds with adaptive ANC, IPX4 sweat resistance and a pocketable case that delivers 24 hours of total playback.",
      features: [
        "Adaptive ANC adjusts in real time to street and office noise",
        "IPX4 splash and sweat resistance for workouts and commutes",
        "6 hours per charge, 24 hours total with the compact case",
        "Touch controls for playback, calls and voice assistant",
        "Wireless charging case compatible with Qi pads"
      ],
      specifications: [
        { label: "Driver Size", value: "10mm dynamic" },
        { label: "Battery Life", value: "6 hrs (buds) / 24 hrs (with case)" },
        { label: "Charging", value: "USB-C + Qi wireless charging case" },
        { label: "Connectivity", value: "Bluetooth 5.3" },
        { label: "Noise Cancellation", value: "Adaptive ANC + ambient mode" },
        { label: "Water Resistance", value: "IPX4 splash/sweat resistant" },
        { label: "Weight", value: "4.8g per earbud, 42g case" },
        { label: "Compatibility", value: "iOS 14+, Android 9+" }
      ],
      boxContents: ["Modix Aria earbuds (pair)", "Wireless charging case", "USB-C charging cable", "3 sizes of silicone ear tips", "Quick start guide"],
      warranty: "1-year limited warranty on the earbuds and charging case, covering manufacturing defects. IPX4 water resistance is not covered for liquid damage caused by misuse.",
      faqs: [
        { q: "Are Aria earbuds sweat-proof for workouts?", a: "Aria carries an IPX4 rating, which protects against splashes and sweat during workouts and light rain, though it is not designed for submersion or swimming." },
        { q: "How long do they last on a single charge?", a: "Each earbud runs about 6 hours per charge, and the pocketable case holds enough reserve power for 24 hours of total listening between charges." },
        { q: "Can I charge the case wirelessly?", a: "Yes, the charging case supports Qi wireless charging pads in addition to the included USB-C cable." },
        { q: "What's in the box and what's the warranty?", a: "You get the earbuds, wireless charging case, USB-C cable, three sizes of silicone ear tips and a quick start guide, backed by a 1-year limited warranty against manufacturing defects." }
      ]
    },
    {
      id: 3,
      sku: "MDX-AU-BOOM-BLU",
      slug: "modix-boom-portable-speaker",
      name: "Modix Boom Portable Speaker",
      brand: "MODIX",
      category: "audio",
      price: 4299,
      comparePrice: 4299,
      rating: 4.5,
      reviewCount: 201,
      badge: "",
      stock: 58,
      image: IMG.boom,
      gallery: [
        { src: IMG.boom, alt: "Modix Boom Portable Speaker standing upright on a concrete surface" },
        { src: IMG.boom, alt: "Modix Boom Portable Speaker side view showing the fabric grille" },
        { src: IMG.boom, alt: "Modix Boom Portable Speaker with its braided strap extended" }
      ],
      colors: [
        { name: "Electric Blue", hex: "#2F5DFF" },
        { name: "Charcoal", hex: "#17181C" }
      ],
      variantType: "storage",
      variants: [],
      description: "A rugged IP67 portable speaker with 360° sound, 18-hour battery life and pairing for two units in stereo.",
      features: [
        "360° sound projection fills a room or backyard evenly",
        "IP67 dust and waterproof rating survives pool decks and rain",
        "18 hours of playback per charge",
        "Pair two Boom speakers for true stereo sound",
        "Built-in mic for hands-free calls"
      ],
      specifications: [
        { label: "Output", value: "2 x 10W drivers, 360° dispersion" },
        { label: "Battery Life", value: "18 hrs at moderate volume" },
        { label: "Charging", value: "USB-C, full charge in 2.5 hrs" },
        { label: "Connectivity", value: "Bluetooth 5.2, stereo pairing" },
        { label: "Durability", value: "IP67 dust and water resistant" },
        { label: "Weight", value: "620g" },
        { label: "Compatibility", value: "Any Bluetooth 5.0+ source device" }
      ],
      boxContents: ["Modix Boom speaker", "USB-C charging cable", "Braided carry strap", "Quick start guide"],
      warranty: "1-year limited warranty covering manufacturing defects, including the IP67 seals under normal use.",
      faqs: [
        { q: "Is Boom actually safe to use near a pool?", a: "Boom carries an IP67 rating, meaning it resists dust ingress completely and can be briefly submerged in up to 1 metre of water, so poolside and rainy-day use is expected and covered by warranty under normal use." },
        { q: "Can I connect two Boom speakers together?", a: "Yes, two Boom units can be paired over Bluetooth for synchronized true stereo sound." },
        { q: "What comes in the box?", a: "Each order includes the speaker, a USB-C charging cable, a braided carry strap, and a quick start guide." },
        { q: "What's covered under warranty?", a: "The 1-year limited warranty covers manufacturing defects in materials and workmanship, including failure of the IP67 dust and water seals under normal, non-abusive use." }
      ]
    },
    {
      id: 4,
      sku: "MDX-AU-STUDIO-CHR",
      slug: "modix-studio-pro-over-ear-headphones",
      name: "Modix Studio Pro Over-Ear Headphones",
      brand: "MODIX",
      category: "audio",
      price: 13999,
      comparePrice: 15999,
      rating: 4.8,
      reviewCount: 158,
      badge: "Editor's Pick",
      stock: 24,
      image: IMG.studio,
      gallery: [
        { src: IMG.studio, alt: "Modix Studio Pro Over-Ear Headphones on a stand in a studio setting" },
        { src: IMG.studio, alt: "Modix Studio Pro Over-Ear Headphones detail of the aluminium headband hinge" },
        { src: IMG.studio, alt: "Modix Studio Pro Over-Ear Headphones with detachable cable accessory" }
      ],
      colors: [
        { name: "Charcoal", hex: "#17181C" },
        { name: "Silver", hex: "#C9CDD6" }
      ],
      variantType: "storage",
      variants: [],
      description: "Studio-reference over-ear headphones with 45mm drivers, planar-style clarity and a detachable cable for wired mixing sessions.",
      features: [
        "45mm drivers deliver reference-grade frequency response",
        "Detachable cable system for studio and travel use",
        "Premium aluminium headband with memory-foam padding",
        "Passive noise isolation tuned for critical listening",
        "Foldable design with a rigid travel case"
      ],
      specifications: [
        { label: "Driver Size", value: "45mm reference-tuned" },
        { label: "Frequency Response", value: "16Hz – 40kHz" },
        { label: "Battery Life", value: "30 hrs wireless / unlimited wired" },
        { label: "Connectivity", value: "Bluetooth 5.3 + detachable 3.5mm/6.35mm cable" },
        { label: "Impedance", value: "32 ohm" },
        { label: "Weight", value: "312g" },
        { label: "Compatibility", value: "Any Bluetooth device; wired with pro audio interfaces" }
      ],
      boxContents: ["Modix Studio Pro headphones", "Detachable 3.5mm cable", "6.35mm adapter", "Rigid travel case", "Cleaning cloth"],
      warranty: "2-year limited warranty reflecting the studio-grade build, covering drivers, hinges and electronics against manufacturing defects.",
      faqs: [
        { q: "Can I use Studio Pro wired with a mixing desk?", a: "Yes. The detachable cable terminates in 3.5mm with an included 6.35mm adapter, so Studio Pro works wired and unpowered with mixing desks, audio interfaces and instruments." },
        { q: "How long does the battery last in wireless mode?", a: "In wireless Bluetooth mode the battery lasts approximately 30 hours; switch to the detachable cable and listening time is unlimited since no power is required." },
        { q: "What's included with Studio Pro?", a: "The box contains the headphones, a detachable 3.5mm cable, a 6.35mm adapter for studio equipment, a rigid travel case and a cleaning cloth." },
        { q: "Is the warranty longer than other Modix headphones?", a: "Yes, Studio Pro carries a 2-year limited warranty in recognition of its studio-grade components, covering the drivers, hinges and internal electronics against manufacturing defects." }
      ]
    },
    {
      id: 5,
      sku: "MDX-PH-P12PRO-256",
      slug: "modix-phone-12-pro",
      name: "Modix Phone 12 Pro",
      brand: "MODIX",
      category: "smartphones",
      price: 74999,
      comparePrice: 79999,
      rating: 4.7,
      reviewCount: 594,
      badge: "New",
      stock: 31,
      image: IMG.phone,
      gallery: [
        { src: IMG.phone, alt: "Modix Phone 12 Pro front view showing the edge-to-edge display" },
        { src: IMG.phone, alt: "Modix Phone 12 Pro rear view showing the triple camera module" },
        { src: IMG.phone, alt: "Modix Phone 12 Pro held at an angle showing the aluminium frame" }
      ],
      colors: [
        { name: "Charcoal", hex: "#17181C" },
        { name: "Electric Blue", hex: "#2F5DFF" },
        { name: "Off-White", hex: "#F5F6F8" }
      ],
      variantType: "storage",
      variants: ["128GB", "256GB", "512GB"],
      description: "The flagship Modix Phone 12 Pro pairs a 120Hz LTPO display with a triple 50MP camera system and a 5,000mAh battery for genuine two-day use.",
      features: [
        "6.7-inch 120Hz LTPO OLED display, 1600 nits peak brightness",
        "Triple 50MP camera system with 5x optical zoom",
        "5,000mAh battery with 65W wired and 30W wireless charging",
        "IP68 dust and water resistance",
        "On-device AI processing for photography and translation"
      ],
      specifications: [
        { label: "Display", value: "6.7\" 120Hz LTPO OLED, 1600 nits" },
        { label: "Chipset", value: "Modix M3 Pro, 3nm" },
        { label: "Storage Options", value: "128GB / 256GB / 512GB" },
        { label: "RAM", value: "12GB" },
        { label: "Camera", value: "50MP main + 48MP ultra-wide + 12MP telephoto (5x)" },
        { label: "Battery", value: "5,000mAh, 65W wired / 30W wireless" },
        { label: "Water Resistance", value: "IP68" },
        { label: "Connectivity", value: "5G, Wi-Fi 6E, Bluetooth 5.3, USB-C" },
        { label: "Weight", value: "196g" }
      ],
      boxContents: ["Modix Phone 12 Pro", "USB-C to USB-C cable", "SIM eject tool", "Clear protective case", "Quick start guide"],
      warranty: "1-year manufacturer warranty covering hardware defects, plus 6 months of complimentary screen protection replacement at Modix service centres.",
      faqs: [
        { q: "Does the box include a charger?", a: "In line with current e-waste standards, the box ships with a USB-C to USB-C cable but no wall adapter; Phone 12 Pro supports 65W wired fast charging with any compatible USB-C PD charger." },
        { q: "Is Phone 12 Pro compatible with wireless charging pads?", a: "Yes, it supports up to 30W wireless charging on any Qi-certified charging pad." },
        { q: "How much storage do I need?", a: "128GB suits most users, 256GB is the recommended balance for photos and apps, and 512GB is aimed at anyone shooting a lot of 4K video or storing large offline media libraries." },
        { q: "What does the warranty cover?", a: "Phone 12 Pro includes a 1-year manufacturer warranty against hardware defects, and Modix additionally offers complimentary screen protector replacement for the first 6 months at authorised service centres." }
      ]
    },
    {
      id: 6,
      sku: "MDX-PH-P12-128",
      slug: "modix-phone-12",
      name: "Modix Phone 12",
      brand: "MODIX",
      category: "smartphones",
      price: 49999,
      comparePrice: 54999,
      rating: 4.5,
      reviewCount: 407,
      badge: "Best Seller",
      stock: 47,
      image: IMG.phone,
      gallery: [
        { src: IMG.phone, alt: "Modix Phone 12 front view with the always-on display active" },
        { src: IMG.phone, alt: "Modix Phone 12 rear view showing the dual camera module" },
        { src: IMG.phone, alt: "Modix Phone 12 in hand showing the compact form factor" }
      ],
      colors: [
        { name: "Charcoal", hex: "#17181C" },
        { name: "Electric Blue", hex: "#2F5DFF" }
      ],
      variantType: "storage",
      variants: ["128GB", "256GB"],
      description: "Modix Phone 12 brings a 120Hz display, dual 50MP cameras and a full day of battery to a genuinely everyday price.",
      features: [
        "6.4-inch 120Hz OLED display",
        "Dual 50MP main + 12MP ultra-wide camera system",
        "4,500mAh battery with 45W fast charging",
        "IP67 dust and water resistance",
        "Stereo speakers tuned with Modix Studio audio profiles"
      ],
      specifications: [
        { label: "Display", value: "6.4\" 120Hz OLED" },
        { label: "Chipset", value: "Modix M3, 4nm" },
        { label: "Storage Options", value: "128GB / 256GB" },
        { label: "RAM", value: "8GB" },
        { label: "Camera", value: "50MP main + 12MP ultra-wide" },
        { label: "Battery", value: "4,500mAh, 45W wired charging" },
        { label: "Water Resistance", value: "IP67" },
        { label: "Connectivity", value: "5G, Wi-Fi 6, Bluetooth 5.2, USB-C" },
        { label: "Weight", value: "182g" }
      ],
      boxContents: ["Modix Phone 12", "USB-C to USB-C cable", "SIM eject tool", "Quick start guide"],
      warranty: "1-year manufacturer warranty covering hardware defects under normal use.",
      faqs: [
        { q: "Is Phone 12 5G compatible?", a: "Yes, Phone 12 supports 5G on all major network bands in addition to Wi-Fi 6 and Bluetooth 5.2." },
        { q: "How fast does it charge?", a: "Phone 12 supports 45W wired fast charging, reaching roughly 50% in about 20 minutes with a compatible USB-C PD charger (sold separately)." },
        { q: "What's included in the box?", a: "You receive the phone, a USB-C to USB-C cable, a SIM eject tool and a quick start guide; a wall adapter is not included." },
        { q: "What warranty does Phone 12 carry?", a: "It comes with a standard 1-year manufacturer warranty against hardware defects under normal use." }
      ]
    },
    {
      id: 7,
      sku: "MDX-PH-SE-128",
      slug: "modix-phone-se",
      name: "Modix Phone SE",
      brand: "MODIX",
      category: "smartphones",
      price: 26999,
      comparePrice: 26999,
      rating: 4.3,
      reviewCount: 289,
      badge: "",
      stock: 73,
      image: IMG.phone,
      gallery: [
        { src: IMG.phone, alt: "Modix Phone SE front view showing the compact 6.1-inch display" },
        { src: IMG.phone, alt: "Modix Phone SE rear view with the single camera module" },
        { src: IMG.phone, alt: "Modix Phone SE shown next to its packaging" }
      ],
      colors: [
        { name: "Off-White", hex: "#F5F6F8" },
        { name: "Charcoal", hex: "#17181C" }
      ],
      variantType: "storage",
      variants: ["64GB", "128GB"],
      description: "An honest, affordable smartphone with a 6.1-inch display, all-day battery and the essential specs done well.",
      features: [
        "6.1-inch 90Hz OLED display",
        "48MP main camera with night mode",
        "4,000mAh battery lasting a full day of mixed use",
        "IP54 splash resistance",
        "Clean software with 3 years of updates"
      ],
      specifications: [
        { label: "Display", value: "6.1\" 90Hz OLED" },
        { label: "Chipset", value: "Modix M2, 6nm" },
        { label: "Storage Options", value: "64GB / 128GB" },
        { label: "RAM", value: "6GB" },
        { label: "Camera", value: "48MP main with night mode" },
        { label: "Battery", value: "4,000mAh, 25W wired charging" },
        { label: "Water Resistance", value: "IP54 splash resistant" },
        { label: "Connectivity", value: "4G/5G, Wi-Fi 5, Bluetooth 5.1, USB-C" },
        { label: "Weight", value: "174g" }
      ],
      boxContents: ["Modix Phone SE", "USB-C to USB-C cable", "SIM eject tool", "Quick start guide"],
      warranty: "1-year manufacturer warranty covering hardware defects under normal use.",
      faqs: [
        { q: "Is Phone SE a good starter smartphone?", a: "Yes, it is designed as an accessible entry point into the Modix ecosystem with a 90Hz display, capable 48MP camera and 3 years of promised software updates." },
        { q: "Can it survive rain or splashes?", a: "Phone SE is IP54 rated, protecting against dust and splashing water, though it is not designed for submersion." },
        { q: "What's in the box?", a: "The phone, a USB-C to USB-C cable, a SIM eject tool and a quick start guide; a charger brick is sold separately." },
        { q: "What's the warranty period?", a: "Phone SE carries a 1-year manufacturer warranty against hardware defects under normal use." }
      ]
    },
    {
      id: 8,
      sku: "MDX-LP-AIR14-512",
      slug: "modix-book-air-14",
      name: "Modix Book Air 14",
      brand: "MODIX",
      category: "laptops",
      price: 89999,
      comparePrice: 96999,
      rating: 4.7,
      reviewCount: 221,
      badge: "New",
      stock: 19,
      image: IMG.laptop,
      gallery: [
        { src: IMG.laptop, alt: "Modix Book Air 14 open at a 45-degree angle showing the keyboard deck" },
        { src: IMG.laptop, alt: "Modix Book Air 14 closed, showing the thin aluminium lid" },
        { src: IMG.laptop, alt: "Modix Book Air 14 side profile showing port selection" }
      ],
      colors: [
        { name: "Silver", hex: "#C9CDD6" },
        { name: "Charcoal", hex: "#17181C" }
      ],
      variantType: "storage",
      variants: ["256GB", "512GB", "1TB"],
      description: "A 1.3kg fanless laptop with a 14-inch 120Hz display and 18 hours of battery life for people who work anywhere.",
      features: [
        "14-inch 120Hz IPS display with 500 nits brightness",
        "Fanless design stays silent under everyday workloads",
        "18-hour battery life on a full charge",
        "Modix M-series chip with dedicated AI acceleration",
        "1.3kg aluminium unibody chassis"
      ],
      specifications: [
        { label: "Display", value: "14\" 120Hz IPS, 500 nits" },
        { label: "Processor", value: "Modix M-series, 8-core" },
        { label: "Memory", value: "16GB unified" },
        { label: "Storage Options", value: "256GB / 512GB / 1TB SSD" },
        { label: "Battery Life", value: "Up to 18 hrs" },
        { label: "Ports", value: "2x USB-C (Thunderbolt), 1x USB-A, 3.5mm" },
        { label: "Weight", value: "1.3kg" },
        { label: "Compatibility", value: "macOS-style UI, Windows 11 dual-boot supported" }
      ],
      boxContents: ["Modix Book Air 14", "67W USB-C power adapter", "USB-C charging cable", "Quick start guide"],
      warranty: "1-year manufacturer warranty on hardware, extendable to 3 years with Modix Care+ at checkout.",
      faqs: [
        { q: "Can Modix Book Air 14 run Windows?", a: "Yes, Book Air 14 supports a Windows 11 dual-boot configuration in addition to its native OS, so it works for teams standardised on either platform." },
        { q: "How long does the battery really last?", a: "Modix rates Book Air 14 for up to 18 hours of mixed productivity use on a single charge, thanks to its fanless, power-efficient chip." },
        { q: "What charger is included?", a: "Every unit ships with a 67W USB-C power adapter and matching USB-C cable, both compatible with any USB-C PD device." },
        { q: "Can I extend the warranty?", a: "The standard 1-year hardware warranty can be extended to 3 years by adding Modix Care+ during checkout." }
      ]
    },
    {
      id: 9,
      sku: "MDX-LP-PRO16-1TB",
      slug: "modix-book-pro-16",
      name: "Modix Book Pro 16",
      brand: "MODIX",
      category: "laptops",
      price: 154999,
      comparePrice: 164999,
      rating: 4.8,
      reviewCount: 176,
      badge: "Editor's Pick",
      stock: 14,
      image: IMG.laptop,
      gallery: [
        { src: IMG.laptop, alt: "Modix Book Pro 16 open showing the mini-LED display" },
        { src: IMG.laptop, alt: "Modix Book Pro 16 rear vents for the active cooling system" },
        { src: IMG.laptop, alt: "Modix Book Pro 16 keyboard deck with backlit keys" }
      ],
      colors: [
        { name: "Charcoal", hex: "#17181C" },
        { name: "Silver", hex: "#C9CDD6" }
      ],
      variantType: "storage",
      variants: ["512GB", "1TB", "2TB"],
      description: "A 16-inch mini-LED powerhouse built for video editing and 3D work, with a dedicated GPU and active cooling.",
      features: [
        "16-inch mini-LED display with 1000 nits peak HDR brightness",
        "Dedicated discrete GPU for rendering and 3D workloads",
        "Active dual-fan cooling sustains full performance under load",
        "Six-speaker sound system tuned by the Modix Studio audio team",
        "1080p webcam with studio-quality noise-cancelling mics"
      ],
      specifications: [
        { label: "Display", value: "16\" mini-LED, 1000 nits HDR" },
        { label: "Processor", value: "Modix M-series Pro, 12-core" },
        { label: "Graphics", value: "Discrete GPU, 16-core" },
        { label: "Memory", value: "32GB unified" },
        { label: "Storage Options", value: "512GB / 1TB / 2TB SSD" },
        { label: "Battery Life", value: "Up to 14 hrs" },
        { label: "Ports", value: "3x USB-C (Thunderbolt), HDMI 2.1, SD card, 3.5mm" },
        { label: "Weight", value: "2.1kg" }
      ],
      boxContents: ["Modix Book Pro 16", "140W USB-C power adapter", "USB-C charging cable", "Quick start guide"],
      warranty: "1-year manufacturer warranty on hardware, extendable to 3 years with Modix Care+ at checkout.",
      faqs: [
        { q: "Is Book Pro 16 suitable for video editing?", a: "Yes, its discrete GPU, active cooling and mini-LED HDR display are specifically tuned for timeline scrubbing, colour grading and 3D rendering workloads." },
        { q: "Does the fan get loud under load?", a: "The dual-fan system is tuned to stay quiet during normal use and only becomes audible under sustained, heavy rendering workloads." },
        { q: "What storage size should creators choose?", a: "1TB is the recommended minimum for active video projects; 2TB suits professionals working with large raw footage libraries." },
        { q: "What's included and what's the warranty?", a: "The box includes a 140W USB-C adapter and cable alongside the laptop, backed by a 1-year hardware warranty extendable to 3 years via Modix Care+." }
      ]
    },
    {
      id: 10,
      sku: "MDX-LP-SLIM13-256",
      slug: "modix-book-slim-13",
      name: "Modix Book Slim 13",
      brand: "MODIX",
      category: "laptops",
      price: 64999,
      comparePrice: 64999,
      rating: 4.4,
      reviewCount: 143,
      badge: "",
      stock: 28,
      image: IMG.laptop,
      gallery: [
        { src: IMG.laptop, alt: "Modix Book Slim 13 open at a low angle showing the thin bezel display" },
        { src: IMG.laptop, alt: "Modix Book Slim 13 closed showing its 13-inch footprint" },
        { src: IMG.laptop, alt: "Modix Book Slim 13 carried in one hand to show its light weight" }
      ],
      colors: [
        { name: "Off-White", hex: "#F5F6F8" },
        { name: "Electric Blue", hex: "#2F5DFF" }
      ],
      variantType: "storage",
      variants: ["256GB", "512GB"],
      description: "A 1.1kg 13-inch laptop for students and everyday productivity, with a full day of battery and a durable magnesium shell.",
      features: [
        "13-inch IPS display with anti-glare coating",
        "1.1kg magnesium-alloy shell for easy daily carry",
        "12-hour battery life for a full day of classes or meetings",
        "Backlit keyboard with 1.3mm key travel",
        "Fingerprint reader integrated into the power button"
      ],
      specifications: [
        { label: "Display", value: "13\" IPS, anti-glare" },
        { label: "Processor", value: "Modix M-series Lite, 6-core" },
        { label: "Memory", value: "8GB unified" },
        { label: "Storage Options", value: "256GB / 512GB SSD" },
        { label: "Battery Life", value: "Up to 12 hrs" },
        { label: "Ports", value: "2x USB-C, 1x USB-A, 3.5mm" },
        { label: "Weight", value: "1.1kg" }
      ],
      boxContents: ["Modix Book Slim 13", "45W USB-C power adapter", "USB-C charging cable", "Quick start guide"],
      warranty: "1-year manufacturer warranty on hardware, extendable to 3 years with Modix Care+ at checkout.",
      faqs: [
        { q: "Is Book Slim 13 good for students?", a: "Its 1.1kg weight, 12-hour battery and durable magnesium shell were specifically chosen to suit daily carry between classes and long library sessions." },
        { q: "Does it have a fingerprint sensor?", a: "Yes, the fingerprint reader is built into the power button for quick, secure sign-in." },
        { q: "What's included in the box?", a: "The laptop ships with a 45W USB-C power adapter, matching cable and a quick start guide." },
        { q: "What warranty applies?", a: "A 1-year manufacturer hardware warranty is included, extendable to 3 years through Modix Care+." }
      ]
    },
    {
      id: 11,
      sku: "MDX-SH-HUB-CHR",
      slug: "modix-hub-smart-speaker",
      name: "Modix Hub Smart Speaker",
      brand: "MODIX",
      category: "smart-home",
      price: 6999,
      comparePrice: 7999,
      rating: 4.5,
      reviewCount: 267,
      badge: "Best Seller",
      stock: 55,
      image: IMG.hub,
      gallery: [
        { src: IMG.hub, alt: "Modix Hub Smart Speaker on a kitchen counter with its ambient LED ring lit" },
        { src: IMG.hub, alt: "Modix Hub Smart Speaker top view showing the touch controls" },
        { src: IMG.hub, alt: "Modix Hub Smart Speaker fabric-wrapped base detail" }
      ],
      colors: [
        { name: "Charcoal", hex: "#17181C" },
        { name: "Off-White", hex: "#F5F6F8" }
      ],
      variantType: "storage",
      variants: [],
      description: "A voice-controlled smart speaker that anchors your Modix Smart Home setup, with room-filling sound and a built-in hub radio for connected devices.",
      features: [
        "Built-in Thread and Zigbee hub controls compatible smart devices directly",
        "360° room-filling sound with adaptive EQ",
        "Far-field microphones with far-field voice pickup across a room",
        "Ambient LED ring shows status at a glance",
        "Works with the Modix Home app for routines and schedules"
      ],
      specifications: [
        { label: "Output", value: "1 x 3in woofer, 2 x tweeters" },
        { label: "Smart Hub", value: "Built-in Thread + Zigbee radio" },
        { label: "Connectivity", value: "Wi-Fi 6, Bluetooth 5.2" },
        { label: "Power", value: "Mains-powered, included adapter" },
        { label: "Microphones", value: "4-mic far-field array" },
        { label: "Compatibility", value: "Modix Home app, works with Cam and Glow" },
        { label: "Weight", value: "780g" }
      ],
      boxContents: ["Modix Hub Smart Speaker", "Power adapter (1.5m cable)", "Quick start guide"],
      warranty: "1-year limited warranty covering manufacturing defects in the speaker and internal hub radio.",
      faqs: [
        { q: "Does Hub work with other Modix Smart Home devices?", a: "Yes, Hub includes a built-in Thread and Zigbee radio, letting it directly control Modix Cam, Modix Glow bulbs, and other Thread/Zigbee accessories from the Modix Home app." },
        { q: "Does it need a separate smart home hub?", a: "No, Hub is the hub itself, so most Modix Smart Home setups only need one Hub speaker plus your Wi-Fi router." },
        { q: "Is it battery powered?", a: "Hub is mains-powered via the included adapter and is not designed for portable, battery-powered use." },
        { q: "What's the warranty?", a: "Hub carries a 1-year limited warranty covering manufacturing defects in both the speaker hardware and the built-in smart home radio." }
      ]
    },
    {
      id: 12,
      sku: "MDX-SH-CAM-WHT",
      slug: "modix-cam-indoor-security-camera",
      name: "Modix Cam Indoor Security Camera",
      brand: "MODIX",
      category: "smart-home",
      price: 3499,
      comparePrice: 3999,
      rating: 4.3,
      reviewCount: 194,
      badge: "",
      stock: 62,
      image: IMG.cam,
      gallery: [
        { src: IMG.cam, alt: "Modix Cam Indoor Security Camera on a shelf facing a living room" },
        { src: IMG.cam, alt: "Modix Cam Indoor Security Camera close-up of the lens and status LED" },
        { src: IMG.cam, alt: "Modix Cam Indoor Security Camera mounted on its swivel base" }
      ],
      colors: [
        { name: "Off-White", hex: "#F5F6F8" }
      ],
      variantType: "storage",
      variants: [],
      description: "A 2K indoor security camera with night vision, two-way audio and motion alerts sent straight to your phone.",
      features: [
        "2K resolution with clear digital zoom",
        "Infrared night vision up to 8 metres",
        "Two-way audio for talking to family or pets remotely",
        "Smart motion zones reduce false alerts",
        "Local microSD storage or optional Modix Cloud plan"
      ],
      specifications: [
        { label: "Resolution", value: "2K (2560 x 1440)" },
        { label: "Night Vision", value: "Infrared, up to 8m" },
        { label: "Field of View", value: "130° diagonal" },
        { label: "Connectivity", value: "Wi-Fi 6, 2.4GHz/5GHz" },
        { label: "Storage", value: "microSD (up to 256GB) or Modix Cloud" },
        { label: "Power", value: "USB-C, mains-powered" },
        { label: "Compatibility", value: "Modix Home app, works with Hub" }
      ],
      boxContents: ["Modix Cam camera", "Swivel mounting base", "USB-C power cable and adapter", "Mounting screws", "Quick start guide"],
      warranty: "1-year limited warranty covering manufacturing defects in the camera and mounting hardware.",
      faqs: [
        { q: "Do I need a subscription to use Modix Cam?", a: "No, Cam records to a local microSD card (sold separately, up to 256GB) at no extra cost; a Modix Cloud plan is available but entirely optional." },
        { q: "Can I see and hear who's at home from my phone?", a: "Yes, Cam streams live 2K video with two-way audio through the Modix Home app so you can view and speak in real time." },
        { q: "Does it work in the dark?", a: "Infrared night vision covers up to 8 metres, so Cam continues capturing clear footage with the lights off." },
        { q: "What's the warranty on Modix Cam?", a: "It carries a 1-year limited warranty covering manufacturing defects in the camera unit and its mounting base." }
      ]
    },
    {
      id: 13,
      sku: "MDX-SH-GLOW-4PK",
      slug: "modix-glow-smart-bulb-kit",
      name: "Modix Glow Smart Bulb Kit",
      brand: "MODIX",
      category: "smart-home",
      price: 2799,
      comparePrice: 3299,
      rating: 4.4,
      reviewCount: 331,
      badge: "New",
      stock: 89,
      image: IMG.glow,
      gallery: [
        { src: IMG.glow, alt: "Modix Glow Smart Bulb Kit showing four bulbs and packaging" },
        { src: IMG.glow, alt: "Modix Glow Smart Bulb glowing in warm white color temperature" },
        { src: IMG.glow, alt: "Modix Glow Smart Bulb glowing in electric blue accent color" }
      ],
      colors: [
        { name: "Off-White", hex: "#F5F6F8" }
      ],
      variantType: "storage",
      variants: ["2-Pack", "4-Pack"],
      description: "A 4-pack of tunable smart bulbs offering 16 million colours, voice control and schedules that sync with the rest of your Modix Smart Home.",
      features: [
        "16 million colours plus tunable white from warm to daylight",
        "No hub required, connects directly to Wi-Fi",
        "Group and schedule bulbs by room in the Modix Home app",
        "Works with Modix Hub voice commands",
        "Rated for 25,000 hours of use"
      ],
      specifications: [
        { label: "Brightness", value: "800 lumens (60W equivalent)" },
        { label: "Color Range", value: "16 million colors + tunable white 2700K–6500K" },
        { label: "Connectivity", value: "Wi-Fi 2.4GHz, no hub required" },
        { label: "Fitting", value: "E27 standard screw base" },
        { label: "Lifespan", value: "25,000 hours rated" },
        { label: "Compatibility", value: "Modix Home app, voice control via Hub" }
      ],
      boxContents: ["4 x Modix Glow smart bulbs", "Quick start guide"],
      warranty: "2-year limited warranty covering the LED elements and internal Wi-Fi module against manufacturing defects.",
      faqs: [
        { q: "Do I need Modix Hub to use Glow bulbs?", a: "No, Glow bulbs connect directly to your home Wi-Fi network, though pairing with Modix Hub adds convenient voice control." },
        { q: "How many colours can each bulb show?", a: "Each bulb can display 16 million colours plus a tunable white range from warm 2700K to cool daylight 6500K." },
        { q: "Will these fit my existing lamps?", a: "Glow bulbs use a standard E27 screw fitting, the most common household socket size." },
        { q: "What's the warranty on the bulb kit?", a: "The kit carries a 2-year limited warranty covering the LED elements and Wi-Fi module against manufacturing defects." }
      ]
    },
    {
      id: 14,
      sku: "MDX-WB-ACTIVE-BLK",
      slug: "modix-watch-active",
      name: "Modix Watch Active",
      brand: "MODIX",
      category: "wearables",
      price: 11999,
      comparePrice: 13499,
      rating: 4.5,
      reviewCount: 378,
      badge: "Best Seller",
      stock: 44,
      image: IMG.watch,
      gallery: [
        { src: IMG.watch, alt: "Modix Watch Active on a wrist showing the always-on display" },
        { src: IMG.watch, alt: "Modix Watch Active side profile showing the digital crown" },
        { src: IMG.watch, alt: "Modix Watch Active with an interchangeable sport band" }
      ],
      colors: [
        { name: "Charcoal", hex: "#17181C" },
        { name: "Electric Blue", hex: "#2F5DFF" }
      ],
      variantType: "storage",
      variants: ["41mm", "45mm"],
      description: "A fitness-focused smartwatch with continuous heart-rate tracking, built-in GPS and 7-day battery life.",
      features: [
        "Continuous heart-rate and blood-oxygen tracking",
        "Built-in GPS for accurate outdoor run and ride tracking",
        "7-day battery life in normal use, 2-day in always-on mode",
        "5ATM water resistance for swimming",
        "40+ workout modes with automatic detection"
      ],
      specifications: [
        { label: "Display", value: "1.4\" AMOLED, always-on option" },
        { label: "Case Sizes", value: "41mm / 45mm" },
        { label: "Battery Life", value: "7 days typical, 2 days always-on" },
        { label: "Sensors", value: "Heart rate, SpO2, accelerometer, GPS" },
        { label: "Water Resistance", value: "5ATM (swim-proof)" },
        { label: "Connectivity", value: "Bluetooth 5.2, Wi-Fi sync" },
        { label: "Compatibility", value: "iOS 14+, Android 9+" }
      ],
      boxContents: ["Modix Watch Active", "Sport band (extra size included)", "Magnetic charging puck", "Quick start guide"],
      warranty: "1-year limited warranty covering the case and internal electronics; bands are covered for 6 months.",
      faqs: [
        { q: "Can I swim with Watch Active?", a: "Yes, it carries a 5ATM water resistance rating suitable for swimming in pools and open water, though it should not be used for high-pressure activities like diving." },
        { q: "Does it need a phone nearby to track GPS runs?", a: "No, Watch Active has built-in GPS, so it can record accurate outdoor routes and pace even when your phone is left at home." },
        { q: "How long does the battery last?", a: "Typical use gets about 7 days per charge; enabling the always-on display reduces that to roughly 2 days." },
        { q: "Is Watch Active compatible with both iPhone and Android?", a: "Yes, it pairs with iOS 14+ and Android 9+ devices via the Modix Health app over Bluetooth 5.2." }
      ]
    },
    {
      id: 15,
      sku: "MDX-WB-BAND-BLK",
      slug: "modix-band-fit-tracker",
      name: "Modix Band Fit Tracker",
      brand: "MODIX",
      category: "wearables",
      price: 3299,
      comparePrice: 3299,
      rating: 4.2,
      reviewCount: 512,
      badge: "",
      stock: 96,
      image: IMG.band,
      gallery: [
        { src: IMG.band, alt: "Modix Band Fit Tracker on a wrist displaying step count" },
        { src: IMG.band, alt: "Modix Band Fit Tracker close-up of the slim AMOLED display" },
        { src: IMG.band, alt: "Modix Band Fit Tracker shown with its magnetic charging cable" }
      ],
      colors: [
        { name: "Charcoal", hex: "#17181C" },
        { name: "Off-White", hex: "#F5F6F8" },
        { name: "Electric Blue", hex: "#2F5DFF" }
      ],
      variantType: "storage",
      variants: [],
      description: "A slim, lightweight fitness band with 14-day battery life, sleep tracking and 24/7 heart-rate monitoring.",
      features: [
        "14-day battery life on a single charge",
        "24/7 heart-rate and sleep-stage tracking",
        "5ATM water resistance for swimming",
        "Slim 1.1-inch AMOLED display",
        "Smartphone notifications and find-my-phone"
      ],
      specifications: [
        { label: "Display", value: "1.1\" AMOLED" },
        { label: "Battery Life", value: "14 days typical use" },
        { label: "Sensors", value: "Heart rate, SpO2, sleep tracking" },
        { label: "Water Resistance", value: "5ATM (swim-proof)" },
        { label: "Connectivity", value: "Bluetooth 5.1" },
        { label: "Weight", value: "24g" },
        { label: "Compatibility", value: "iOS 14+, Android 9+" }
      ],
      boxContents: ["Modix Band Fit Tracker", "Magnetic charging cable", "Quick start guide"],
      warranty: "1-year limited warranty covering the tracker body and internal electronics.",
      faqs: [
        { q: "How long does the battery really last?", a: "With typical use including heart-rate and sleep tracking, Band lasts about 14 days between charges." },
        { q: "Can I wear Band in the shower or pool?", a: "Yes, its 5ATM rating covers swimming and showering, though hot water saunas and diving are not recommended." },
        { q: "Does it show phone notifications?", a: "Yes, Band displays call, message and app notifications once paired with the Modix Health app." },
        { q: "What's in the box?", a: "You receive the tracker, a magnetic charging cable and a quick start guide, covered by a 1-year limited warranty." }
      ]
    },
    {
      id: 16,
      sku: "MDX-WB-PRO-45",
      slug: "modix-watch-pro",
      name: "Modix Watch Pro",
      brand: "MODIX",
      category: "wearables",
      price: 18999,
      comparePrice: 20999,
      rating: 4.7,
      reviewCount: 132,
      badge: "Editor's Pick",
      stock: 21,
      image: IMG.watch,
      gallery: [
        { src: IMG.watch, alt: "Modix Watch Pro on a wrist showing the titanium case" },
        { src: IMG.watch, alt: "Modix Watch Pro underside showing the sensor array" },
        { src: IMG.watch, alt: "Modix Watch Pro with a rugged outdoor strap" }
      ],
      colors: [
        { name: "Charcoal", hex: "#17181C" },
        { name: "Silver", hex: "#C9CDD6" }
      ],
      variantType: "storage",
      variants: ["45mm", "49mm"],
      description: "A titanium-cased smartwatch built for multi-day expeditions, with dual-frequency GPS and 14-day battery life.",
      features: [
        "Titanium case with sapphire crystal display",
        "Dual-frequency GPS for precise tracking in dense terrain",
        "14-day battery life, 30-day in ultra-low-power mode",
        "10ATM water resistance and MIL-STD-810H durability testing",
        "Offline maps and route navigation"
      ],
      specifications: [
        { label: "Display", value: "1.6\" AMOLED, sapphire crystal" },
        { label: "Case Material", value: "Titanium" },
        { label: "Case Sizes", value: "45mm / 49mm" },
        { label: "Battery Life", value: "14 days typical, 30 days ultra-low-power" },
        { label: "GPS", value: "Dual-frequency, offline maps" },
        { label: "Water Resistance", value: "10ATM" },
        { label: "Durability", value: "MIL-STD-810H tested" },
        { label: "Compatibility", value: "iOS 14+, Android 9+" }
      ],
      boxContents: ["Modix Watch Pro", "Rugged outdoor strap", "Magnetic charging puck", "Quick start guide"],
      warranty: "2-year limited warranty reflecting the titanium build, covering the case, crystal and internal electronics.",
      faqs: [
        { q: "Is Watch Pro built for outdoor expeditions?", a: "Yes, its titanium case, sapphire crystal, MIL-STD-810H durability testing and 10ATM water resistance are all specifically chosen for multi-day outdoor and diving use." },
        { q: "Does it work without a phone connection for navigation?", a: "Yes, offline maps and dual-frequency GPS let you navigate routes even without cellular or phone connectivity." },
        { q: "How long does the battery last on an expedition?", a: "Typical use gets 14 days per charge, extending to roughly 30 days when ultra-low-power mode is enabled." },
        { q: "Why is the warranty longer than Watch Active?", a: "Watch Pro's titanium case and sapphire crystal carry a 2-year limited warranty, reflecting its higher-grade materials and construction." }
      ]
    }
  ];

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */

  function getAllProducts() { return PRODUCTS.slice(); }

  function getCategories() { return CATEGORIES.slice(); }

  function getCategoryBySlug(slug) {
    return CATEGORIES.filter(function (c) { return c.slug === slug; })[0] || null;
  }

  function getProductBySlug(slug) {
    return PRODUCTS.filter(function (p) { return p.slug === slug; })[0] || null;
  }

  function getProductById(id) {
    id = Number(id);
    return PRODUCTS.filter(function (p) { return p.id === id; })[0] || null;
  }

  function getProductsByCategory(catSlug) {
    if (!catSlug) return getAllProducts();
    return PRODUCTS.filter(function (p) { return p.category === catSlug; });
  }

  function getRelatedProducts(product, limit) {
    limit = limit || 4;
    var pool = PRODUCTS.filter(function (p) { return p.category === product.category && p.id !== product.id; });
    if (pool.length < limit) {
      var extra = PRODUCTS.filter(function (p) { return p.category !== product.category; });
      pool = pool.concat(extra);
    }
    return pool.slice(0, limit);
  }

  function formatPrice(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
  }

  function discountPercent(product) {
    if (!product.comparePrice || product.comparePrice <= product.price) return 0;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  }

  function starsSVG(count) {
    var full = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z"/></svg>';
    var html = "";
    for (var i = 0; i < 5; i++) {
      html += '<span style="opacity:' + (i < Math.round(count) ? "1" : "0.28") + '">' + full + "</span>";
    }
    return html;
  }

  function ratingHTML(product) {
    return (
      '<span class="rating">' +
        '<span class="rating__stars" aria-hidden="true">' + starsSVG(product.rating) + "</span>" +
        '<span class="rating__count">' + product.rating.toFixed(1) + " (" + product.reviewCount + ")</span>" +
      "</span>"
    );
  }

  function wishlistIconSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20.5s-7.5-4.6-10-9.4C.5 7.6 2.4 4 6 4c2.1 0 3.7 1.2 4.7 2.6 1-1.4 2.6-2.6 4.7-2.6 3.6 0 5.5 3.6 4 7.1-2.5 4.8-10 9.4-10 9.4z"/></svg>';
  }

  function productCardHTML(product) {
    var discount = discountPercent(product);
    var badgeHTML = product.badge
      ? '<span class="badge ' + (product.badge === "Best Seller" ? "badge--accent" : "") + '">' + product.badge + "</span>"
      : (discount > 0 ? '<span class="badge badge--sale">-' + discount + '%</span>' : "");
    var priceHTML = '<span class="price">' + formatPrice(product.price) + "</span>" +
      (discount > 0 ? ' <span class="price--compare">' + formatPrice(product.comparePrice) + "</span>" : "");
    var cat = getCategoryBySlug(product.category);

    return (
      '<article class="product-card" data-product-id="' + product.id + '">' +
        '<div class="product-card__media">' +
          badgeHTML +
          '<button class="wishlist-toggle" type="button" data-wishlist-toggle data-id="' + product.id + '" aria-pressed="false" aria-label="Add ' + product.name + ' to wishlist">' + wishlistIconSVG() + "</button>" +
          '<a href="product.html?slug=' + product.slug + '" aria-label="View ' + product.name + '">' +
            '<img class="img-primary" src="' + product.image + '" alt="' + product.name + '" width="400" height="400" loading="lazy">' +
            '<img class="img-secondary" src="' + product.gallery[1].src + '" alt="" width="400" height="400" loading="lazy" aria-hidden="true">' +
          "</a>" +
          '<div class="product-card__quick-add">' +
            '<button class="btn btn-dark btn-block btn-sm" type="button" data-quick-add data-id="' + product.id + '">Quick Add</button>' +
          "</div>" +
        "</div>" +
        '<div class="product-card__body">' +
          '<span class="product-card__category">' + (cat ? cat.name : "") + "</span>" +
          '<h3 class="product-card__name"><a href="product.html?slug=' + product.slug + '">' + product.name + "</a></h3>" +
          ratingHTML(product) +
          '<div class="product-card__actions-row">' +
            '<div class="price-row">' + priceHTML + "</div>" +
            '<button class="quick-view-btn" type="button" data-quick-view data-id="' + product.id + '">Quick View</button>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function productCardsHTML(products) {
    return products.map(productCardHTML).join("");
  }

  window.MODIX = window.MODIX || {};
  window.MODIX_PRODUCTS = PRODUCTS;
  window.MODIX_CATEGORIES = CATEGORIES;
  window.MODIX.data = {
    getAllProducts: getAllProducts,
    getCategories: getCategories,
    getCategoryBySlug: getCategoryBySlug,
    getProductBySlug: getProductBySlug,
    getProductById: getProductById,
    getProductsByCategory: getProductsByCategory,
    getRelatedProducts: getRelatedProducts,
    formatPrice: formatPrice,
    discountPercent: discountPercent,
    ratingHTML: ratingHTML,
    starsSVG: starsSVG,
    wishlistIconSVG: wishlistIconSVG,
    productCardHTML: productCardHTML,
    productCardsHTML: productCardsHTML
  };
})();
