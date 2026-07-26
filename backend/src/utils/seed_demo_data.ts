import { db } from './database';
import { logger } from './logger';

async function seedDemoData() {
  logger.info('Starting full demo data seed...');

  try {
    // 0. Ensure a demo user exists for reviews
    let demoUser = await db.queryOne('SELECT id FROM users LIMIT 1');
    if (!demoUser) {
      const res = await db.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, status)
         VALUES ('Ananya', 'Sharma', 'ananya.demo@example.com', '$2a$10$abcdefghijklmnopqrstuuu', 'customer', 'active')`
      );
      demoUser = { id: res.insertId };
    }
    const userId = demoUser.id;

    // 1. Seed Categories
    const categoriesData = [
      {
        name: 'Hair Growth Oils',
        slug: 'hair-growth-oils',
        description: 'Authentic 100% Ayurvedic oils cold-pressed with 21+ sacred botanicals to combat hair fall and stimulate scalp circulation.',
        image_url: 'https://images.unsplash.com/photo-1608248597263-0057e57b4524?auto=format&fit=crop&w=800&q=80',
        display_order: 1,
        is_featured: 1
      },
      {
        name: 'Herbal Shampoos',
        slug: 'herbal-shampoos',
        description: 'Sulphate and paraben-free cleansers enriched with Reetha, Shikakai, and Amla for gentle daily scalp nourishment.',
        image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
        display_order: 2,
        is_featured: 1
      },
      {
        name: 'Scalp & Hair Serums',
        slug: 'scalp-hair-serums',
        description: 'Lightweight, non-greasy bioactive hair serums formulated for instant frizz control, heat protection, and dense hair growth.',
        image_url: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80',
        display_order: 3,
        is_featured: 1
      },
      {
        name: 'Nourishing Hair Masks',
        slug: 'nourishing-hair-masks',
        description: 'Deep conditioning spa treatments crafted with natural butter, Hibiscus, and Aloe Vera to repair damaged cuticles.',
        image_url: 'https://images.unsplash.com/photo-1567928269937-ae1454f11d5e?auto=format&fit=crop&w=800&q=80',
        display_order: 4,
        is_featured: 1
      },
      {
        name: 'Natural Hair Wigs',
        slug: 'natural-hair-wigs',
        description: 'Undetectable 100% human hair wigs with hand-tied lace fronts for ultimate natural density and comfort.',
        image_url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
        display_order: 5,
        is_featured: 1
      },
      {
        name: 'Custom Hair Patches',
        slug: 'custom-hair-patches',
        description: 'Seamless hairline coverage systems and micro-breathable hair patches custom-cut for instant volume.',
        image_url: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=800&q=80',
        display_order: 6,
        is_featured: 1
      }
    ];

    const categoryMap = new Map<string, number>();

    for (const cat of categoriesData) {
      const existing = await db.queryOne('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
      if (existing) {
        await db.query(
          `UPDATE categories SET name = ?, description = ?, image_url = ?, is_featured = ?, status = 'active', display_order = ? WHERE id = ?`,
          [cat.name, cat.description, cat.image_url, cat.is_featured, cat.display_order, existing.id]
        );
        categoryMap.set(cat.slug, existing.id);
      } else {
        const res = await db.query(
          `INSERT INTO categories (name, slug, description, image_url, display_order, is_featured, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`,
          [cat.name, cat.slug, cat.description, cat.image_url, cat.display_order, cat.is_featured]
        );
        categoryMap.set(cat.slug, res.insertId);
      }
    }
    logger.info(`Seeded ${categoryMap.size} categories.`);

    // 2. Seed Products
    const productsData = [
      // CATEGORY 1: HAIR GROWTH OILS
      {
        category_slug: 'hair-growth-oils',
        name: 'Bhringraj Intense Hair Growth Oil',
        slug: 'bhringraj-intense-hair-growth-oil',
        sku: 'LKN-OIL-001',
        subtitle: '48-Hour Cold-Pressed Ayurvedic Follicle Revitaliser',
        short_description: 'Rooted in Charaka Samhita tradition, combining pure Bhringraj with organic sesame oil to drastically reduce hair shedding and stimulate thick new hair growth within 8–12 weeks.',
        description: '<p>Bhringraj — known as the "King of Hair" in Ayurveda — reverses hair thinning and stimulates scalp circulation. Prepared through a 48-hour slow heating process where fresh Bhringraj leaves simmer in organic sesame oil with Amla, Brahmi, and Neem. Free from mineral oils, silicones, and synthetic fragrance.</p>',
        how_to_use: '<ol><li>Warm 5-10ml oil between your palms.</li><li>Apply directly to scalp using circular fingertip pressure for 10 minutes.</li><li>Leave overnight or for at least 2 hours.</li><li>Wash with a mild sulphate-free shampoo.</li></ol>',
        benefits: '<ul><li>Reduces hair fall by up to 75%</li><li>Stimulates dormant hair roots</li><li>Eliminates scalp dryness & flakiness</li><li>Delays premature hair greying</li><li>Adds natural gloss and bounce</li></ul>',
        price: 499,
        mrp: 699,
        stock_quantity: 150,
        status: 'active',
        is_featured: 1,
        is_bestseller: 1,
        is_new: 0,
        length_cm: 5, width_cm: 5, height_cm: 15, weight: 230,
        primary_image: 'https://images.unsplash.com/photo-1608248597263-0057e57b4524?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1608248597263-0057e57b4524?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'bhringraj, hair fall, ayurvedic oil, organic oil, hair growth',
        ingredients_list: 'Organic Sesame Oil, Fresh Bhringraj Leaf Extract, Amla Extract, Brahmi Extract, Neem Extract, Hibiscus, Curry Leaves, Vitamin E',
        badges: 'Bestseller',
        rating_avg: 4.9,
        rating_count: 342,
        sales_count: 1420,
        variants: [
          { name: 'Volume', value: '100 ml', price_modifier: 0, stock_quantity: 80 },
          { name: 'Volume', value: '200 ml', price_modifier: 350, stock_quantity: 70 }
        ],
        reviews: [
          { title: 'Noticeable reduction in hair fall in 3 weeks!', body: 'I was suffering from severe seasonal hair loss. My dermatologist recommended trying a pure Bhringraj oil without mineral oils. Luv Kush Natural oil feels so light and pure. My hair texture has improved greatly!', rating: 5 },
          { title: 'Best Ayurvedic hair oil I have used', body: 'The aroma is authentic and soothing. Smells like real herbs, not heavy synthetic perfume. Works wonders when left overnight!', rating: 5 }
        ]
      },
      {
        category_slug: 'hair-growth-oils',
        name: 'Onion & Kalonji Anti-Hairfall Oil',
        slug: 'onion-kalonji-anti-hairfall-oil',
        sku: 'LKN-OIL-002',
        subtitle: 'Sulphur-Rich Follicle Booster with Rosemary Essential Oil',
        short_description: 'Clinically targeted formula combining bio-active red onion extract, Kalonji (Black Seed) oil, and Rosemary to fortify weak hair roots and block DHT.',
        description: '<p>Red Onion is nature’s richest source of bio-available sulphur, essential for rebuilding keratin protein in hair. Blended with unrefined Kalonji oil and therapeutic Rosemary to enhance micro-circulation in the scalp. Completely odour-neutralised with natural botanical extracts.</p>',
        how_to_use: '<ol><li>Dispense oil onto scalp using nozzle applicator.</li><li>Gently massage into roots for 5-8 minutes.</li><li>Leave for minimum 1 hour before washing.</li><li>Use 3 times a week for visible regrowth.</li></ol>',
        benefits: '<ul><li>High sulphur content strengthens keratin</li><li>Blocks DHT to halt genetic hair thinning</li><li>Clears scalp buildup and dandruff</li><li>Odour-less natural botanical formula</li></ul>',
        price: 549,
        mrp: 799,
        stock_quantity: 120,
        status: 'active',
        is_featured: 1,
        is_bestseller: 1,
        is_new: 1,
        length_cm: 5, width_cm: 5, height_cm: 15, weight: 240,
        primary_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'onion oil, kalonji, hair loss, dht blocker, hair regrowth',
        ingredients_list: 'Red Onion Bulb Extract, Black Seed (Kalonji) Oil, Rosemary Essential Oil, Castor Oil, Sweet Almond Oil, Tocopherol',
        badges: 'Hot New Arrival',
        rating_avg: 4.8,
        rating_count: 215,
        sales_count: 980,
        variants: [
          { name: 'Volume', value: '150 ml', price_modifier: 0, stock_quantity: 60 },
          { name: 'Volume', value: '300 ml', price_modifier: 400, stock_quantity: 60 }
        ],
        reviews: [
          { title: 'Really helped with hairline thinning', body: 'The rosemary and kalonji mix is super effective. No onion smell at all. High quality product.', rating: 5 }
        ]
      },
      {
        category_slug: 'hair-growth-oils',
        name: '21-Herb Kesh Raksha Luxury Scalp Oil',
        slug: '21-herb-kesh-raksha-luxury-scalp-oil',
        sku: 'LKN-OIL-003',
        subtitle: 'Flagship Copper-Vessel Brewed Ayurvedic Elixir',
        short_description: 'Our flagship Ashtanga Hridayam recipe slow-simmered for 72 hours in pure copper vessels with 21 rare Himalayan herbs.',
        description: '<p>Kesh Raksha translates to "Protector of Hair". Handcrafted in small artisanal batches using 21 sacred herbs including Jatamansi, Nagarmotha, Vetiver, and Lotus petal extracts in cold-pressed virgin coconut and sesame oils.</p>',
        how_to_use: '<p>Warm oil gently and massage into scalp in slow circular motions. Wrap head with a warm towel for 20 minutes for deep steam infusion.</p>',
        benefits: '<ul><li>360° protection against thinning, greying & stress hair fall</li><li>Calms nervous tension & aids restful sleep</li><li>Deeply conditions texture</li></ul>',
        price: 799,
        mrp: 1199,
        stock_quantity: 90,
        status: 'active',
        is_featured: 1,
        is_bestseller: 0,
        is_new: 1,
        length_cm: 6, width_cm: 6, height_cm: 18, weight: 280,
        primary_image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'ayurvedic oil, luxury hair oil, jatamansi, copper brewed',
        ingredients_list: 'Bhringraj, Amla, Brahmi, Jatamansi, Nagarmotha, Vetiver, Lotus Extract, Coconut Oil, Sesame Oil',
        badges: 'Ayurvedic Masterpiece',
        rating_avg: 5.0,
        rating_count: 128,
        sales_count: 540,
        variants: [
          { name: 'Volume', value: '200 ml', price_modifier: 0, stock_quantity: 90 }
        ],
        reviews: [
          { title: 'Pure luxury in a bottle', body: 'The golden colour and subtle herbal fragrance feel premium. Keeps my scalp calm and stress-free.', rating: 5 }
        ]
      },
      {
        category_slug: 'hair-growth-oils',
        name: 'Cold-Pressed Virgin Coconut & Curry Leaf Oil',
        slug: 'cold-pressed-virgin-coconut-curry-leaf-oil',
        sku: 'LKN-OIL-004',
        subtitle: 'Traditional South-Indian Nourishing Scalp Therapy',
        short_description: 'Fresh curry leaves infusing pure unrefined Kerala virgin coconut oil to restore lost hair melanin and boost tensile strength.',
        description: '<p>Curry leaves are packed with beta-carotene and amino acids that prevent thinning hair strands and premature grey hair. Synergistically combined with raw cold-pressed virgin coconut oil.</p>',
        how_to_use: '<p>Massage thoroughly twice a week. Suitable for regular use on kids and adults alike.</p>',
        benefits: '<ul><li>Prevents early grey hair</li><li>Deep moisture for dry frizzy ends</li><li>Soothes heat damaged hair</li></ul>',
        price: 389,
        mrp: 549,
        stock_quantity: 110,
        status: 'active',
        is_featured: 0,
        is_bestseller: 0,
        is_new: 0,
        length_cm: 5, width_cm: 5, height_cm: 15, weight: 220,
        primary_image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'virgin coconut oil, curry leaf, anti greying, south indian hair oil',
        ingredients_list: 'Virgin Coconut Oil, Fresh Curry Leaf Oil Extract, Methi Seeds, Vitamin E',
        badges: '100% Pure',
        rating_avg: 4.7,
        rating_count: 89,
        sales_count: 620,
        variants: [
          { name: 'Volume', value: '200 ml', price_modifier: 0, stock_quantity: 110 }
        ]
      },

      // CATEGORY 2: HERBAL SHAMPOOS
      {
        category_slug: 'herbal-shampoos',
        name: 'Amla & Shikakai Sulphate-Free Shampoo',
        slug: 'amla-shikakai-sulphate-free-shampoo',
        sku: 'LKN-SHM-001',
        subtitle: 'pH-Balanced Herbal Cleanser with Natural Saponins',
        short_description: 'Gentle clarifying shampoo made from wild Reetha nut saponins, raw Amla, and Shikakai that cleanses without stripping scalp oils.',
        description: '<p>Commercial shampoos wash away essential scalp lipids causing rebound greasiness. Our Amla & Shikakai cleanser uses 100% plant-derived saponins to gently lift dirt, excess sebum, and pollution micro-particles while preserving the natural acid mantle.</p>',
        how_to_use: '<ol><li>Dilute 10-15ml in half a cup of water.</li><li>Apply evenly onto wet scalp, lather gently, and rinse thoroughly.</li></ol>',
        benefits: '<ul><li>Zero SLS/SLES & Synthetic Dyes</li><li>Maintains 5.5 natural scalp pH</li><li>Keeps hair naturally soft without heavy silicones</li></ul>',
        price: 429,
        mrp: 599,
        stock_quantity: 200,
        status: 'active',
        is_featured: 1,
        is_bestseller: 1,
        is_new: 0,
        length_cm: 6, width_cm: 6, height_cm: 18, weight: 290,
        primary_image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'herbal shampoo, sulphate free, shikakai, reetha, amla shampoo',
        ingredients_list: 'Reetha (Soapnut) Extract, Shikakai Pod Extract, Fresh Amla Juice, Aloe Vera Leaf Juice, Purified Aqua, Coconut Glucoside',
        badges: 'Customer Favorite',
        rating_avg: 4.8,
        rating_count: 189,
        sales_count: 1120,
        variants: [
          { name: 'Volume', value: '250 ml', price_modifier: 0, stock_quantity: 100 },
          { name: 'Volume', value: '500 ml', price_modifier: 320, stock_quantity: 100 }
        ],
        reviews: [
          { title: 'Soft hair without conditioner!', body: 'My hair feels so clean and lightweight. It lathers surprisingly well for a natural shampoo!', rating: 5 }
        ]
      },
      {
        category_slug: 'herbal-shampoos',
        name: 'Rosemary & Tea Tree Anti-Dandruff Cleanser',
        slug: 'rosemary-tea-tree-anti-dandruff-cleanser',
        sku: 'LKN-SHM-002',
        subtitle: 'Targeted Anti-Fungal Therapy for Scalp Flaking',
        short_description: 'Combines organic Tea Tree, Neem, and Rosemary to soothe scalp itching and permanently eliminate persistent dandruff flakes.',
        description: '<p>Malassezia yeast fungus thrives on excess scalp oil causing chronic dandruff and inflammation. This targeted formula pairs Australian Tea Tree oil with Neem and Salicylic acid from Willow Bark to clarify the scalp bed and restore long-lasting freshness.</p>',
        how_to_use: '<p>Massage into wet hair focusing on scalp. Allow active botanicals to sit for 2 minutes before rinsing cleanly.</p>',
        benefits: '<ul><li>Clears 99% dandruff flakes within 3 washes</li><li>Reduces scalp itchiness instantly</li><li>Controls oily roots</li></ul>',
        price: 479,
        mrp: 649,
        stock_quantity: 140,
        status: 'active',
        is_featured: 1,
        is_bestseller: 0,
        is_new: 1,
        length_cm: 6, width_cm: 6, height_cm: 18, weight: 290,
        primary_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'anti-dandruff, tea tree shampoo, rosemary cleanser, scalp relief',
        ingredients_list: 'Organic Tea Tree Oil, Rosemary Water, Neem Leaf Extract, Willow Bark Salicylic Extract, Decyl Glucoside',
        badges: 'Scalp Therapy',
        rating_avg: 4.7,
        rating_count: 142,
        sales_count: 760,
        variants: [
          { name: 'Volume', value: '250 ml', price_modifier: 0, stock_quantity: 140 }
        ],
        reviews: [
          { title: 'Finally a shampoo that actually stops dandruff', body: 'Tried dozens of anti-dandruff products before this. Luv Kush Tea Tree Cleanser eliminated my flaking without drying out my hair.', rating: 5 }
        ]
      },
      {
        category_slug: 'herbal-shampoos',
        name: 'Keratin Protein & Milk Hydrating Shampoo',
        slug: 'keratin-protein-milk-hydrating-shampoo',
        sku: 'LKN-SHM-003',
        subtitle: 'Smoothing & Moisture Shield for Dry Hair',
        short_description: 'Enriched with natural Oat Milk proteins and hydrolysed wheat keratin to repair damaged cuticles and tame frizzy strands.',
        description: '<p>Ideal for dry, rough, or color-treated hair. The creamy oat milk formula envelops every strand in a moisture cushion, preventing split ends and friction breakage during washing.</p>',
        how_to_use: '<p>Lather gently on wet scalp and hair length. Rinse with cool water.</p>',
        benefits: '<ul><li>Smoothing & detangling effect</li><li>Protects dyed & bleached hair color</li><li>Adds silkiness</li></ul>',
        price: 499,
        mrp: 699,
        stock_quantity: 130,
        status: 'active',
        is_featured: 0,
        is_bestseller: 0,
        is_new: 0,
        length_cm: 6, width_cm: 6, height_cm: 18, weight: 290,
        primary_image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'keratin shampoo, hydrating shampoo, milk protein, dry hair treatment',
        ingredients_list: 'Oat Milk Extract, Hydrolyzed Wheat Keratin, Argan Kernel Oil, Plant Derived Glycerin, Aqua',
        badges: 'Deep Hydration',
        rating_avg: 4.8,
        rating_count: 95,
        sales_count: 510,
        variants: [
          { name: 'Volume', value: '250 ml', price_modifier: 0, stock_quantity: 130 }
        ]
      },

      // CATEGORY 3: SCALP & HAIR SERUMS
      {
        category_slug: 'scalp-hair-serums',
        name: 'Peptide & Redensyl Hair Density Serum',
        slug: 'peptide-redensyl-hair-density-serum',
        sku: 'LKN-SRM-001',
        subtitle: 'Advanced Biotechnology Scalp Drops for Thinning Hair',
        short_description: '3% Redensyl + 2% Anagain combined with Copper Tripeptides in a weightless aqueous base for 10,000+ new hairs in 90 days.',
        description: '<p>A revolutionary leave-on scalp treatment that targets hair loss at the cellular stem cell level. Redensyl reactivates outer root sheath stem cells while Anagain (derived from organic pea sprouts) prolongs the Anagen growth phase of the hair lifecycle.</p>',
        how_to_use: '<ol><li>Apply 1 full dropper directly onto clean dry scalp once daily at bedtime.</li><li>Massage lightly with fingertips. Do not rinse.</li></ol>',
        benefits: '<ul><li>Clinically proven stem-cell hair density increase</li><li>Non-greasy, fast-absorbing water base</li><li>Safe for daily long-term use</li></ul>',
        price: 899,
        mrp: 1299,
        stock_quantity: 110,
        status: 'active',
        is_featured: 1,
        is_bestseller: 1,
        is_new: 1,
        length_cm: 4, width_cm: 4, height_cm: 12, weight: 140,
        primary_image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'redensyl, hair serum, hair regrowth drops, peptide serum',
        ingredients_list: '3% Redensyl Complex, 2% Anagain, Copper Tripeptide-1, Rice Water Ferment, Niacinamide, Hyaluronic Acid',
        badges: 'Clinical Grade',
        rating_avg: 4.9,
        rating_count: 289,
        sales_count: 1850,
        variants: [
          { name: 'Size', value: '50 ml', price_modifier: 0, stock_quantity: 60 },
          { name: 'Size', value: '100 ml', price_modifier: 700, stock_quantity: 50 }
        ],
        reviews: [
          { title: 'Baby hairs growing after 2 months!', body: 'I noticed small baby hairs filling in my crown area after consistent daily application. Totally non-sticky.', rating: 5 }
        ]
      },
      {
        category_slug: 'scalp-hair-serums',
        name: 'Argan & Silk Frizz Control Shine Serum',
        slug: 'argan-silk-frizz-control-shine-serum',
        sku: 'LKN-SRM-002',
        subtitle: 'Instant Gloss & Heat Protection up to 230°C',
        short_description: 'Moroccan Cold-Pressed Argan oil blended with Hydrolysed Silk to instantly seal split ends, eliminate stubborn humidity frizz, and add mirror-like shine.',
        description: '<p>Tame wild flyaways and protect hair strands against heat styling tools with our Argan & Silk elixir. Protects hair shaft cuticles from heat damage while giving smooth, glass-hair shine without feeling heavy.</p>',
        how_to_use: '<p>Rub 2-3 drops between palms and smooth over damp hair from mid-lengths to ends before blow drying or styling.</p>',
        benefits: '<ul><li>24-Hour Humidity Shield</li><li>Thermal protection up to 230°C</li><li>Restores dry split ends instantly</li></ul>',
        price: 599,
        mrp: 849,
        stock_quantity: 130,
        status: 'active',
        is_featured: 1,
        is_bestseller: 0,
        is_new: 0,
        length_cm: 4, width_cm: 4, height_cm: 12, weight: 150,
        primary_image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'argan oil serum, heat protectant, shine serum, anti frizz',
        ingredients_list: 'Moroccan Argan Kernel Oil, Hydrolysed Silk Protein, Camellia Seed Oil, Cyclopentasiloxane, Vitamin E',
        badges: 'Styling Essential',
        rating_avg: 4.8,
        rating_count: 176,
        sales_count: 890,
        variants: [
          { name: 'Size', value: '100 ml', price_modifier: 0, stock_quantity: 130 }
        ],
        reviews: [
          { title: 'Gives amazing shine', body: 'Just a tiny drop makes my frizzy hair look salon-styled. Love the light glass-like shine!', rating: 5 }
        ]
      },

      // CATEGORY 4: NOURISHING HAIR MASKS
      {
        category_slug: 'nourishing-hair-masks',
        name: 'Deep Renewal Spa Hair Mask with Shea & Hibiscus',
        slug: 'deep-renewal-spa-hair-mask-shea-hibiscus',
        sku: 'LKN-MSK-001',
        subtitle: 'Intense Moisture Repair Butter for Damaged & Dry Hair',
        short_description: 'Rich Botanical Butter infused with Organic Raw Shea, Hibiscus Petal mucilage, and Keratin to deeply restore chemically treated hair.',
        description: '<p>Transform dry, brittle, chemically treated hair into silky strands. Our Deep Renewal Hair Mask penetrates 3 layers deep into the cortex to replenish lost amino acids, lock in moisture, and seal ragged cuticles.</p>',
        how_to_use: '<ol><li>After shampooing, scoop a generous amount and apply from roots to ends.</li><li>Leave for 15-20 minutes (use a shower cap for deep heat activation).</li><li>Rinse thoroughly.</li></ol>',
        benefits: '<ul><li>Repairs structural protein loss</li><li>Restores softness to bleached/dyed hair</li><li>Prevents snap breakage</li></ul>',
        price: 699,
        mrp: 999,
        stock_quantity: 95,
        status: 'active',
        is_featured: 1,
        is_bestseller: 1,
        is_new: 0,
        length_cm: 9, width_cm: 9, height_cm: 7, weight: 260,
        primary_image: 'https://images.unsplash.com/photo-1567928269937-ae1454f11d5e?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1567928269937-ae1454f11d5e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571875257727-256c39da42af?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'hair mask, hair spa, shea butter, hibiscus mask, keratin repair',
        ingredients_list: 'Raw Shea Butter, Hibiscus Rosa-Sinensis Flower Butter, Hydrolyzed Wheat Keratin, Mango Seed Butter, Coconut Milk Protein',
        badges: 'Salon Quality',
        rating_avg: 4.9,
        rating_count: 198,
        sales_count: 1340,
        variants: [
          { name: 'Weight', value: '200 g', price_modifier: 0, stock_quantity: 50 },
          { name: 'Weight', value: '400 g', price_modifier: 450, stock_quantity: 45 }
        ],
        reviews: [
          { title: 'Saved my heat-damaged hair!', body: 'I straighten my hair every week so my ends were fried. After 2 uses of this spa mask, my hair feels touchably soft again!', rating: 5 }
        ]
      },

      // CATEGORY 5: NATURAL HAIR WIGS
      {
        category_slug: 'natural-hair-wigs',
        name: 'Royal Silk Swiss Lace Front Human Hair Wig',
        slug: 'royal-silk-swiss-lace-front-wig-prod',
        sku: 'LKN-WIG-001',
        subtitle: '100% Virgin Indian Hair with Hand-Tied HD Lace',
        short_description: 'Undetectable HD Swiss lace front wig crafted with 100% Temple Virgin Remy hair. Allows multi-directional parting and natural movement.',
        description: '<p>Crafted with hand-tied HD Swiss lace that blends seamlessly with any skin tone. Made using 100% cuticle-aligned virgin Indian Remy hair that can be bleached, coloured, and heat-styled up to 220°C. Breathable cap with adjustable straps and secure silicone grip bands.</p>',
        how_to_use: '<ol><li>Secure natural hair flat with a wig cap.</li><li>Adjust rear tension straps for a snug fit.</li><li>Trim excess front HD lace along natural hairline.</li><li>Style as desired.</li></ol>',
        benefits: '<ul><li>100% Natural scalp hairline illusion</li><li>Breathable cap for 14+ hour daily wear</li><li>Can be dyed, ironed & washed</li></ul>',
        price: 14999,
        mrp: 19999,
        stock_quantity: 40,
        status: 'active',
        is_featured: 1,
        is_bestseller: 1,
        is_new: 1,
        length_cm: 30, width_cm: 20, height_cm: 10, weight: 450,
        primary_image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'human hair wig, lace front wig, natural wig, virgin hair',
        ingredients_list: '100% Temple Virgin Remy Human Hair, Swiss HD Lace Base, Hypoallergenic Elastic Mesh',
        badges: '100% Virgin Hair',
        rating_avg: 5.0,
        rating_count: 86,
        sales_count: 320,
        variants: [
          { name: 'Length', value: '18 inches', price_modifier: 0, stock_quantity: 20 },
          { name: 'Length', value: '24 inches', price_modifier: 3000, stock_quantity: 20 }
        ],
        reviews: [
          { title: 'Looks 100% like real hair from scalp', body: 'The HD lace is completely invisible! Nobody could tell I was wearing a wig. The hair quality is super smooth.', rating: 5 }
        ]
      },

      // CATEGORY 6: CUSTOM HAIR PATCHES
      {
        category_slug: 'custom-hair-patches',
        name: 'Miracle Skin Ultra-Thin Micro Poly Hair Patch',
        slug: 'miracle-skin-ultra-thin-micro-poly-hair-patch',
        sku: 'LKN-PTCH-001',
        subtitle: '0.03mm Breathable Non-Surgical Hair Replacement System',
        short_description: '0.03mm ultra-thin skin base hair system for men. Completely invisible hairline, water-proof and sweat-resistant for active lifestyles.',
        description: '<p>Designed for men seeking an instant, non-surgical hair restoration solution. The 0.03mm bio-skin base adheres to the scalp seamlessly, allowing you to swim, shower, workout, and sleep with 100% confidence.</p>',
        how_to_use: '<ol><li>Apply waterproof scalp adhesive or hold tape onto bald area.</li><li>Align patch over front hairline and press firmly for 30 seconds.</li><li>Style with comb or pomade.</li></ol>',
        benefits: '<ul><li>100% Seamless front hairline</li><li>Waterproof & sweat resistant for swimming/gym</li><li>Instant full hair volume boost</li></ul>',
        price: 8999,
        mrp: 12999,
        stock_quantity: 60,
        status: 'active',
        is_featured: 1,
        is_bestseller: 1,
        is_new: 0,
        length_cm: 25, width_cm: 20, height_cm: 8, weight: 350,
        primary_image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
        ]),
        tags: 'hair patch, men hair system, non surgical hair replacement, toupee',
        ingredients_list: '100% Real Human Hair, 0.03mm Bio-Poly Base Membrane',
        badges: 'Instant Transformation',
        rating_avg: 4.9,
        rating_count: 154,
        sales_count: 670,
        variants: [
          { name: 'Color', value: 'Natural Black (#1B)', price_modifier: 0, stock_quantity: 30 },
          { name: 'Color', value: 'Dark Brown (#2)', price_modifier: 0, stock_quantity: 30 }
        ],
        reviews: [
          { title: 'Restored my confidence completely', body: 'The patch looks so natural that my colleagues thought I grew my hair back naturally. The skin base is paper thin!', rating: 5 }
        ]
      }
    ];

    for (const p of productsData) {
      const categoryId = categoryMap.get(p.category_slug);
      if (!categoryId) continue;

      const existing = await db.queryOne('SELECT id FROM products WHERE slug = ?', [p.slug]);
      let productId: number;

      if (existing) {
        productId = existing.id;
        await db.query(
          `UPDATE products SET
            name = ?, subtitle = ?, description = ?, short_description = ?,
            how_to_use = ?, benefits = ?, price = ?, mrp = ?, stock_quantity = ?,
            status = ?, is_featured = ?, is_bestseller = ?, is_new = ?,
            length_cm = ?, width_cm = ?, height_cm = ?, weight = ?,
            primary_image = ?, images = ?, tags = ?, ingredients_list = ?,
            badges = ?, rating_avg = ?, rating_count = ?, sales_count = ?,
            category_id = ?
          WHERE id = ?`,
          [
            p.name, p.subtitle, p.description, p.short_description,
            p.how_to_use, p.benefits, p.price, p.mrp, p.stock_quantity,
            p.status, p.is_featured, p.is_bestseller, p.is_new,
            p.length_cm, p.width_cm, p.height_cm, p.weight,
            p.primary_image, p.images, p.tags, p.ingredients_list,
            p.badges, p.rating_avg, p.rating_count, p.sales_count,
            categoryId, productId
          ]
        );
      } else {
        const res = await db.query(
          `INSERT INTO products (
            category_id, name, slug, sku, subtitle, description, short_description,
            how_to_use, benefits, price, mrp, stock_quantity, status,
            is_featured, is_bestseller, is_new, length_cm, width_cm, height_cm, weight,
            primary_image, images, tags, ingredients_list, badges, rating_avg, rating_count, sales_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            categoryId, p.name, p.slug, p.sku, p.subtitle, p.description, p.short_description,
            p.how_to_use, p.benefits, p.price, p.mrp, p.stock_quantity, p.status,
            p.is_featured, p.is_bestseller, p.is_new, p.length_cm, p.width_cm, p.height_cm, p.weight,
            p.primary_image, p.images, p.tags, p.ingredients_list, p.badges, p.rating_avg, p.rating_count, p.sales_count
          ]
        );
        productId = res.insertId;
      }

      // Add Variants
      if (p.variants && p.variants.length > 0) {
        await db.query('DELETE FROM product_variants WHERE product_id = ?', [productId]);
        for (const v of p.variants) {
          await db.query(
            `INSERT INTO product_variants (product_id, name, value, price_modifier, stock_quantity, status) VALUES (?, ?, ?, ?, ?, 'active')`,
            [productId, v.name, v.value, v.price_modifier, v.stock_quantity]
          );
        }
      }

      // Add Reviews
      if (p.reviews && p.reviews.length > 0) {
        await db.query('DELETE FROM reviews WHERE product_id = ?', [productId]);
        for (const rev of p.reviews) {
          await db.query(
            `INSERT INTO reviews (product_id, user_id, rating, title, body, is_verified_purchase, status) VALUES (?, ?, ?, ?, ?, 1, 'approved')`,
            [productId, userId, rev.rating, rev.title, rev.body]
          );
        }
      }
    }
    logger.info(`Seeded ${productsData.length} products with reviews & variants.`);

    // 3. Seed Hair Solutions (Wigs & Patches)
    const hairSolutionsData = [
      {
        name: 'Royal Silk Swiss Lace Front Human Hair Wig',
        slug: 'royal-silk-swiss-lace-front-wig',
        type: 'wig',
        gender: 'female',
        base_price: 14999,
        mrp: 19999,
        short_description: '100% Virgin Remy Indian Human Hair with invisible Swiss HD lace front for natural movement and multi-directional parting.',
        description: 'Crafted with hand-tied HD Swiss lace that blends seamlessly with any skin tone. Made using 100% cuticle-aligned virgin Indian Remy hair that can be bleached, coloured, and heat-styled up to 220°C. Breathable cap with adjustable straps and secure silicone grip bands.',
        size_info: 'Medium Cap (21.5 - 22.5 inches adjustable)',
        colour_info: 'Natural Off-Black (#1B) & Warm Dark Brown (#2)',
        how_to_use: '1. Secure natural hair with a wig cap.\n2. Adjust rear straps for snug fit.\n3. Cut excess front HD lace along hairline.\n4. Style as desired.',
        hair_type: '100% Virgin Remy Human Hair',
        cap_construction: 'HD Swiss Lace Front + Stretch Net',
        hair_source: 'Temple Virgin Hair',
        density: '150% Natural Density',
        available_lengths: JSON.stringify(['16 inches', '20 inches', '24 inches']),
        available_colors: JSON.stringify(['Natural Black (#1B)', 'Chocolate Brown (#2)', 'Balayage Blonde Highlight']),
        maintenance_level: 'Low (Wash once every 15 wears)',
        primary_image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80'
        ]),
        is_featured: 1
      },
      {
        name: 'Glamour Waves Full Monofilament Custom Wig',
        slug: 'glamour-waves-full-monofilament-wig',
        type: 'wig',
        gender: 'female',
        base_price: 18499,
        mrp: 24999,
        short_description: 'Full monofilament top wig offering 360-degree scalp illusion, silky wave texture, and weightless all-day comfort.',
        description: 'Features a full monofilament top where each hair strand is individually hand-knotted. Simulates natural hair growing straight out of the scalp. Light, ultra-breathable, and ideal for sensitive scalps.',
        size_info: 'Custom Fitted',
        colour_info: 'Ombre Mocha & Dark Espresso',
        how_to_use: 'Place over head, align front hairline, and clip secure comb grips.',
        hair_type: '100% Premium European Touch Human Hair',
        cap_construction: 'Full Monofilament Top + Hand Tied Back',
        hair_source: 'Raw European Hair',
        density: '130% Light-Medium Density',
        available_lengths: JSON.stringify(['18 inches', '22 inches']),
        available_colors: JSON.stringify(['Mocha Brown', 'Deep Black', 'Honey Golden Highlights']),
        maintenance_level: 'Medium',
        primary_image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80'
        ]),
        is_featured: 1
      },
      {
        name: 'Miracle Skin Ultra-Thin Micro Poly Patch',
        slug: 'miracle-skin-ultra-thin-micro-poly-patch',
        type: 'patch',
        gender: 'male',
        base_price: 8999,
        mrp: 12999,
        short_description: '0.03mm ultra-thin skin base hair system for men. Completely invisible hairline, water-proof and sweat-resistant.',
        description: 'Designed for men seeking an instant, non-surgical hair restoration solution. The 0.03mm bio-skin base adheres to the scalp seamlessly, allowing you to swim, shower, workout, and sleep with 100% confidence.',
        size_info: '8x10 inches (Custom trim to exact patch size)',
        colour_info: 'Off Black / Darkest Brown',
        how_to_use: 'Apply waterproof ghost bond adhesive or ultra-hold tape onto bald scalp area, press system firmly for 30 seconds, and style hair.',
        hair_type: '100% Real Human Hair',
        cap_construction: '0.03mm Micro Translucent Poly Skin',
        hair_source: 'Indian Virgin Hair',
        density: '110% Natural Men Density',
        available_lengths: JSON.stringify(['6 inches (Standard Men Length)']),
        available_colors: JSON.stringify(['Jet Black (#1)', 'Off Black (#1B)', 'Dark Brown (#2)']),
        maintenance_level: 'Low (Re-tape every 2-3 weeks)',
        primary_image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
        ]),
        is_featured: 1
      },
      {
        name: 'French Lace Breathable Hybrid Hair System',
        slug: 'french-lace-breathable-hybrid-hair-system',
        type: 'patch',
        gender: 'male',
        base_price: 10999,
        mrp: 14999,
        short_description: 'French lace center with durable poly perimeter for maximum scalp ventilation in hot and humid climates.',
        description: 'The ultimate hybrid patch combining heat-dissipating French lace in the center with a poly skin border for easy cleaning and long-lasting tape hold. Perfect for active lifestyles and hot weather.',
        size_info: '8x10 inches (Trimmable)',
        colour_info: 'Natural Black & Dark Brown',
        how_to_use: 'Attach using scalp tape along the poly perimeter.',
        hair_type: '100% Human Hair',
        cap_construction: 'French Lace Center + Poly Perimeter',
        hair_source: 'Remy Human Hair',
        density: '120% Medium Density',
        available_lengths: JSON.stringify(['6 inches']),
        available_colors: JSON.stringify(['#1B Off Black', '#2 Dark Brown']),
        maintenance_level: 'Low',
        primary_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
        ]),
        is_featured: 1
      }
    ];

    for (const hs of hairSolutionsData) {
      const existing = await db.queryOne('SELECT id FROM hair_solutions WHERE slug = ?', [hs.slug]);
      if (existing) {
        await db.query(
          `UPDATE hair_solutions SET
            name = ?, type = ?, gender = ?, base_price = ?, mrp = ?,
            short_description = ?, description = ?, size_info = ?, colour_info = ?,
            how_to_use = ?, hair_type = ?, cap_construction = ?, hair_source = ?,
            density = ?, available_lengths = ?, available_colors = ?,
            maintenance_level = ?, primary_image = ?, images = ?, is_featured = ?, status = 'active'
          WHERE id = ?`,
          [
            hs.name, hs.type, hs.gender, hs.base_price, hs.mrp,
            hs.short_description, hs.description, hs.size_info, hs.colour_info,
            hs.how_to_use, hs.hair_type, hs.cap_construction, hs.hair_source,
            hs.density, hs.available_lengths, hs.available_colors,
            hs.maintenance_level, hs.primary_image, hs.images, hs.is_featured, existing.id
          ]
        );
      } else {
        await db.query(
          `INSERT INTO hair_solutions (
            name, slug, type, gender, base_price, mrp, short_description, description,
            size_info, colour_info, how_to_use, hair_type, cap_construction, hair_source,
            density, available_lengths, available_colors, maintenance_level,
            primary_image, images, is_featured, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
          [
            hs.name, hs.slug, hs.type, hs.gender, hs.base_price, hs.mrp, hs.short_description, hs.description,
            hs.size_info, hs.colour_info, hs.how_to_use, hs.hair_type, hs.cap_construction, hs.hair_source,
            hs.density, hs.available_lengths, hs.available_colors, hs.maintenance_level,
            hs.primary_image, hs.images, hs.is_featured
          ]
        );
      }
    }
    logger.info(`Seeded ${hairSolutionsData.length} hair solutions (wigs & patches).`);

    logger.info('Full demo data seed completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemoData();
