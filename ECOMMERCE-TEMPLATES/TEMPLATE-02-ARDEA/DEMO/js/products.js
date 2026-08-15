/* ==========================================================================
   ARDEA — js/products.js
   Centralized product + room data and shared render helpers.
   URL conventions used across the demo:
     - product.html?slug=<product-slug>
     - category.html?room=<room-slug>
     - shop.html?category=<room-slug>&sort=<key>&page=<n>
     - search.html?q=<query>
   ========================================================================== */

(function (global) {
  "use strict";

  var IMG = "assets/images/";

  /* ---------------------------------------------------------------------
     Rooms (categories). Slugs double as the ?room= / ?category= param.
     --------------------------------------------------------------------- */
  var ROOMS = [
    {
      slug: "living-room",
      label: "Living Room",
      image: IMG + "ardea-category-living-room.svg",
      tagline: "Seating and tables built for slow mornings and long evenings.",
      intro: "Our living room collection centers on solid oak and walnut frames, hand-finished joinery, and upholstery in undyed linen and bouclé. Every lounge chair, sofa and table is designed to be repaired and re-covered rather than replaced, so the pieces you bring home age into the room instead of out of it."
    },
    {
      slug: "bedroom",
      label: "Bedroom",
      image: IMG + "ardea-category-bedroom.svg",
      tagline: "Bed frames, storage and bedside pieces in quiet, natural tones.",
      intro: "The Ardea bedroom range favours slow-grown European oak and washed linen over lacquer and veneer. Bed frames are built on a slatted oak base for mattress airflow, and nightstands and wardrobes share the same jointing details so a room furnished piece by piece still reads as one considered set."
    },
    {
      slug: "kitchen",
      label: "Kitchen",
      image: IMG + "ardea-category-kitchen.svg",
      tagline: "Islands and stools in honed marble and oiled oak.",
      intro: "Kitchen pieces are built to withstand daily use: honed marble tops that soften with age rather than showing wear, and oak carcasses finished with a food-safe hardwax oil. Each island and stool in this collection is sized for standard counter heights, with assembly notes included on every product page."
    },
    {
      slug: "lighting",
      label: "Lighting",
      image: IMG + "ardea-category-lighting.svg",
      tagline: "Floor, pendant and table lighting in brass, rattan and ceramic.",
      intro: "Ardea lighting pairs warm-dimming LED-compatible sockets with natural shades — handwoven rattan, hand-thrown ceramic and brushed brass — so the fixtures read as furniture rather than fittings. Every listing notes bulb base, maximum wattage and hardwiring requirements where relevant."
    },
    {
      slug: "decor",
      label: "Decor",
      image: IMG + "ardea-category-decor.svg",
      tagline: "Vases, mirrors and textiles that finish a room.",
      intro: "Our decor edit is made up of small-batch, artisan-produced objects — hand-thrown terracotta, hand-tied rattan and stonewashed linen — chosen to layer onto the larger furniture pieces. Because each item is handmade, expect gentle variation in glaze, weave and dye between units."
    }
  ];

  /* ---------------------------------------------------------------------
     Products
     --------------------------------------------------------------------- */
  var PRODUCTS = [
    {
      id: 1,
      name: "Ardea Oak Lounge Chair",
      slug: "ardea-oak-lounge-chair",
      category: "living-room",
      price: 32900,
      comparePrice: 38900,
      image: IMG + "ardea-oak-lounge-chair.svg",
      gallery: [
        { src: IMG + "ardea-oak-lounge-chair.svg", alt: "Ardea Oak Lounge Chair with a curved solid-oak frame and taupe linen cushions, three-quarter view" },
        { src: IMG + "ardea-category-living-room.svg", alt: "Ardea Oak Lounge Chair styled beside a sofa in a sunlit living room corner" },
        { src: IMG + "ardea-craftsmanship.svg", alt: "Close view of the hand-shaped oak joinery used on the Ardea Oak Lounge Chair" }
      ],
      description: "A solid European oak frame steam-bent into a single curved silhouette, upholstered in undyed heavyweight linen over a webbed-suspension seat.",
      rating: 4.8,
      reviewCount: 126,
      badge: "Bestseller",
      colors: ["Natural Oak / Sand Linen", "Smoked Oak / Charcoal Linen"],
      dimensions: "W74 x D82 x H78 cm, Seat H43 cm",
      stock: 14,
      sku: "ARD-LR-OLC-001",
      brand: "ARDEA",
      features: [
        "Steam-bent solid oak frame, no veneer or plywood",
        "Webbed jute suspension for a supportive, breathable seat",
        "Removable, zip-off cushion covers in heavyweight linen",
        "Felt floor glides included to protect hard flooring"
      ],
      materials: "Frame: solid FSC-certified European oak, oiled finish. Cushions: heavyweight 100% linen over high-resilience foam with a down-alternative topper. Suspension: woven jute webbing.",
      careInstructions: "Dust the oak frame weekly with a dry microfibre cloth; re-oil every 12–18 months with food-safe furniture oil. Spot clean linen with a damp cloth and mild soap; covers may be dry cleaned. Keep out of direct, prolonged sunlight to avoid uneven fading.",
      faqs: [
        { q: "What wood is the frame made from, and is it solid or veneered?", a: "The frame is solid, FSC-certified European oak — there is no plywood, MDF or veneer anywhere in the structure, including inside the arms and legs." },
        { q: "What are the exact dimensions and seat height?", a: "The chair measures W74 x D82 x H78 cm with a seat height of 43 cm and a seat depth of 52 cm, comfortable for most adult heights." },
        { q: "How is this chair delivered, and does it need assembly?", a: "It ships fully assembled in a reinforced cardboard shell with corner protection. No assembly is required — simply unbox, remove the protective wrap, and attach the included felt floor glides." },
        { q: "How do I clean the linen cushion covers?", a: "Spot clean with a damp cloth and a mild, undyed soap. For a deeper clean, the covers unzip and can be dry cleaned; we don't recommend home machine washing as it can shrink the linen weave." }
      ]
    },
    {
      id: 2,
      name: "Ardea Heritage Linen Sofa",
      slug: "ardea-heritage-linen-sofa",
      category: "living-room",
      price: 84900,
      comparePrice: 96900,
      image: IMG + "ardea-linen-sofa.svg",
      gallery: [
        { src: IMG + "ardea-linen-sofa.svg", alt: "Ardea Heritage Linen Sofa, three-seat, in undyed linen with rolled bolster arms" },
        { src: IMG + "ardea-category-living-room.svg", alt: "Ardea Heritage Linen Sofa positioned against a sand-toned living room wall" },
        { src: IMG + "ardea-editorial-spotlight.svg", alt: "Editorial styling of the Ardea Heritage Linen Sofa with a lounge chair and side table" }
      ],
      description: "A deep, three-seat sofa with a kiln-dried hardwood frame, pocket-sprung cushions and rolled bolster arms upholstered in stonewashed linen.",
      rating: 4.9,
      reviewCount: 84,
      badge: "New",
      colors: ["Undyed Linen", "Deep Olive Linen"],
      dimensions: "L212 x D96 x H84 cm, Seat H45 cm",
      stock: 6,
      sku: "ARD-LR-HLS-002",
      brand: "ARDEA",
      features: [
        "Kiln-dried hardwood frame for long-term shape retention",
        "Pocket-sprung seat cushions with a feather-and-fibre topper",
        "Stonewashed linen upholstery, pre-shrunk for a soft hand-feel",
        "Removable seat and back cushion covers"
      ],
      materials: "Frame: kiln-dried hardwood with webbed suspension. Cushions: pocket springs wrapped in feather-and-fibre blend. Upholstery: 100% stonewashed linen.",
      careInstructions: "Plump and rotate cushions weekly for even wear. Vacuum with an upholstery attachment monthly. Professional upholstery cleaning is recommended annually; spot test any cleaner on a hidden seam first.",
      faqs: [
        { q: "Will the sofa fit through a standard doorway?", a: "The sofa arrives in one piece measuring 212 x 96 x 84 cm. It fits through standard 76 cm-wide doorways when tilted; our delivery notes include a walkthrough checklist before dispatch." },
        { q: "What is the cushion fill, and will it soften over time?", a: "Cushions use pocket springs wrapped in a feather-and-fibre blend, which will soften slightly with use — we recommend plumping and rotating weekly to keep the seat even." },
        { q: "Is assembly required on delivery?", a: "No structural assembly is needed. Our two-person delivery team unwraps the sofa, positions it in your room, and removes all packaging." },
        { q: "How do I care for the linen upholstery day to day?", a: "Vacuum monthly with an upholstery attachment and blot spills immediately with a dry cloth. We recommend professional cleaning once a year to maintain the fabric's texture." }
      ]
    },
    {
      id: 3,
      name: "Ardea Walnut Coffee Table",
      slug: "ardea-walnut-coffee-table",
      category: "living-room",
      price: 28900,
      comparePrice: null,
      image: IMG + "ardea-walnut-coffee-table.svg",
      gallery: [
        { src: IMG + "ardea-walnut-coffee-table.svg", alt: "Ardea Walnut Coffee Table with a live-edge top and tapered legs" },
        { src: IMG + "ardea-category-living-room.svg", alt: "Ardea Walnut Coffee Table placed in front of a linen sofa" },
        { src: IMG + "ardea-craftsmanship.svg", alt: "Detail of the hand-sanded walnut grain on the Ardea Walnut Coffee Table" }
      ],
      description: "A single slab of American black walnut with a live-edge profile, finished with tapered dowel legs and a hardwax oil that highlights the natural grain.",
      rating: 4.7,
      reviewCount: 58,
      badge: null,
      colors: ["Natural Walnut"],
      dimensions: "L120 x D62 x H38 cm",
      stock: 22,
      sku: "ARD-LR-WCT-003",
      brand: "ARDEA",
      features: [
        "Solid American black walnut top, one continuous slab",
        "Live-edge detail preserved along one long side",
        "Removable dowel legs for easier transport through doorways",
        "Hardwax oil finish, heat- and water-resistant when cared for"
      ],
      materials: "Top: solid American black walnut, hardwax oil finish. Legs: solid walnut dowel, threaded steel fixing.",
      careInstructions: "Wipe with a dry or barely damp cloth; avoid leaving wet glasses without a coaster, as prolonged moisture can dull the oil finish. Re-oil once a year with a walnut-safe hardwax oil to maintain water resistance.",
      faqs: [
        { q: "Is the top solid wood or veneer over MDF?", a: "The top is a single solid slab of American black walnut — there is no veneer, plywood core or MDF used anywhere in the table." },
        { q: "What do the exact dimensions and clearance look like?", a: "The table measures L120 x D62 x H38 cm, sized to sit comfortably in front of a three-seat sofa with roughly 40 cm of walking clearance." },
        { q: "How is it packed for delivery and is assembly required?", a: "The tabletop ships separately from the two dowel legs, which thread into pre-fitted steel inserts — assembly takes under five minutes with no tools beyond your hands." },
        { q: "How do I maintain the live-edge and the oil finish?", a: "Dust regularly and wipe spills promptly. Re-oil annually with a food-safe hardwax oil, working with the grain, to keep the live edge from drying out or splitting." }
      ]
    },
    {
      id: 4,
      name: "Ardea Bouclé Swivel Armchair",
      slug: "ardea-boucle-swivel-armchair",
      category: "living-room",
      price: 41900,
      comparePrice: 46900,
      image: IMG + "ardea-oak-lounge-chair.svg",
      gallery: [
        { src: IMG + "ardea-oak-lounge-chair.svg", alt: "Ardea Bouclé Swivel Armchair in cream bouclé on a swivel oak base" },
        { src: IMG + "ardea-category-living-room.svg", alt: "Ardea Bouclé Swivel Armchair paired with a walnut side table" },
        { src: IMG + "ardea-editorial-spotlight.svg", alt: "Editorial view of the Ardea Bouclé Swivel Armchair in a reading nook" }
      ],
      description: "A rounded, cocoon-shaped armchair upholstered in textured bouclé, set on a solid oak swivel base for easy movement within a seating group.",
      rating: 4.6,
      reviewCount: 47,
      badge: "New",
      colors: ["Cream Bouclé", "Clay Bouclé"],
      dimensions: "W80 x D78 x H72 cm, Seat H44 cm",
      stock: 11,
      sku: "ARD-LR-BSA-004",
      brand: "ARDEA",
      features: [
        "360-degree swivel on a solid oak base",
        "High-density foam seat with a bouclé-wrapped bolster back",
        "Rounded silhouette designed to sit well at an angle to a sofa",
        "Stain-resistant weave for everyday family use"
      ],
      materials: "Upholstery: polyester-blend bouclé with a stain-resistant weave finish. Frame: engineered hardwood with a solid oak swivel base. Fill: high-density foam.",
      careInstructions: "Vacuum the bouclé weekly with a soft brush attachment to lift dust from the loops. Blot spills immediately; avoid rubbing, which can pull the bouclé texture. The oak base can be dusted with a dry cloth.",
      faqs: [
        { q: "Does the chair swivel, and does it lock in place?", a: "Yes, the seat rotates a full 360 degrees on its oak base and is free-swivelling rather than locking, so it can be angled toward a sofa or a book with equal ease." },
        { q: "What is bouclé made from, and is it durable?", a: "Our bouclé is a polyester-blend looped weave finished for stain resistance, chosen for its durability under everyday use while keeping the soft, textured look of natural wool bouclé." },
        { q: "What are the seat dimensions?", a: "Overall size is W80 x D78 x H72 cm with a seat height of 44 cm — a slightly lower, rounder seat than the Oak Lounge Chair." },
        { q: "Does this chair need assembly?", a: "Minimal assembly is required: the swivel base attaches to the seat shell with four bolts, included, and takes about ten minutes." }
      ]
    },
    {
      id: 5,
      name: "Ardea Oak Bed Frame",
      slug: "ardea-oak-bed-frame",
      category: "bedroom",
      price: 58900,
      comparePrice: 65900,
      image: IMG + "ardea-oak-bed-frame.svg",
      gallery: [
        { src: IMG + "ardea-oak-bed-frame.svg", alt: "Ardea Oak Bed Frame with a slatted headboard and platform base, queen size" },
        { src: IMG + "ardea-category-bedroom.svg", alt: "Ardea Oak Bed Frame styled with a walnut nightstand" },
        { src: IMG + "ardea-craftsmanship.svg", alt: "Detail of the mortise-and-tenon joinery on the Ardea Oak Bed Frame headboard" }
      ],
      description: "A low platform bed with a slatted solid-oak headboard and sprung slat base, designed to be used with or without a box spring.",
      rating: 4.8,
      reviewCount: 63,
      badge: "Bestseller",
      colors: ["Natural Oak", "Smoked Oak"],
      dimensions: "Queen: L216 x W162 x H92 cm (headboard), platform H32 cm",
      stock: 9,
      sku: "ARD-BD-OBF-005",
      brand: "ARDEA",
      features: [
        "Solid oak headboard with hand-cut slats",
        "Sprung slatted base included — no box spring required",
        "Low platform profile for a grounded, architectural look",
        "Mortise-and-tenon joinery at every structural connection"
      ],
      materials: "Frame and headboard: solid European oak, oiled finish. Base: beech sprung slats on a steel centre rail for queen and king sizes.",
      careInstructions: "Dust the headboard with a dry cloth weekly. Re-oil every 12–18 months. Check bolt connections for tightness twice a year, particularly after moving the bed.",
      faqs: [
        { q: "What sizes is this bed frame available in?", a: "The Oak Bed Frame is available in Queen (216 x 162 cm) and King (216 x 193 cm); both use the same headboard design scaled to width." },
        { q: "Do I need a box spring, or does it work with a slat base alone?", a: "No box spring is needed. The frame includes a sprung beech slat base rated for memory foam, hybrid and spring mattresses up to 45 kg per sleeping side." },
        { q: "How long does assembly take and what tools are needed?", a: "Assembly takes 40–60 minutes for two people. All bolts, an Allen key and a step-by-step printed guide are included; no additional tools are required." },
        { q: "How is the bed frame delivered?", a: "It ships flat-packed in three cartons via our furniture delivery partner, with room-of-choice delivery and packaging removal available at checkout." }
      ]
    },
    {
      id: 6,
      name: "Ardea Washed Linen Duvet Set",
      slug: "ardea-washed-linen-duvet-set",
      category: "bedroom",
      price: 9800,
      comparePrice: 11800,
      image: IMG + "ardea-oak-bed-frame.svg",
      gallery: [
        { src: IMG + "ardea-oak-bed-frame.svg", alt: "Ardea Washed Linen Duvet Set in sand tone styled on an oak bed frame" },
        { src: IMG + "ardea-category-bedroom.svg", alt: "Ardea Washed Linen Duvet Set folded, showing the stonewashed linen texture" },
        { src: IMG + "ardea-terracotta-vase-set.svg", alt: "Ardea Washed Linen Duvet Set styled with terracotta decor accessories" }
      ],
      description: "A stonewashed European flax linen duvet cover and two pillowcases, garment-washed for a soft, lived-in hand-feel from the first night.",
      rating: 4.7,
      reviewCount: 112,
      badge: "New",
      colors: ["Sand", "Olive", "Charcoal"],
      dimensions: "Queen duvet cover 228 x 228 cm, includes 2 pillowcases 50 x 75 cm",
      stock: 34,
      sku: "ARD-BD-WLD-006",
      brand: "ARDEA",
      features: [
        "100% European flax linen, stonewashed for immediate softness",
        "Corner ties and a hidden button closure to keep the duvet insert in place",
        "Breathable, temperature-regulating weave for warm or cool climates",
        "Includes two matching pillowcases with envelope closures"
      ],
      materials: "100% European flax linen, OEKO-TEX certified dyes, stonewashed finish.",
      careInstructions: "Machine wash cold on a gentle cycle with like colours. Tumble dry low or line dry; linen softens further with each wash. Iron on a warm setting while slightly damp if a crisper finish is preferred.",
      faqs: [
        { q: "What size duvet insert does this cover fit?", a: "The set is cut for a standard Queen duvet insert at 228 x 228 cm; a King version at 259 x 234 cm is available as a separate size option." },
        { q: "Is the linen pre-shrunk, and will it shrink further after washing?", a: "The linen is stonewashed and pre-shrunk during manufacturing. Expect no more than 1–2% additional shrinkage over the first few home washes." },
        { q: "How do I keep the linen soft and prevent excessive wrinkling?", a: "Wash cold, tumble dry on low, and remove promptly to smooth by hand — linen is meant to keep a relaxed, textured wrinkle rather than a pressed finish." },
        { q: "How is this delivered — folded or in a box?", a: "It ships folded inside a reusable cotton drawstring bag within a compact cardboard box, sent by standard courier rather than furniture delivery." }
      ]
    },
    {
      id: 7,
      name: "Ardea Walnut Nightstand",
      slug: "ardea-walnut-nightstand",
      category: "bedroom",
      price: 15900,
      comparePrice: null,
      image: IMG + "ardea-walnut-coffee-table.svg",
      gallery: [
        { src: IMG + "ardea-walnut-coffee-table.svg", alt: "Ardea Walnut Nightstand with a single drawer and open lower shelf" },
        { src: IMG + "ardea-category-bedroom.svg", alt: "Ardea Walnut Nightstand beside the Ardea Oak Bed Frame" },
        { src: IMG + "ardea-craftsmanship.svg", alt: "Detail of the dovetail drawer joinery on the Ardea Walnut Nightstand" }
      ],
      description: "A compact bedside table in solid walnut with a soft-close drawer and an open lower shelf, dovetailed by hand at every drawer corner.",
      rating: 4.6,
      reviewCount: 39,
      badge: null,
      colors: ["Natural Walnut", "Smoked Oak"],
      dimensions: "W48 x D40 x H55 cm",
      stock: 26,
      sku: "ARD-BD-WNS-007",
      brand: "ARDEA",
      features: [
        "Hand-cut dovetail joints on all four drawer corners",
        "Soft-close drawer runners rated for 50,000 open cycles",
        "Open lower shelf for books or a reading lamp",
        "Solid walnut throughout, including drawer sides and back"
      ],
      materials: "Solid American black walnut with a low-VOC hardwax oil finish; drawer runners in powder-coated steel.",
      careInstructions: "Dust with a dry cloth; avoid furniture sprays containing silicone, which can build up on the oil finish. Re-oil every 12–18 months.",
      faqs: [
        { q: "How much weight can the drawer and lower shelf hold?", a: "The drawer is rated to 8 kg and the open lower shelf to 12 kg, sufficient for books, a lamp or bedside essentials." },
        { q: "What are the full dimensions?", a: "The nightstand measures W48 x D40 x H55 cm, matched in height to sit level with the Oak Bed Frame mattress line." },
        { q: "Is assembly required?", a: "Only the legs need attaching — four bolts, included, with an Allen key provided. It takes about ten minutes." },
        { q: "Can I buy these in a pair to match on both sides of the bed?", a: "Yes, select the quantity you need at checkout; each unit ships in its own protective carton so a pair arrives identically finished." }
      ]
    },
    {
      id: 8,
      name: "Ardea Cane Wardrobe",
      slug: "ardea-cane-wardrobe",
      category: "bedroom",
      price: 72900,
      comparePrice: 79900,
      image: IMG + "ardea-oak-bed-frame.svg",
      gallery: [
        { src: IMG + "ardea-oak-bed-frame.svg", alt: "Ardea Cane Wardrobe with hand-woven cane door panels and an oak frame" },
        { src: IMG + "ardea-category-bedroom.svg", alt: "Ardea Cane Wardrobe positioned in a bedroom corner" },
        { src: IMG + "ardea-craftsmanship.svg", alt: "Detail of the hand-woven cane webbing on the Ardea Cane Wardrobe doors" }
      ],
      description: "A two-door wardrobe with a solid oak frame and hand-woven natural cane door panels, fitted with a full-width hanging rail and one internal shelf.",
      rating: 4.7,
      reviewCount: 28,
      badge: null,
      colors: ["Natural Oak / Natural Cane", "Smoked Oak / Natural Cane"],
      dimensions: "W120 x D58 x H196 cm",
      stock: 5,
      sku: "ARD-BD-CWD-008",
      brand: "ARDEA",
      features: [
        "Hand-woven natural cane panels set into solid oak door frames",
        "Full-width hanging rail plus one fixed internal shelf",
        "Soft-close door hinges rated for daily use",
        "Levelling feet for stability on uneven flooring"
      ],
      materials: "Frame and doors: solid European oak with hand-woven natural cane infill. Hardware: soft-close steel hinges, brass-finished handles.",
      careInstructions: "Dust the cane panels gently with a soft brush or vacuum on low suction; avoid soaking, as cane can loosen if left damp. Re-oil the oak frame every 12–18 months.",
      faqs: [
        { q: "Is the cane webbing durable, and what happens if a strand loosens?", a: "Natural cane is hand-woven under tension and typically lasts 10+ years with normal use; individual strands can be professionally re-woven if damaged, and we can advise on local restorers." },
        { q: "What are the interior dimensions and hanging space?", a: "Internally the wardrobe offers 112 cm of hanging rail width and one fixed shelf above it; overall footprint is W120 x D58 x H196 cm." },
        { q: "How is this delivered and assembled?", a: "It arrives via two-person white-glove delivery, partially pre-assembled with doors and cane panels fitted at the workshop; final assembly on-site takes roughly 45 minutes." },
        { q: "Can the wardrobe be disassembled again if I move?", a: "Yes, the frame is bolted rather than glued at every joint, so it can be disassembled and reassembled for a move using the same hardware." }
      ]
    },
    {
      id: 9,
      name: "Ardea Marble Kitchen Island",
      slug: "ardea-marble-kitchen-island",
      category: "kitchen",
      price: 118900,
      comparePrice: 132900,
      image: IMG + "ardea-marble-kitchen-island.svg",
      gallery: [
        { src: IMG + "ardea-marble-kitchen-island.svg", alt: "Ardea Marble Kitchen Island with a honed marble top and oak cabinetry base" },
        { src: IMG + "ardea-category-kitchen.svg", alt: "Ardea Marble Kitchen Island styled with two oak counter stools" },
        { src: IMG + "ardea-craftsmanship.svg", alt: "Detail of the honed marble edge on the Ardea Marble Kitchen Island" }
      ],
      description: "A freestanding kitchen island with a honed Carrara marble top, solid oak cabinetry base, and two soft-close drawers plus an open shelf for everyday storage.",
      rating: 4.9,
      reviewCount: 21,
      badge: "Limited",
      colors: ["Honed Carrara / Natural Oak"],
      dimensions: "W150 x D80 x H92 cm",
      stock: 3,
      sku: "ARD-KT-MKI-009",
      brand: "ARDEA",
      features: [
        "Honed Carrara marble top, 3 cm thickness",
        "Solid oak cabinetry base with two soft-close drawers",
        "Open lower shelf sized for pans and serving boards",
        "Levelling feet rated for uneven kitchen flooring"
      ],
      materials: "Top: honed Carrara marble, sealed and food-safe. Base: solid European oak with plywood-backed panel construction, hardwax oil finish.",
      careInstructions: "Wipe spills immediately, especially acidic liquids like wine or citrus, which can etch unsealed marble; the top ships pre-sealed but we recommend re-sealing annually with a food-safe stone sealer. Use trivets for hot pans.",
      faqs: [
        { q: "Is the marble top sealed, and how do I prevent staining?", a: "Yes, the top is pre-sealed with a food-safe stone sealer at the workshop. Wipe up spills promptly, especially wine, oil and citrus, and re-seal annually to maintain stain resistance." },
        { q: "What are the exact footprint and counter height?", a: "The island measures W150 x D80 x H92 cm, matched to standard counter height so our Oak Counter Stool sits at a comfortable 65 cm seat height beneath it." },
        { q: "How is the island delivered, and is assembly required?", a: "It ships in two sections — the marble top and the pre-assembled oak base — via two-person white-glove delivery. The installer places the top and levels the feet on site; no tools needed from you." },
        { q: "Does the island need to be fixed to the floor or plumbed in?", a: "No, it's fully freestanding with no plumbing or electrical connection required, so it can be repositioned within your kitchen at any time." }
      ]
    },
    {
      id: 10,
      name: "Ardea Oak Counter Stool",
      slug: "ardea-oak-counter-stool",
      category: "kitchen",
      price: 10900,
      comparePrice: null,
      image: IMG + "ardea-marble-kitchen-island.svg",
      gallery: [
        { src: IMG + "ardea-marble-kitchen-island.svg", alt: "Ardea Oak Counter Stool with a curved seat, shown beside a kitchen island" },
        { src: IMG + "ardea-category-kitchen.svg", alt: "Pair of Ardea Oak Counter Stools at a kitchen island" },
        { src: IMG + "ardea-craftsmanship.svg", alt: "Detail of the sculpted oak seat on the Ardea Oak Counter Stool" }
      ],
      description: "A backless counter stool with a sculpted solid-oak seat and a footrest ring, sized to sit level with standard kitchen counter and island heights.",
      rating: 4.5,
      reviewCount: 44,
      badge: null,
      colors: ["Natural Oak", "Smoked Oak"],
      dimensions: "W40 x D38 x H65 cm (seat height)",
      stock: 40,
      sku: "ARD-KT-OCS-010",
      brand: "ARDEA",
      features: [
        "Sculpted solid oak seat, contoured for comfort without a cushion",
        "Full footrest ring for support at counter height",
        "Stackable design for compact storage when not in use",
        "Felt floor glides included"
      ],
      materials: "Solid European oak, hardwax oil finish.",
      careInstructions: "Wipe with a dry or barely damp cloth. Re-oil once a year. Avoid dragging across hard flooring; lift to reposition to protect both the stool legs and your floors.",
      faqs: [
        { q: "What counter or island height is this stool designed for?", a: "At 65 cm seat height, it's designed for standard 90–92 cm counters and islands, leaving comfortable knee clearance." },
        { q: "Do the stools stack for storage?", a: "Yes, the frame is designed to stack up to four stools high, useful for smaller kitchens or seasonal storage." },
        { q: "Is any assembly required?", a: "The stool ships fully assembled; simply unbox and attach the included felt floor glides to the base of each leg." },
        { q: "Can I order stools in a different finish to my kitchen island's oak base?", a: "Yes, Natural Oak and Smoked Oak are both available regardless of which finish you chose for the island, so you can mix tones deliberately if you prefer contrast." }
      ]
    },
    {
      id: 11,
      name: "Ardea Arc Floor Lamp",
      slug: "ardea-arc-floor-lamp",
      category: "lighting",
      price: 18900,
      comparePrice: 21900,
      image: IMG + "ardea-arc-floor-lamp.svg",
      gallery: [
        { src: IMG + "ardea-arc-floor-lamp.svg", alt: "Ardea Arc Floor Lamp with a brass arm and honed marble base" },
        { src: IMG + "ardea-category-lighting.svg", alt: "Ardea Arc Floor Lamp arching over a lounge chair" },
        { src: IMG + "ardea-editorial-spotlight.svg", alt: "Ardea Arc Floor Lamp styled in an evening living room scene" }
      ],
      description: "A brushed-brass arc lamp on a honed marble base, with an adjustable arm that swings up to 180 degrees to light a reading chair or sofa end from above.",
      rating: 4.7,
      reviewCount: 52,
      badge: null,
      colors: ["Brushed Brass / White Marble", "Brushed Brass / Black Marble"],
      dimensions: "Base D30 cm, H165–190 cm adjustable, Arm reach 90 cm",
      stock: 17,
      sku: "ARD-LT-AFL-011",
      brand: "ARDEA",
      features: [
        "Telescoping arc arm adjusts height from 165–190 cm",
        "Honed marble base weighted for stability under the arc",
        "In-line foot dimmer switch",
        "Compatible with dimmable E27 LED bulbs up to 9W"
      ],
      materials: "Arm and stem: brushed brass-finished steel. Base: honed marble. Shade: powder-coated aluminium.",
      careInstructions: "Dust the brass arm with a dry cloth; avoid metal polish, which can strip the brushed finish. Wipe the marble base with a barely damp cloth and dry immediately to avoid water marks.",
      faqs: [
        { q: "What bulb type does this lamp use, and is one included?", a: "It takes a standard E27 base bulb, dimmable, up to 9W LED equivalent. A warm-white LED bulb is included in the box." },
        { q: "How far does the arm reach, and is the height adjustable?", a: "The telescoping stem adjusts from 165–190 cm and the arm reaches 90 cm horizontally, enough to position light directly over a lounge chair or sofa end from a base set beside it." },
        { q: "Is the marble base heavy enough to prevent tipping?", a: "Yes, the honed marble base weighs 9 kg specifically to counterbalance the extended arc arm; the lamp passes our internal tip-resistance testing at full extension." },
        { q: "Does it need to be hardwired, or does it plug into a standard outlet?", a: "It plugs into any standard household outlet via a 2.5 m fabric-braided cord; no hardwiring or electrician is required." }
      ]
    },
    {
      id: 12,
      name: "Ardea Rattan Pendant Light",
      slug: "ardea-rattan-pendant-light",
      category: "lighting",
      price: 12900,
      comparePrice: null,
      image: IMG + "ardea-rattan-pendant-light.svg",
      gallery: [
        { src: IMG + "ardea-rattan-pendant-light.svg", alt: "Ardea Rattan Pendant Light with a hand-woven natural rattan shade over a dining table" },
        { src: IMG + "ardea-category-lighting.svg", alt: "Pair of Ardea Rattan Pendant Lights hung above a kitchen island" },
        { src: IMG + "ardea-craftsmanship.svg", alt: "Detail of the hand-woven rattan weave on the Ardea Rattan Pendant Light" }
      ],
      description: "A dome-shaped pendant shade hand-woven from natural rattan over a steel frame, casting a soft, dappled glow suited to dining tables and kitchen islands.",
      rating: 4.6,
      reviewCount: 67,
      badge: "New",
      colors: ["Natural Rattan"],
      dimensions: "D45 x H30 cm shade, cord adjustable to 150 cm",
      stock: 29,
      sku: "ARD-LT-RPL-012",
      brand: "ARDEA",
      features: [
        "Hand-woven natural rattan shade over a powder-coated steel frame",
        "Adjustable fabric cord, trimmable to your ceiling height",
        "Suits single-pendant or multi-pendant runs above islands and tables",
        "Compatible with dimmable E27 LED bulbs up to 12W"
      ],
      materials: "Shade: natural rattan hand-woven over a steel armature. Canopy and cord: powder-coated steel with braided fabric cable.",
      careInstructions: "Dust with a soft, dry brush to clear the rattan weave; avoid water, which can loosen the natural fibre over time. Keep away from direct steam exposure such as above an open stovetop.",
      faqs: [
        { q: "Does this pendant need to be hardwired by an electrician?", a: "Yes, as a ceiling-mounted pendant it should be installed by a qualified electrician to your existing ceiling rose or junction box; it is not a plug-in fixture." },
        { q: "Can I hang several of these together over an island or table?", a: "Yes, the rattan shade is designed for multi-pendant runs — we typically recommend three fixtures at 40 cm spacing over a standard kitchen island." },
        { q: "What bulb does it take and is one included?", a: "It takes a standard E27 base, dimmable, up to 12W LED equivalent; a warm-white LED bulb is included." },
        { q: "How do I adjust the hanging height?", a: "The fabric cord can be shortened at installation to suit your ceiling height, from a maximum drop of 150 cm down to as little as 40 cm above the shade." }
      ]
    },
    {
      id: 13,
      name: "Ardea Ceramic Table Lamp",
      slug: "ardea-ceramic-table-lamp",
      category: "lighting",
      price: 7900,
      comparePrice: 8900,
      image: IMG + "ardea-arc-floor-lamp.svg",
      gallery: [
        { src: IMG + "ardea-arc-floor-lamp.svg", alt: "Ardea Ceramic Table Lamp with a hand-thrown terracotta base and linen shade" },
        { src: IMG + "ardea-category-lighting.svg", alt: "Ardea Ceramic Table Lamp on a walnut nightstand" },
        { src: IMG + "ardea-terracotta-vase-set.svg", alt: "Ardea Ceramic Table Lamp styled beside a terracotta vase trio" }
      ],
      description: "A hand-thrown terracotta lamp base finished with a matte glaze, paired with a natural linen drum shade for a warm, diffused light.",
      rating: 4.5,
      reviewCount: 38,
      badge: null,
      colors: ["Terracotta / Natural Linen", "Sand / Natural Linen"],
      dimensions: "D22 x H46 cm",
      stock: 31,
      sku: "ARD-LT-CTL-013",
      brand: "ARDEA",
      features: [
        "Hand-thrown ceramic base, each piece individually glazed",
        "Natural linen drum shade for a soft, even light spread",
        "In-line rotary switch on the cord",
        "Compatible with dimmable E14 LED bulbs up to 7W"
      ],
      materials: "Base: hand-thrown ceramic with matte glaze. Shade: natural linen over a card frame. Cord: braided fabric with an in-line switch.",
      careInstructions: "Dust the ceramic base with a dry cloth; the linen shade can be lightly vacuumed on a low setting. Keep the base away from direct impact, as hand-thrown ceramic can chip.",
      faqs: [
        { q: "Is each lamp base identical, or does the ceramic vary?", a: "Because each base is hand-thrown and individually glazed, expect gentle variation in glaze tone and texture between units — this is a feature of the process, not a defect." },
        { q: "What bulb should I use?", a: "It takes an E14 base, dimmable, up to 7W LED equivalent; a warm-white LED bulb is included." },
        { q: "Is the lamp base heavy enough to be stable on a nightstand?", a: "Yes, the ceramic base weighs 1.4 kg, giving it a low, stable centre of gravity suited to bedside use." },
        { q: "How is this shipped safely given the ceramic material?", a: "It ships in a double-walled box with a moulded foam insert cradling the base separately from the shade, and arrives fully assembled aside from fitting the shade on top." }
      ]
    },
    {
      id: 14,
      name: "Ardea Terracotta Vase Trio",
      slug: "ardea-terracotta-vase-trio",
      category: "decor",
      price: 3800,
      comparePrice: 4600,
      image: IMG + "ardea-terracotta-vase-set.svg",
      gallery: [
        { src: IMG + "ardea-terracotta-vase-set.svg", alt: "Ardea Terracotta Vase Trio in three graduated heights on a console" },
        { src: IMG + "ardea-category-decor.svg", alt: "Ardea Terracotta Vase Trio styled with dried grasses" },
        { src: IMG + "ardea-craftsmanship.svg", alt: "Detail of the hand-thrown texture on the Ardea Terracotta Vase Trio" }
      ],
      description: "A set of three hand-thrown terracotta vases in graduated heights, left unglazed on the exterior to show the natural clay texture.",
      rating: 4.8,
      reviewCount: 91,
      badge: "Bestseller",
      colors: ["Natural Terracotta"],
      dimensions: "H18 / H26 / H34 cm, D12–16 cm",
      stock: 48,
      sku: "ARD-DC-TVT-014",
      brand: "ARDEA",
      features: [
        "Set of three hand-thrown vases in coordinated, graduated heights",
        "Unglazed exterior finish showing natural terracotta texture",
        "Glazed, water-sealed interior suitable for fresh or dried stems",
        "Each piece individually thrown, so texture varies slightly"
      ],
      materials: "Hand-thrown terracotta clay, glazed interior for water resistance, unglazed exterior finish.",
      careInstructions: "Wipe the exterior with a dry cloth; the unglazed surface can absorb water rings, so wipe up any exterior moisture promptly. The interior glaze allows for fresh flowers with water.",
      faqs: [
        { q: "Can these hold water for fresh flowers, or are they for dried stems only?", a: "The interior is glazed and water-sealed, so all three vases can safely hold water for fresh flowers, in addition to dried arrangements." },
        { q: "What are the exact sizes of each of the three vases?", a: "The trio includes heights of 18 cm, 26 cm and 34 cm, with diameters ranging from 12–16 cm, designed to be displayed together or separately." },
        { q: "Will my set look exactly like the product photos?", a: "Each vase is individually hand-thrown, so expect gentle variation in surface texture and exact proportions between your set and the photos, and between different sets." },
        { q: "How should I clean the unglazed terracotta exterior?", a: "Dust with a dry or barely damp cloth. Because the exterior is unglazed and porous, avoid soaking it or leaving it in standing water, which can cause water rings or staining." }
      ]
    },
    {
      id: 15,
      name: "Ardea Handwoven Wall Mirror",
      slug: "ardea-handwoven-wall-mirror",
      category: "decor",
      price: 13900,
      comparePrice: 15900,
      image: IMG + "ardea-terracotta-vase-set.svg",
      gallery: [
        { src: IMG + "ardea-terracotta-vase-set.svg", alt: "Ardea Handwoven Wall Mirror with a rattan frame above a console table" },
        { src: IMG + "ardea-category-decor.svg", alt: "Ardea Handwoven Wall Mirror styled in an entryway" },
        { src: IMG + "ardea-craftsmanship.svg", alt: "Detail of the hand-woven rattan edge on the Ardea Handwoven Wall Mirror" }
      ],
      description: "A round wall mirror framed in hand-woven natural rattan, with a bevelled glass centre and a hidden D-ring hanger for wall mounting.",
      rating: 4.7,
      reviewCount: 34,
      badge: null,
      colors: ["Natural Rattan"],
      dimensions: "D70 cm, D4 cm depth",
      stock: 20,
      sku: "ARD-DC-HWM-015",
      brand: "ARDEA",
      features: [
        "Hand-woven natural rattan frame, each one uniquely patterned",
        "Bevelled centre glass for a soft edge highlight",
        "Hidden D-ring hanger, wall anchor included",
        "Lightweight frame suitable for plaster or drywall mounting"
      ],
      materials: "Frame: natural rattan hand-woven over a plywood ring. Mirror: bevelled glass.",
      careInstructions: "Dust the rattan frame with a soft brush. Clean the glass with a standard glass cleaner applied to a cloth, never sprayed directly onto the frame.",
      faqs: [
        { q: "How much does the mirror weigh, and what wall fixing is needed?", a: "It weighs 3.2 kg and includes a hidden D-ring hanger plus a wall anchor rated for that weight on standard drywall or plaster." },
        { q: "What is the exact diameter?", a: "The mirror measures 70 cm in diameter with a 4 cm depth, including the woven rattan frame." },
        { q: "Is the glass bevelled or flat?", a: "The centre glass has a bevelled edge, which gives a subtle highlight around the mirror's perimeter rather than a flat-cut edge." },
        { q: "How is this packaged for delivery given the glass?", a: "It ships in a double-walled box with a fitted foam ring cradling the mirror face-up, and a glass-handling label for our courier partner." }
      ]
    },
    {
      id: 16,
      name: "Ardea Linen Throw Pillow Duo",
      slug: "ardea-linen-throw-pillow-duo",
      category: "decor",
      price: 4200,
      comparePrice: null,
      image: IMG + "ardea-terracotta-vase-set.svg",
      gallery: [
        { src: IMG + "ardea-terracotta-vase-set.svg", alt: "Ardea Linen Throw Pillow Duo in sand and terracotta on a sofa" },
        { src: IMG + "ardea-category-decor.svg", alt: "Ardea Linen Throw Pillow Duo styled with decor accessories" },
        { src: IMG + "ardea-linen-sofa.svg", alt: "Ardea Linen Throw Pillow Duo arranged on the Ardea Heritage Linen Sofa" }
      ],
      description: "Two heavyweight linen throw cushion covers with a feather-down insert included, finished with a flanged edge and a hidden zip closure.",
      rating: 4.6,
      reviewCount: 76,
      badge: null,
      colors: ["Sand + Terracotta", "Olive + Charcoal"],
      dimensions: "50 x 50 cm each, set of 2",
      stock: 55,
      sku: "ARD-DC-LTP-016",
      brand: "ARDEA",
      features: [
        "Set of two 50 x 50 cm covers in complementary tones",
        "Feather-down inserts included, not sold separately",
        "Flanged edge detail and hidden zip closure",
        "Pre-washed heavyweight linen for immediate softness"
      ],
      materials: "Covers: 100% heavyweight linen, pre-washed. Inserts: feather-and-down fill in a cotton ticking casing.",
      careInstructions: "Remove inserts before washing covers on a cold, gentle cycle. Line dry or tumble dry low. Spot clean where possible to preserve the flanged edge shape.",
      faqs: [
        { q: "Are the inserts included, or do I need to buy them separately?", a: "Feather-down inserts are included with both covers in the set — there's nothing else to purchase to use them straight away." },
        { q: "What size are the cushions?", a: "Each cushion measures 50 x 50 cm; the set includes two cushions in the two-tone colourway you select." },
        { q: "Can the covers be removed and washed?", a: "Yes, each cover has a hidden zip closure so the insert can be removed before washing the linen cover separately." },
        { q: "Will the two colours in the duo match exactly to the photos?", a: "Dye lots can vary slightly between production runs, so very minor tonal variation from the photos is possible, though both cushions within your set are cut from the same dye lot." }
      ]
    }
  ];

  /* ---------------------------------------------------------------------
     Sample review snippets used to render the homepage "Customer Reviews"
     section and product review lists.
     NOTE (production): these are static demo quotes tied to the sample
     product data above. In production this must be replaced with a real
     reviews feed (e.g. Judge.me / Yotpo / a CMS-backed reviews table) —
     do not ship AggregateRating or review content sourced from this file.
     --------------------------------------------------------------------- */
  var REVIEWS = [
    { name: "Priya M.", location: "Bengaluru", rating: 5, title: "Exactly as described, and then some", body: "The Oak Lounge Chair is the first piece of furniture we've bought that feels like it was actually built by someone, not stamped out. The oil finish smell on arrival was lovely too.", product: "Ardea Oak Lounge Chair" },
    { name: "Rohit K.", location: "Pune", rating: 5, title: "Sofa arrived faster than expected", body: "Was ready for a long wait given it's made to order, but the Heritage Linen Sofa arrived in three weeks and the two-person delivery team was careful and quick.", product: "Ardea Heritage Linen Sofa" },
    { name: "Ananya S.", location: "Mumbai", rating: 4, title: "Beautiful grain, needs a coaster habit", body: "Walnut Coffee Table looks stunning in person — just make sure everyone in the house uses coasters, the live edge shows every ring if you don't.", product: "Ardea Walnut Coffee Table" },
    { name: "Devika R.", location: "Delhi", rating: 5, title: "Bed frame assembly was genuinely easy", body: "I was dreading flat-pack furniture but the instructions were clear and it only took my partner and me about 45 minutes.", product: "Ardea Oak Bed Frame" },
    { name: "Karthik N.", location: "Chennai", rating: 5, title: "Marble island is the centrepiece now", body: "Everyone who visits comments on the island first. The honed finish hides fingerprints far better than the polished marble we had before.", product: "Ardea Marble Kitchen Island" },
    { name: "Meera J.", location: "Hyderabad", rating: 4, title: "Lovely warm light from the pendant", body: "Hung three of the Rattan Pendant Lights over our kitchen island — the light through the weave is exactly the mood we wanted.", product: "Ardea Rattan Pendant Light" }
  ];

  /* ---------------------------------------------------------------------
     Helpers
     --------------------------------------------------------------------- */
  function formatINR(amount) {
    if (amount === null || amount === undefined) return "";
    try {
      return "₹" + Number(amount).toLocaleString("en-IN");
    } catch (e) {
      return "₹" + amount;
    }
  }

  function getAllProducts() {
    return PRODUCTS.slice();
  }

  function getProductBySlug(slug) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
    }
    return null;
  }

  function getProductsByRoom(room) {
    if (!room || room === "all") return PRODUCTS.slice();
    return PRODUCTS.filter(function (p) { return p.category === room; });
  }

  function getRoomBySlug(slug) {
    for (var i = 0; i < ROOMS.length; i++) {
      if (ROOMS[i].slug === slug) return ROOMS[i];
    }
    return null;
  }

  function getRelatedProducts(product, count) {
    count = count || 4;
    var pool = PRODUCTS.filter(function (p) {
      return p.category === product.category && p.id !== product.id;
    });
    if (pool.length < count) {
      var fillers = PRODUCTS.filter(function (p) {
        return p.id !== product.id && pool.indexOf(p) === -1;
      });
      pool = pool.concat(fillers);
    }
    return pool.slice(0, count);
  }

  function discountPercent(product) {
    if (!product.comparePrice || product.comparePrice <= product.price) return 0;
    return Math.round((1 - product.price / product.comparePrice) * 100);
  }

  function renderStars(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.5;
    var html = "";
    for (var i = 0; i < 5; i++) {
      if (i < full) {
        html += '<svg class="star star--full" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.7 5.9 6.3.6-4.8 4.3 1.4 6.2L10 15.6l-5.6 2.9 1.4-6.2L1 8l6.3-.6z"/></svg>';
      } else if (i === full && half) {
        html += '<svg class="star star--half" viewBox="0 0 20 20" aria-hidden="true"><defs><clipPath id="halfclip' + i + Math.random().toString(36).slice(2) + '"><rect x="0" y="0" width="10" height="20"/></clipPath></defs><path d="M10 1.5l2.7 5.9 6.3.6-4.8 4.3 1.4 6.2L10 15.6l-5.6 2.9 1.4-6.2L1 8l6.3-.6z"/></svg>';
      } else {
        html += '<svg class="star star--empty" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.7 5.9 6.3.6-4.8 4.3 1.4 6.2L10 15.6l-5.6 2.9 1.4-6.2L1 8l6.3-.6z"/></svg>';
      }
    }
    return html;
  }

  function isInWishlist(id) {
    try {
      var w = JSON.parse(localStorage.getItem("ardea_wishlist") || "[]");
      return w.indexOf(id) !== -1;
    } catch (e) { return false; }
  }

  /**
   * Build a product card as an HTML string. Used on shop / category / home
   * / search / related-products grids so markup stays identical everywhere.
   */
  function productCardHTML(product, opts) {
    opts = opts || {};
    var lazy = opts.lazy !== false;
    var discount = discountPercent(product);
    var badgeHTML = "";
    if (product.badge) {
      badgeHTML += '<span class="badge badge--' + product.badge.toLowerCase().replace(/\s+/g, "-") + '">' + product.badge + "</span>";
    }
    if (discount > 0) {
      badgeHTML += '<span class="badge badge--sale">-' + discount + "%</span>";
    }
    var secondaryImg = (product.gallery && product.gallery[1]) ? product.gallery[1].src : product.image;
    var wished = isInWishlist(product.id);
    var priceHTML = '<span class="price-current">' + formatINR(product.price) + "</span>";
    if (product.comparePrice) {
      priceHTML += '<span class="price-compare">' + formatINR(product.comparePrice) + "</span>";
    }
    return (
      '<article class="product-card" data-product-id="' + product.id + '" data-category="' + product.category + '">' +
        '<div class="product-card__media">' +
          '<a href="product.html?slug=' + product.slug + '" class="product-card__link" aria-label="View ' + product.name + '">' +
            '<img class="product-card__img product-card__img--primary" src="' + product.image + '" alt="' + product.name + ', ' + product.category.replace("-", " ") + '" width="600" height="750"' + (lazy ? ' loading="lazy"' : "") + '>' +
            '<img class="product-card__img product-card__img--hover" src="' + secondaryImg + '" alt="" width="600" height="750" loading="lazy" aria-hidden="true">' +
          "</a>" +
          '<div class="product-card__badges">' + badgeHTML + "</div>" +
          '<button type="button" class="icon-btn product-card__wishlist' + (wished ? " is-active" : "") + '" data-wishlist-toggle data-product-id="' + product.id + '" aria-pressed="' + wished + '" aria-label="Add ' + product.name + ' to wishlist">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-10-9.6C.4 7.6 2 4 5.6 4c2 0 3.6 1.2 4.4 2.6C10.8 5.2 12.4 4 14.4 4 18 4 19.6 7.6 18 10.9c-2.5 5-10 9.6-10 9.6z"/></svg>' +
          "</button>" +
          '<div class="product-card__actions">' +
            '<button type="button" class="btn btn--dark btn--sm product-card__quickadd" data-quick-add data-product-id="' + product.id + '">Quick Add</button>' +
            '<button type="button" class="btn btn--outline btn--sm product-card__quickview" data-quick-view data-product-id="' + product.id + '">Quick View</button>' +
          "</div>" +
        "</div>" +
        '<div class="product-card__body">' +
          '<p class="product-card__category">' + product.category.replace("-", " ") + "</p>" +
          '<h3 class="product-card__name"><a href="product.html?slug=' + product.slug + '">' + product.name + "</a></h3>" +
          '<div class="product-card__rating" aria-label="Rated ' + product.rating + ' out of 5">' +
            '<span class="stars">' + renderStars(product.rating) + "</span>" +
            '<span class="rating-count">(' + product.reviewCount + ")</span>" +
          "</div>" +
          '<div class="product-card__price">' + priceHTML + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  global.ArdeaData = {
    ROOMS: ROOMS,
    PRODUCTS: PRODUCTS,
    REVIEWS: REVIEWS,
    formatINR: formatINR,
    getAllProducts: getAllProducts,
    getProductBySlug: getProductBySlug,
    getProductsByRoom: getProductsByRoom,
    getRoomBySlug: getRoomBySlug,
    getRelatedProducts: getRelatedProducts,
    discountPercent: discountPercent,
    renderStars: renderStars,
    productCardHTML: productCardHTML
  };
})(window);
