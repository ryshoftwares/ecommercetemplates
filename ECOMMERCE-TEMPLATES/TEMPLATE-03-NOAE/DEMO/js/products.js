/* =========================================================================
   NOAÉ — Centralized Product Data & Render Helpers
   Single source of truth for all product data across the demo site.
   All prices in INR (₹). Do not duplicate product objects elsewhere.
   ========================================================================= */

(function () {
  "use strict";

  var NOAE_PRODUCTS = [
    {
      id: "1",
      slug: "renewal-hydrating-serum",
      name: "Renewal Hydrating Serum",
      brand: "NOAÉ",
      category: "Skincare",
      price: 1899,
      comparePrice: 2299,
      image: "assets/images/noae-dropper-bottle-rose.svg",
      gallery: [
        "assets/images/noae-dropper-bottle-rose.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-skincare.svg"
      ],
      description:
        "A featherweight serum layering 2% hyaluronic acid with niacinamide to flood skin with moisture and visibly soften the look of fine dry lines within two weeks.",
      rating: 4.8,
      reviewCount: 214,
      badge: "Bestseller",
      variants: [
        { size: "30ml", price: 1899, sku: "NOAE-RHS-30" },
        { size: "50ml", price: 2699, sku: "NOAE-RHS-50" }
      ],
      skinType: ["Dry", "Combination", "All"],
      stock: 42,
      sku: "NOAE-RHS-30",
      keyIngredients: ["2% Hyaluronic Acid", "Niacinamide", "Panthenol", "Squalane"],
      features: [
        "Multi-weight hyaluronic acid for surface and deep hydration",
        "Fragrance-free, suitable for daily AM/PM use",
        "Lightweight gel-serum texture that layers under moisturizer"
      ],
      howToUse:
        "After cleansing and toning, apply 3-4 drops to damp skin morning and night. Gently press into face and neck, then follow with Cloud Cream Moisturizer to seal in hydration.",
      storage: "Store below 25°C away from direct sunlight. Keep cap tightly closed. Best used within 6 months of opening.",
      faqs: [
        { q: "Is this serum suitable for oily or acne-prone skin?", a: "Yes — it is oil-free and non-comedogenic, though it is formulated primarily for dry and combination skin. Oily skin types often prefer using a thinner layer at night." },
        { q: "Can I use this with Vitamin C Brightening Drops?", a: "Yes. Apply Vitamin C Brightening Drops first in the morning, let absorb for 60 seconds, then follow with Renewal Hydrating Serum to lock in both actives." },
        { q: "How long until I see results?", a: "Most users notice a visible bounce and softness within 3-5 days, with continued improvement in fine dry lines over 2-4 weeks of consistent use." },
        { q: "Does it contain fragrance?", a: "No. The formula is completely fragrance-free, making it suitable for sensitive and reactive skin." }
      ]
    },
    {
      id: "2",
      slug: "cloud-cream-moisturizer",
      name: "Cloud Cream Moisturizer",
      brand: "NOAÉ",
      category: "Skincare",
      price: 1649,
      comparePrice: null,
      image: "assets/images/noae-cream-jar-sage.svg",
      gallery: [
        "assets/images/noae-cream-jar-sage.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-skincare.svg"
      ],
      description:
        "A whipped ceramide-rich moisturizer that melts into a cloud-soft cushion, reinforcing the skin barrier while calming visible redness and tightness.",
      rating: 4.7,
      reviewCount: 168,
      badge: "Bestseller",
      variants: [
        { size: "50ml", price: 1649, sku: "NOAE-CCM-50" },
        { size: "100ml", price: 2799, sku: "NOAE-CCM-100" }
      ],
      skinType: ["Dry", "Combination", "All"],
      stock: 55,
      sku: "NOAE-CCM-50",
      keyIngredients: ["Ceramide Complex", "Oat Extract", "Shea Butter", "Centella Asiatica"],
      features: [
        "Whipped, air-light texture that never feels greasy",
        "Barrier-strengthening ceramide blend for lasting comfort",
        "Calms visible redness and tight, dehydrated skin"
      ],
      howToUse:
        "Warm a small amount between fingertips and press evenly over face and neck as the last step of your morning and evening ritual.",
      storage: "Store in a cool, dry place away from direct heat. Reseal jar fully after each use to preserve texture.",
      faqs: [
        { q: "Will this feel too heavy under makeup?", a: "No — it sinks in within 60-90 seconds, leaving a soft matte-satin finish that layers well under makeup." },
        { q: "Is it suitable for sensitive skin?", a: "Yes, the centella asiatica and oat extract are chosen specifically to calm reactive, easily irritated skin." },
        { q: "Can combination skin use this in summer?", a: "Yes, though many combination skin types prefer a thinner layer on the T-zone and a fuller layer on drier cheek areas." }
      ]
    },
    {
      id: "3",
      slug: "rose-clay-purifying-mask",
      name: "Rose Clay Purifying Mask",
      brand: "NOAÉ",
      category: "Skincare",
      price: 1199,
      comparePrice: 1399,
      image: "assets/images/noae-cream-jar-sage.svg",
      gallery: [
        "assets/images/noae-cream-jar-sage.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-skincare.svg"
      ],
      description:
        "French rose clay draws out excess oil and congestion while kaolin softens texture, leaving pores visibly refined without stripping moisture.",
      rating: 4.6,
      reviewCount: 97,
      badge: null,
      variants: [
        { size: "75ml", price: 1199, sku: "NOAE-RCM-75" }
      ],
      skinType: ["Oily", "Combination", "All"],
      stock: 38,
      sku: "NOAE-RCM-75",
      keyIngredients: ["French Rose Clay", "Kaolin Clay", "Rosewater", "Glycerin"],
      features: [
        "Detoxifying clay blend that won't over-dry skin",
        "Rosewater base keeps the mask from tightening uncomfortably",
        "Visibly minimizes the look of congested pores"
      ],
      howToUse:
        "Apply an even layer to clean, dry skin avoiding the eye area. Leave for 8-10 minutes — do not let fully harden. Rinse with lukewarm water and follow with serum and moisturizer.",
      storage: "Keep jar sealed between uses to prevent drying out. Store at room temperature away from moisture.",
      faqs: [
        { q: "How often should I use this mask?", a: "1-2 times per week is ideal for most skin types. Oily and congested skin can use up to 3 times weekly." },
        { q: "Will it dry out my skin like a typical clay mask?", a: "No — the rosewater and glycerin base is formulated so the clay never fully hardens or pulls moisture from skin." },
        { q: "Can I use this if I have dry patches?", a: "Yes, apply as a targeted treatment only to oily/congested zones and skip dry areas." }
      ]
    },
    {
      id: "4",
      slug: "vitamin-c-brightening-drops",
      name: "Vitamin C Brightening Drops",
      brand: "NOAÉ",
      category: "Skincare",
      price: 2099,
      comparePrice: 2399,
      image: "assets/images/noae-vial-drops-gold.svg",
      gallery: [
        "assets/images/noae-vial-drops-gold.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-skincare.svg"
      ],
      description:
        "A stable 10% vitamin C (sodium ascorbyl phosphate) formula that visibly evens tone and adds luminosity without the sting of traditional L-ascorbic acid.",
      rating: 4.9,
      reviewCount: 176,
      badge: "Bestseller",
      variants: [
        { size: "20ml", price: 2099, sku: "NOAE-VCD-20" }
      ],
      skinType: ["All", "Combination", "Oily"],
      stock: 27,
      sku: "NOAE-VCD-20",
      keyIngredients: ["10% Sodium Ascorbyl Phosphate", "Ferulic Acid", "Vitamin E", "Licorice Root"],
      features: [
        "Gentle, stable vitamin C derivative — no stinging or flaking",
        "Antioxidant trio helps defend against daily environmental stress",
        "Visibly brightens uneven tone and dullness over 4 weeks"
      ],
      howToUse:
        "Use in the morning after cleansing. Apply 3-4 drops to face, let absorb for 60 seconds, then follow with moisturizer and SPF. Introduce every other day for the first week if new to vitamin C.",
      storage: "Store away from direct sunlight and heat to preserve potency. Cap tightly after each use; discard if formula darkens significantly.",
      faqs: [
        { q: "Will this sting or irritate sensitive skin?", a: "The sodium ascorbyl phosphate form is one of the gentlest vitamin C derivatives, making stinging very uncommon compared to L-ascorbic acid." },
        { q: "Can I use this with retinol?", a: "Yes, but we recommend Vitamin C Brightening Drops in the morning and retinol-based products at night to get the most from each." },
        { q: "Why does the color darken slightly over time?", a: "Some natural oxidation is expected with any vitamin C formula and is normal; a significant color or smell change means it's time to replace." },
        { q: "Does this need to be kept refrigerated?", a: "No, but keeping it in a cool drawer away from sunlight will help the formula stay potent for longer." }
      ]
    },
    {
      id: "5",
      slug: "gentle-milk-cleanser",
      name: "Gentle Milk Cleanser",
      brand: "NOAÉ",
      category: "Skincare",
      price: 949,
      comparePrice: null,
      image: "assets/images/noae-pump-bottle-gold.svg",
      gallery: [
        "assets/images/noae-pump-bottle-gold.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-skincare.svg"
      ],
      description:
        "A creamy oat-milk cleanser that lifts away makeup and daily buildup while leaving the skin barrier soft, calm, and never squeaky-tight.",
      rating: 4.7,
      reviewCount: 143,
      badge: "New",
      variants: [
        { size: "150ml", price: 949, sku: "NOAE-GMC-150" },
        { size: "250ml", price: 1449, sku: "NOAE-GMC-250" }
      ],
      skinType: ["Dry", "Combination", "All"],
      stock: 61,
      sku: "NOAE-GMC-150",
      keyIngredients: ["Oat Milk", "Chamomile Extract", "Glycerin", "Panthenol"],
      features: [
        "Non-foaming, pH-balanced formula that respects the skin barrier",
        "Removes makeup and SPF without a harsh second cleanse",
        "Chamomile calms visible redness during cleansing"
      ],
      howToUse:
        "Massage a coin-sized amount onto damp skin morning and night in gentle circular motions. Rinse thoroughly with lukewarm water and pat dry.",
      storage: "Store upright at room temperature. Keep pump nozzle clean and dry between uses.",
      faqs: [
        { q: "Does this remove waterproof makeup?", a: "It removes most daily makeup and SPF effectively; for waterproof eye makeup we suggest a dedicated eye makeup remover first." },
        { q: "Is double cleansing necessary?", a: "Not with this formula — it is designed as a single, thorough cleanse for most skin types and routines." },
        { q: "Will it feel drying afterward?", a: "No, the oat milk and glycerin base is designed to leave skin feeling soft, never tight or stripped." }
      ]
    },
    {
      id: "6",
      slug: "silk-repair-hair-oil",
      name: "Silk Repair Hair Oil",
      brand: "NOAÉ",
      category: "Haircare",
      price: 1399,
      comparePrice: 1699,
      image: "assets/images/noae-dropper-bottle-rose.svg",
      gallery: [
        "assets/images/noae-dropper-bottle-rose.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-haircare.svg"
      ],
      description:
        "A featherlight blend of camellia and argan oils that smooths frizz, seals split ends, and adds mirror-shine without ever weighing hair down.",
      rating: 4.8,
      reviewCount: 132,
      badge: "Bestseller",
      variants: [
        { size: "50ml", price: 1399, sku: "NOAE-SRO-50" }
      ],
      skinType: ["All"],
      stock: 44,
      sku: "NOAE-SRO-50",
      keyIngredients: ["Camellia Oil", "Argan Oil", "Vitamin E", "Baobab Extract"],
      features: [
        "Absorbs quickly — no greasy residue, even on fine hair",
        "Tames frizz and flyaways in humidity",
        "Adds visible shine without weighing strands down"
      ],
      howToUse:
        "Warm 2-3 drops between palms and smooth through mid-lengths and ends on damp or dry hair. For deeper repair, apply a dime-sized amount to dry ends and leave overnight before washing.",
      storage: "Store upright away from direct heat and sunlight. Tighten dropper cap fully after each use.",
      faqs: [
        { q: "Will this weigh down fine or thin hair?", a: "Used sparingly (2-3 drops) on mid-lengths and ends, it will not weigh down fine hair. Avoid applying directly to roots." },
        { q: "Can I use it as a leave-in before styling?", a: "Yes — apply to damp hair before heat styling for added protection and shine." },
        { q: "How often can I use the overnight treatment?", a: "1-2 times per week is ideal for most hair types; daily for very dry or damaged ends." }
      ]
    },
    {
      id: "7",
      slug: "scalp-detox-shampoo",
      name: "Scalp Detox Shampoo",
      brand: "NOAÉ",
      category: "Haircare",
      price: 899,
      comparePrice: null,
      image: "assets/images/noae-pump-bottle-gold.svg",
      gallery: [
        "assets/images/noae-pump-bottle-gold.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-haircare.svg"
      ],
      description:
        "A sulfate-free clarifying shampoo with salicylic acid and peppermint that lifts buildup and soothes an itchy scalp while keeping color-treated hair vibrant.",
      rating: 4.5,
      reviewCount: 88,
      badge: null,
      variants: [
        { size: "250ml", price: 899, sku: "NOAE-SDS-250" }
      ],
      skinType: ["All"],
      stock: 50,
      sku: "NOAE-SDS-250",
      keyIngredients: ["Salicylic Acid", "Peppermint Extract", "Tea Tree Oil", "Aloe Vera"],
      features: [
        "Sulfate-free, color-safe formula",
        "Salicylic acid gently lifts flaking and buildup",
        "Cooling peppermint soothes an itchy, tight scalp"
      ],
      howToUse:
        "Apply to wet scalp, massage for 60 seconds focusing on the roots, then rinse thoroughly. Follow with Weightless Repair Conditioner on mid-lengths and ends. Use 2-3 times per week.",
      storage: "Store upright at room temperature, away from direct sunlight.",
      faqs: [
        { q: "Is this safe for color-treated hair?", a: "Yes, it is sulfate-free and formulated to be gentle on color while still clarifying the scalp." },
        { q: "How often should I use it?", a: "2-3 times weekly is ideal; daily use is not recommended as it is a clarifying formula." },
        { q: "Will it help with dandruff?", a: "The salicylic acid and tea tree oil help reduce flaking and buildup associated with mild dandruff, though persistent dandruff should be assessed by a dermatologist." }
      ]
    },
    {
      id: "8",
      slug: "weightless-repair-conditioner",
      name: "Weightless Repair Conditioner",
      brand: "NOAÉ",
      category: "Haircare",
      price: 949,
      comparePrice: null,
      image: "assets/images/noae-pump-bottle-gold.svg",
      gallery: [
        "assets/images/noae-pump-bottle-gold.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-haircare.svg"
      ],
      description:
        "A rice protein and biotin conditioner that detangles and rebuilds strength from within, leaving hair soft and bouncy rather than flat or coated.",
      rating: 4.6,
      reviewCount: 74,
      badge: "New",
      variants: [
        { size: "250ml", price: 949, sku: "NOAE-WRC-250" }
      ],
      skinType: ["All"],
      stock: 47,
      sku: "NOAE-WRC-250",
      keyIngredients: ["Rice Protein", "Biotin", "Shea Butter", "Panthenol"],
      features: [
        "Rebuilds strand strength without heaviness",
        "Detangles instantly, reducing breakage from brushing",
        "Lightweight enough for fine and oily-scalp hair types"
      ],
      howToUse:
        "After shampooing, apply generously from mid-lengths to ends. Leave for 2-3 minutes, then rinse thoroughly with cool water for extra shine.",
      storage: "Store upright at room temperature away from direct sunlight.",
      faqs: [
        { q: "Will this make my roots greasy faster?", a: "No — applied only from mid-lengths to ends, it will not add oil to the scalp area." },
        { q: "Can fine hair use this daily?", a: "Yes, the lightweight formula is safe for daily use even on fine or oily-scalp hair." },
        { q: "Does it help with heat damage?", a: "The rice protein and biotin help rebuild strength in strands weakened by heat styling, though a dedicated heat protectant is recommended before styling." }
      ]
    },
    {
      id: "9",
      slug: "magnesium-sleep-mist",
      name: "Magnesium Sleep Mist",
      brand: "NOAÉ",
      category: "Wellness",
      price: 1499,
      comparePrice: 1699,
      image: "assets/images/noae-mist-spray-bottle.svg",
      gallery: [
        "assets/images/noae-mist-spray-bottle.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-wellness.svg"
      ],
      description:
        "A pillow mist blending magnesium chloride with lavender and chamomile essential oils to ease tension and cue the body into wind-down mode before sleep.",
      rating: 4.7,
      reviewCount: 121,
      badge: "Bestseller",
      variants: [
        { size: "100ml", price: 1499, sku: "NOAE-MSM-100" }
      ],
      skinType: ["All"],
      stock: 39,
      sku: "NOAE-MSM-100",
      keyIngredients: ["Magnesium Chloride", "Lavender Oil", "Chamomile Oil", "Vetiver"],
      features: [
        "Calming lavender-chamomile scent, not overpowering",
        "Magnesium absorbs gently through skin contact with pillow and sheets",
        "Alcohol-free mist safe for fabric"
      ],
      howToUse:
        "Shake well and mist 3-4 sprays over pillow and sheets 15 minutes before bed. Can also be misted lightly on shoulders and neck as part of a wind-down ritual.",
      storage: "Store upright at room temperature, away from direct sunlight. Shake before each use.",
      faqs: [
        { q: "Will the scent be too strong for light sleepers?", a: "The lavender-chamomile blend is intentionally soft; most users find it calming rather than overpowering." },
        { q: "Is it safe to spray directly on skin?", a: "Yes, light misting on shoulders and neck is safe, though it is primarily designed as a fabric and pillow mist." },
        { q: "Will it stain pillowcases?", a: "No, the formula is clear and alcohol-free, and does not stain light or dark fabrics." }
      ]
    },
    {
      id: "10",
      slug: "calm-adaptogen-elixir",
      name: "Calm Adaptogen Elixir",
      brand: "NOAÉ",
      category: "Wellness",
      price: 1799,
      comparePrice: null,
      image: "assets/images/noae-vial-drops-gold.svg",
      gallery: [
        "assets/images/noae-vial-drops-gold.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-wellness.svg"
      ],
      description:
        "A daily tonic of ashwagandha and reishi mushroom extract designed to be added to water or tea, supporting a steady sense of calm through busy days.",
      rating: 4.6,
      reviewCount: 68,
      badge: "New",
      variants: [
        { size: "30ml", price: 1799, sku: "NOAE-CAE-30" }
      ],
      skinType: ["All"],
      stock: 31,
      sku: "NOAE-CAE-30",
      keyIngredients: ["Ashwagandha Extract", "Reishi Mushroom", "L-Theanine", "Holy Basil"],
      features: [
        "Adaptogen blend traditionally used to support calm focus",
        "Unflavored concentrate mixes easily into water or tea",
        "Non-drowsy — suitable for daytime use"
      ],
      howToUse:
        "Add 1 full dropper (1ml) to water, tea, or a smoothie once daily, preferably in the morning or early afternoon. Consistent daily use over 2-4 weeks yields the most noticeable results.",
      storage: "Store in a cool, dark place. Refrigeration is not required but may extend freshness once opened.",
      faqs: [
        { q: "Is this safe to take every day?", a: "Yes, it is formulated for daily use, though we recommend consulting a healthcare provider if you are pregnant, nursing, or on medication." },
        { q: "Will it make me feel drowsy?", a: "No, it is formulated to support calm focus without drowsiness, making it suitable for daytime use." },
        { q: "How does it taste mixed with water?", a: "It has a mild, faintly earthy taste that blends easily into water, tea, or smoothies without overpowering flavor." }
      ]
    },
    {
      id: "11",
      slug: "rose-quartz-facial-roller",
      name: "Rose Quartz Facial Roller",
      brand: "NOAÉ",
      category: "Wellness",
      price: 1999,
      comparePrice: 2299,
      image: "assets/images/noae-rose-quartz-roller.svg",
      gallery: [
        "assets/images/noae-rose-quartz-roller.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-wellness.svg"
      ],
      description:
        "A hand-polished rose quartz roller that supports gentle facial massage, helping ease tension and encourage smoother-looking product absorption.",
      rating: 4.8,
      reviewCount: 156,
      badge: "Limited",
      variants: [
        { size: "One Size", price: 1999, sku: "NOAE-RQR-OS" }
      ],
      skinType: ["All"],
      stock: 18,
      sku: "NOAE-RQR-OS",
      keyIngredients: ["100% Natural Rose Quartz"],
      features: [
        "Dual-sized heads for face and under-eye contours",
        "Naturally stays cool to soothe puffiness",
        "Pairs beautifully with serum application for gentle massage"
      ],
      howToUse:
        "After applying serum, roll outward and upward from the center of the face towards the hairline, and gently along the under-eye and jawline. Use daily for 3-5 minutes.",
      storage: "Wipe clean with a soft, dry cloth after each use. Store in the provided pouch away from hard surfaces to prevent chipping.",
      faqs: [
        { q: "Can I store it in the fridge for extra cooling?", a: "Yes, chilling the roller for 10-15 minutes before use enhances the de-puffing sensation, especially under the eyes." },
        { q: "How do I clean the roller?", a: "Wipe with a soft, dry or slightly damp cloth after each use; avoid soaking, which can loosen the metal frame." },
        { q: "Is it suitable for sensitive or rosacea-prone skin?", a: "Yes, the gentle rolling motion with light pressure is generally well tolerated, though very reactive skin should test on a small area first." }
      ]
    },
    {
      id: "12",
      slug: "restorative-sleep-balm",
      name: "Restorative Sleep Balm",
      brand: "NOAÉ",
      category: "Wellness",
      price: 1099,
      comparePrice: null,
      image: "assets/images/noae-cream-jar-sage.svg",
      gallery: [
        "assets/images/noae-cream-jar-sage.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-wellness.svg"
      ],
      description:
        "A pulse-point balm combining lavender, sandalwood, and beeswax that grounds the senses and signals the body to slow down before bed.",
      rating: 4.5,
      reviewCount: 59,
      badge: null,
      variants: [
        { size: "20g", price: 1099, sku: "NOAE-RSB-20" }
      ],
      skinType: ["All"],
      stock: 33,
      sku: "NOAE-RSB-20",
      keyIngredients: ["Lavender Oil", "Sandalwood", "Beeswax", "Sweet Almond Oil"],
      features: [
        "Solid balm format — travel-friendly and mess-free",
        "Warms slightly on contact with skin for easy blending",
        "Grounding lavender-sandalwood scent"
      ],
      howToUse:
        "Warm a small amount between fingertips and massage onto wrists, temples, and the back of the neck as part of a nightly wind-down ritual.",
      storage: "Store at room temperature; balm may soften slightly in warm weather, which is normal. Keep lid closed to preserve fragrance.",
      faqs: [
        { q: "Is this balm sticky on skin?", a: "No, it absorbs into a soft matte finish within a couple of minutes and does not feel greasy or sticky." },
        { q: "Can I apply it to my face?", a: "It is formulated for pulse points such as wrists, temples, and neck; we recommend avoiding direct application near the eyes." },
        { q: "Does the scent linger into the next day?", a: "The scent is designed to fade gently over a few hours and typically will not linger strongly by morning." }
      ]
    },
    {
      id: "13",
      slug: "calm-body-butter",
      name: "Calm Body Butter",
      brand: "NOAÉ",
      category: "Body",
      price: 1399,
      comparePrice: 1599,
      image: "assets/images/noae-cream-jar-sage.svg",
      gallery: [
        "assets/images/noae-cream-jar-sage.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-body.svg"
      ],
      description:
        "A rich shea and cocoa butter whip infused with chamomile that melts on contact, leaving skin soft for up to 48 hours without a heavy or greasy after-feel.",
      rating: 4.8,
      reviewCount: 149,
      badge: "Bestseller",
      variants: [
        { size: "200g", price: 1399, sku: "NOAE-CBB-200" }
      ],
      skinType: ["Dry", "All"],
      stock: 52,
      sku: "NOAE-CBB-200",
      keyIngredients: ["Shea Butter", "Cocoa Butter", "Chamomile Extract", "Vitamin E"],
      features: [
        "Whipped texture melts instantly into skin",
        "48-hour moisture retention on dry, rough patches",
        "Calming chamomile scent, never overpowering"
      ],
      howToUse:
        "Scoop a small amount and warm between palms before massaging into skin, focusing on elbows, knees, and other dry areas. Best applied right after showering while skin is still damp.",
      storage: "Store in a cool, dry place. Butter may soften in warm climates — this does not affect performance.",
      faqs: [
        { q: "Will this feel too heavy in hot weather?", a: "It's whipped to a light, quick-absorbing texture, though very hot climates may find a thinner layer more comfortable." },
        { q: "Is it safe for very dry, cracked skin like elbows and heels?", a: "Yes, it is specifically formulated to intensively treat rough, dry patches like elbows, knees, and heels." },
        { q: "Can I use it on my face?", a: "It is designed for body use; we recommend Cloud Cream Moisturizer for facial skin." }
      ]
    },
    {
      id: "14",
      slug: "soft-focus-body-oil",
      name: "Soft Focus Body Oil",
      brand: "NOAÉ",
      category: "Body",
      price: 1599,
      comparePrice: null,
      image: "assets/images/noae-dropper-bottle-rose.svg",
      gallery: [
        "assets/images/noae-dropper-bottle-rose.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-body.svg"
      ],
      description:
        "A dry-touch body oil blending jojoba and sweet almond oils that absorbs in seconds, leaving a soft satin glow instead of an oily sheen.",
      rating: 4.7,
      reviewCount: 92,
      badge: "New",
      variants: [
        { size: "100ml", price: 1599, sku: "NOAE-SFO-100" }
      ],
      skinType: ["Dry", "Combination", "All"],
      stock: 36,
      sku: "NOAE-SFO-100",
      keyIngredients: ["Jojoba Oil", "Sweet Almond Oil", "Vitamin E", "Rosehip Oil"],
      features: [
        "Dry-touch finish — no residue on clothing",
        "Adds a subtle natural glow without shimmer particles",
        "Absorbs in under a minute on damp skin"
      ],
      howToUse:
        "Apply 4-6 drops to damp skin after showering, massaging in upward strokes. Can also be added to bathwater for an extra nourishing soak.",
      storage: "Store away from direct heat and sunlight to preserve the oil's freshness.",
      faqs: [
        { q: "Will this stain clothing or bedsheets?", a: "No, the dry-touch formula absorbs fully within about a minute, leaving no visible residue on fabric." },
        { q: "Can I use it on my face?", a: "Yes, in small amounts it can be used on the face for combination to dry skin, though it is primarily formulated for the body." },
        { q: "Does it contain added shimmer or glitter?", a: "No, the natural glow comes from the oils themselves, not from added shimmer particles." }
      ]
    },
    {
      id: "15",
      slug: "gentle-exfoliating-body-scrub",
      name: "Gentle Exfoliating Body Scrub",
      brand: "NOAÉ",
      category: "Body",
      price: 1099,
      comparePrice: 1299,
      image: "assets/images/noae-scrub-jar-plum.svg",
      gallery: [
        "assets/images/noae-scrub-jar-plum.svg",
        "assets/images/noae-serum-texture-detail.svg",
        "assets/images/noae-category-body.svg"
      ],
      description:
        "Fine sugar crystals suspended in nourishing coconut oil buff away rough, dull skin while never scratching or over-exfoliating in the shower.",
      rating: 4.6,
      reviewCount: 84,
      badge: null,
      variants: [
        { size: "250g", price: 1099, sku: "NOAE-GES-250" }
      ],
      skinType: ["All"],
      stock: 40,
      sku: "NOAE-GES-250",
      keyIngredients: ["Fine Sugar Crystals", "Coconut Oil", "Shea Butter", "Vanilla Extract"],
      features: [
        "Fine-grain sugar buffs gently without micro-tearing skin",
        "Coconut oil base moisturizes as it exfoliates",
        "Warm vanilla scent lingers softly after rinsing"
      ],
      howToUse:
        "In the shower, scoop a small amount and massage in circular motions over damp skin, focusing on elbows, knees, and heels. Rinse thoroughly and follow with Calm Body Butter or Soft Focus Body Oil.",
      storage: "Keep lid tightly closed to prevent water from entering the jar. Store in a dry area of the shower or bathroom.",
      faqs: [
        { q: "Is this safe to use every day?", a: "We recommend 2-3 times per week for most skin types to avoid over-exfoliating; daily use is not necessary." },
        { q: "Will the sugar granules dissolve and make the shower slippery?", a: "The oil base can leave a light residue — we recommend rinsing the shower floor after use as a precaution." },
        { q: "Can I use this on freshly shaved skin?", a: "We recommend waiting a few hours after shaving, as freshly shaved skin can be more sensitive to exfoliation." }
      ]
    }
  ];

  /* ---------------------- Helper functions ---------------------- */

  function formatPrice(amount) {
    var n = Math.round(Number(amount) || 0);
    return "₹" + n.toLocaleString("en-IN");
  }

  function getProductBySlug(slug) {
    for (var i = 0; i < NOAE_PRODUCTS.length; i++) {
      if (NOAE_PRODUCTS[i].slug === slug) return NOAE_PRODUCTS[i];
    }
    return null;
  }

  function getProductById(id) {
    for (var i = 0; i < NOAE_PRODUCTS.length; i++) {
      if (NOAE_PRODUCTS[i].id === String(id)) return NOAE_PRODUCTS[i];
    }
    return null;
  }

  function getProductsByCategory(category) {
    if (!category || category === "all") return NOAE_PRODUCTS.slice();
    return NOAE_PRODUCTS.filter(function (p) {
      return p.category.toLowerCase() === String(category).toLowerCase();
    });
  }

  function getRelatedProducts(product, limit) {
    limit = limit || 4;
    var pool = NOAE_PRODUCTS.filter(function (p) {
      return p.id !== product.id && p.category === product.category;
    });
    if (pool.length < limit) {
      var extra = NOAE_PRODUCTS.filter(function (p) {
        return p.id !== product.id && p.category !== product.category && pool.indexOf(p) === -1;
      });
      pool = pool.concat(extra);
    }
    return pool.slice(0, limit);
  }

  function renderStars(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.5;
    var html = "";
    for (var i = 0; i < full; i++) html += '<span class="noae-star noae-star--full">★</span>';
    if (half) html += '<span class="noae-star noae-star--half">★</span>';
    for (var j = full + (half ? 1 : 0); j < 5; j++) html += '<span class="noae-star noae-star--empty">☆</span>';
    return html;
  }

  function badgeClass(badge) {
    if (!badge) return "";
    var map = { Bestseller: "noae-badge--rose", New: "noae-badge--sage", Limited: "noae-badge--gold" };
    return map[badge] || "noae-badge--rose";
  }

  function renderProductCard(product) {
    var discount = product.comparePrice
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;
    var wishlistActive = window.NoaeWishlist && window.NoaeWishlist.has(product.id) ? " is-active" : "";
    return (
      '<article class="noae-product-card" data-product-id="' + product.id + '" data-category="' + product.category + '">' +
        '<div class="noae-product-card__media">' +
          '<a href="product.html?slug=' + product.slug + '" class="noae-product-card__link" aria-label="View ' + product.name + '">' +
            '<img class="noae-product-card__img noae-product-card__img--main" src="' + product.image + '" alt="' + product.name + ' — ' + product.category + ' by NOAÉ" width="400" height="480" loading="lazy">' +
            '<img class="noae-product-card__img noae-product-card__img--hover" src="' + product.gallery[1] + '" alt="' + product.name + ' texture detail" width="400" height="480" loading="lazy">' +
          '</a>' +
          (product.badge ? '<span class="noae-badge ' + badgeClass(product.badge) + '">' + product.badge + '</span>' : '') +
          (discount > 0 ? '<span class="noae-badge noae-badge--discount">-' + discount + '%</span>' : '') +
          '<button class="noae-icon-btn noae-wishlist-toggle' + wishlistActive + '" type="button" data-product-id="' + product.id + '" aria-label="Add ' + product.name + ' to wishlist" aria-pressed="' + (wishlistActive ? "true" : "false") + '">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21s-7.5-4.7-10-9.3C.5 8.1 2 4.5 5.6 3.7 8 3.2 10.2 4.3 12 6.7 13.8 4.3 16 3.2 18.4 3.7 22 4.5 23.5 8.1 22 11.7 19.5 16.3 12 21 12 21z" fill="currentColor"/></svg>' +
          '</button>' +
          '<button class="noae-btn noae-btn--quickview" type="button" data-product-id="' + product.id + '">Quick View</button>' +
        '</div>' +
        '<div class="noae-product-card__body">' +
          '<p class="noae-product-card__category">' + product.category + '</p>' +
          '<h3 class="noae-product-card__name"><a href="product.html?slug=' + product.slug + '">' + product.name + '</a></h3>' +
          '<div class="noae-product-card__rating" aria-label="Rated ' + product.rating + ' out of 5">' + renderStars(product.rating) + '<span class="noae-product-card__review-count">(' + product.reviewCount + ')</span></div>' +
          '<div class="noae-product-card__price">' +
            '<span class="noae-price">' + formatPrice(product.price) + '</span>' +
            (product.comparePrice ? '<span class="noae-price noae-price--compare">' + formatPrice(product.comparePrice) + '</span>' : '') +
          '</div>' +
          '<button class="noae-btn noae-btn--outline noae-btn--full noae-quick-add" type="button" data-product-id="' + product.id + '">Quick Add</button>' +
        '</div>' +
      '</article>'
    );
  }

  window.NOAE_PRODUCTS = NOAE_PRODUCTS;
  window.NoaeProducts = {
    all: NOAE_PRODUCTS,
    formatPrice: formatPrice,
    getProductBySlug: getProductBySlug,
    getProductById: getProductById,
    getProductsByCategory: getProductsByCategory,
    getRelatedProducts: getRelatedProducts,
    renderStars: renderStars,
    renderProductCard: renderProductCard,
    badgeClass: badgeClass
  };
})();
