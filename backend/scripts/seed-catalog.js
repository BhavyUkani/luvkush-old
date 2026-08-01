/**
 * Seeds the product catalogue from PRODUCT_MASTER_DATA.md.
 *
 * Product imagery points at real photography under the Angular assets folder —
 * `imageUrl()` on the frontend passes '/assets/...' through untouched.
 *
 * Run from the backend directory:  node scripts/seed-catalog.js
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MD = path.join(__dirname, '..', '..', 'PRODUCT_MASTER_DATA.md');

// ── Categories ────────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'hair-oil',  name: 'Hair Oil',  heading: 'Roots Grounded in Ayurveda',           sub: 'Ancient herbs. Modern science. Real results.', order: 1 },
  { slug: 'shampoo',   name: 'Shampoo',   heading: 'Clean Starts with Honest Ingredients', sub: 'No sulphates. No parabens. Just Ayurveda.',    order: 2 },
  { slug: 'hair-mask', name: 'Hair Mask', heading: 'Your Weekly Hair Ritual',              sub: 'Give your hair the treatment it deserves.',    order: 3 },
  { slug: 'soap',      name: 'Soap',      heading: 'Bathe in Tradition',                   sub: 'Five thousand years of Ayurvedic skincare.',   order: 4 },
  { slug: 'face-care', name: 'Face Care', heading: 'Glow from the Inside Out',             sub: 'Backed by Ayurveda. Proven by results.',       order: 5 },
];

const SECTION_TO_CATEGORY = {
  'HAIR OIL': 'hair-oil', 'SHAMPOO': 'shampoo', 'HAIR MASK': 'hair-mask',
  'SOAP': 'soap', 'FACE CARE': 'face-care',
};

// Categories with more than one photo alternate, so a grid never repeats a shot
// twice in a row.
const CATEGORY_IMAGES = {
  'hair-oil':  ['/assets/images/ayurvedic_hair_oil.png'],
  'shampoo':   ['/assets/images/ayurvedic_shampoo.png'],
  'hair-mask': ['/assets/images/botanical-flatlay.jpg'],
  'soap':      ['/assets/images/herbal-soap.jpg'],
  'face-care': ['/assets/images/face-serum.webp'],
};
const CATEGORY_TILE = {
  'hair-oil':  '/assets/images/ayurvedic_hair_oil.png',
  'shampoo':   '/assets/images/ayurvedic_shampoo.png',
  'hair-mask': '/assets/images/botanical-flatlay.jpg',
  'soap':      '/assets/images/herbal-soap.jpg',
  'face-care': '/assets/images/face-serum.webp',
};

// From the "HOMEPAGE RECOMMENDATIONS" section of the master data
const BESTSELLERS = ['LKN-HO-001', 'LKN-HO-004', 'LKN-SH-001', 'LKN-SP-001', 'LKN-FC-001'];
const FEATURED    = ['LKN-HO-005', 'LKN-HM-001', 'LKN-FC-005', 'LKN-HM-005'];
const NEW_ARRIVAL = ['LKN-FC-005', 'LKN-HO-002', 'LKN-SH-003', 'LKN-SP-004', 'LKN-HM-003'];

// ── Markdown parser ───────────────────────────────────────────
const num = (v) => { const m = String(v).replace(/[^0-9.]/g, ''); return m ? parseFloat(m) : null; };
const slugify = (s) => s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

function parseProducts(md) {
  const lines = md.split(/\r?\n/);
  const products = [];
  let section = null, cur = null, block = null;

  const flush = () => { if (cur && cur.sku) products.push(cur); cur = null; block = null; };

  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      const t = h1[1].trim();
      if (SECTION_TO_CATEGORY[t]) { flush(); section = SECTION_TO_CATEGORY[t]; }
      else if (t.startsWith('HAIR WIG') || t.startsWith('HAIR PATCH') || t.startsWith('HOMEPAGE')) { flush(); section = null; }
      continue;
    }
    if (/^##\s+Product\s+\d+/.test(line)) {
      flush();
      if (!section) continue;
      cur = { category: section, benefits: [], howTo: [], descParas: [] };
      continue;
    }
    if (!cur) continue;

    const row = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|\s*(.*?)\s*\|$/);
    if (row) {
      const k = row[1].trim(), v = row[2].trim();
      if (k === 'Name') cur.name = v;
      else if (k === 'SKU') cur.sku = v;
      else if (k === 'Subtitle') cur.subtitle = v;
      else if (k === 'MRP') cur.mrp = num(v);
      else if (k === 'Selling Price') cur.price = num(v);
      else if (k.startsWith('Weight')) cur.weight = num(v);
      else if (k.startsWith('Length')) cur.length = num(v);
      else if (k.startsWith('Width')) cur.width = num(v);
      else if (k.startsWith('Height')) cur.height = num(v);
      else if (k === 'Stock Quantity') cur.stock = num(v);
      else if (k === 'Payment Mode') cur.paymentMode = v.replace(/`/g, '');
      else if (k === 'Badges') cur.badges = v;
      else if (k === 'Tags') cur.tags = v;
      continue;
    }

    const seo = line.match(/^\*\*SEO (Title|Description|Keywords)\*\*\s*\|\s*(.+)$/);
    if (seo) { cur['seo' + seo[1]] = seo[2].trim(); block = null; continue; }

    const hdr = line.match(/^\*\*(Short Description|Full Description|Benefits|How To Use|Ingredients)\*\*\s*$/);
    if (hdr) { block = hdr[1]; continue; }

    const txt = line.trim();
    if (!txt || txt === '---' || /^\|/.test(txt)) continue;

    if (block === 'Short Description') cur.shortDesc = (cur.shortDesc ? cur.shortDesc + ' ' : '') + txt;
    else if (block === 'Full Description') cur.descParas.push(txt);
    else if (block === 'Benefits' && txt.startsWith('-')) cur.benefits.push(txt.replace(/^-\s*/, ''));
    else if (block === 'How To Use' && /^\d+\./.test(txt)) cur.howTo.push(txt.replace(/^\d+\.\s*/, ''));
    else if (block === 'Ingredients') cur.ingredients = (cur.ingredients ? cur.ingredients + ' ' : '') + txt;
  }
  flush();
  return products;
}

// ── Hair solutions (wigs / patches) ───────────────────────────
const WIG_IMG   = '/assets/images/premium_hair_wig.png';
const PATCH_IMG = '/assets/images/hair_patch.png';

const HAIR_SOLUTIONS = [
  { name: 'Signature Lace Front Wig — Men', type: 'wig', gender: 'male', price: 18999, mrp: 24999, cat: 15, img: WIG_IMG,
    desc: 'Swiss HD lace front with a bleached-knot hairline that disappears against the scalp. 100% Indian Remy hair, ethically sourced.', size: 'Custom fitted', colour: 'Natural Black / Dark Brown' },
  { name: 'Everyday Comfort Wig — Men', type: 'wig', gender: 'male', price: 12999, mrp: 16999, cat: 15, img: WIG_IMG,
    desc: 'Breathable mono-top cap built for daily wear, with a soft density that reads naturally in any light.', size: 'Standard + adjustable', colour: 'Natural Black' },
  { name: 'Full Lace Human Hair Wig — Women', type: 'wig', gender: 'female', price: 26999, mrp: 34999, cat: 16, img: WIG_IMG,
    desc: 'Full Swiss lace, so you can part it anywhere. Virgin Indian hair with cuticles intact and aligned.', size: 'Custom fitted', colour: 'Natural Black / Brown / Ombre' },
  { name: 'Silk Straight Lace Wig — Women', type: 'wig', gender: 'female', price: 21999, mrp: 28999, cat: 16, img: WIG_IMG,
    desc: 'Silk-base top that mimics a real scalp, finished with a hand-tied hairline for a flawless parting.', size: 'Custom fitted', colour: 'Natural Black / Dark Brown' },
  { name: 'Micro Thin Skin Hair Patch 0.03mm', type: 'patch', gender: 'unisex', price: 9999, mrp: 13999, cat: 17, img: PATCH_IMG,
    desc: 'Ultra-thin poly base that melts into the scalp. Waterproof, breathable and invisible from every angle.', size: '8" x 10" (customisable)', colour: 'Natural Black' },
  { name: 'Mono Lace Durable Hair Patch', type: 'patch', gender: 'unisex', price: 11999, mrp: 15999, cat: 17, img: PATCH_IMG,
    desc: 'Reinforced mono-lace base engineered for longevity without sacrificing a natural front hairline.', size: '8" x 10" (customisable)', colour: 'Natural Black / Dark Brown' },
];

// ── Reviews for social proof ──────────────────────────────────
const REVIEWS = [
  ['Absolutely worth it', 'Three months in and my hair fall has genuinely reduced. The oil is not sticky at all, which was my biggest worry with herbal oils.', 5],
  ['Noticeable difference', 'I was sceptical but my hairdresser actually asked what I had changed. Baby hairs coming in around the temples.', 5],
  ['Great, but takes patience', 'Do not expect miracles in two weeks. Around week six I started seeing less hair on my pillow. Sticking with it.', 4],
  ['Smells incredible', 'The herbal smell is earthy and clean, not overpowering like other ayurvedic oils I have used. My whole family uses it now.', 5],
  ['Good quality product', 'Packaging is premium and the product feels genuine. Delivery was quick too.', 4],
  ['Repurchasing for the third time', 'This has become a permanent part of my weekly routine. Nothing else has worked this consistently for me.', 5],
];

// ── Main ──────────────────────────────────────────────────────
(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: +(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'luvkush_natural',
  });

  const products = parseProducts(fs.readFileSync(MD, 'utf8'));
  console.log(`Parsed ${products.length} products from master data`);
  if (products.length < 20) throw new Error('Parser produced too few products — aborting');

  // Categories
  const catId = {};
  for (const c of CATEGORIES) {
    await db.execute(
      `INSERT INTO categories (name, slug, description, image_url, display_order, is_featured, is_active, status, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, 1, 1, 'active', ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url),
         display_order=VALUES(display_order), is_featured=1, is_active=1, status='active',
         meta_title=VALUES(meta_title), meta_description=VALUES(meta_description)`,
      [c.name, c.slug, c.sub, CATEGORY_TILE[c.slug], c.order, c.heading, c.sub]
    );
    const [[row]] = await db.query('SELECT id FROM categories WHERE slug = ?', [c.slug]);
    catId[c.slug] = row.id;
  }
  console.log(`Categories ready: ${Object.keys(catId).join(', ')}`);

  // Products
  const perCategoryCount = {};
  let n = 0;
  for (const p of products) {
    const idx = (perCategoryCount[p.category] = (perCategoryCount[p.category] ?? -1) + 1);
    const pool = CATEGORY_IMAGES[p.category] || ['/assets/images/placeholder.webp'];
    const img = pool[idx % pool.length];

    const description = p.descParas.join('\n\n');
    const benefits = p.benefits.join('\n');
    const howTo = p.howTo.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const badges = [
      BESTSELLERS.includes(p.sku) ? 'Bestseller' : null,
      NEW_ARRIVAL.includes(p.sku) ? 'New' : null,
    ].filter(Boolean).join(',');

    await db.execute(
      `INSERT INTO products
        (name, slug, sku, subtitle, description, short_description, how_to_use, benefits,
         price, mrp, cost_price, category_id, stock_quantity, status,
         is_featured, is_bestseller, is_new, primary_image, images, tags, ingredients_list, badges,
         seo_title, seo_description, seo_keywords, weight, length_cm, width_cm, height_cm,
         payment_mode, sales_count, view_count)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'active',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), subtitle=VALUES(subtitle), description=VALUES(description),
         short_description=VALUES(short_description), how_to_use=VALUES(how_to_use), benefits=VALUES(benefits),
         price=VALUES(price), mrp=VALUES(mrp), category_id=VALUES(category_id), stock_quantity=VALUES(stock_quantity),
         status='active', is_featured=VALUES(is_featured), is_bestseller=VALUES(is_bestseller), is_new=VALUES(is_new),
         primary_image=VALUES(primary_image), images=VALUES(images), tags=VALUES(tags),
         ingredients_list=VALUES(ingredients_list), badges=VALUES(badges), sales_count=VALUES(sales_count)`,
      [
        p.name, slugify(p.name), p.sku, p.subtitle || null, description || null, p.shortDesc || null,
        howTo || null, benefits || null,
        p.price, p.mrp || p.price, p.price ? Math.round(p.price * 0.42) : null,
        catId[p.category], p.stock ?? 100,
        FEATURED.includes(p.sku) ? 1 : 0,
        BESTSELLERS.includes(p.sku) ? 1 : 0,
        NEW_ARRIVAL.includes(p.sku) ? 1 : 0,
        img, JSON.stringify([img]), p.tags || null, p.ingredients || null, badges || null,
        p.seoTitle || null, p.seoDescription || null, p.seoKeywords || null,
        p.weight, p.length, p.width, p.height,
        p.paymentMode || 'full_cod',
        // Deterministic but varied, so "bestseller" ordering is meaningful
        BESTSELLERS.includes(p.sku) ? 600 - BESTSELLERS.indexOf(p.sku) * 70 : 120 + ((n * 37) % 160),
        400 + ((n * 91) % 900),
      ]
    );
    n++;
  }
  console.log(`Seeded ${n} products`);

  // Hair solutions
  for (const h of HAIR_SOLUTIONS) {
    await db.execute(
      `INSERT INTO hair_solutions
        (category_id, name, slug, description, short_description, base_price, mrp, gender,
         size_info, colour_info, type, status, primary_image, images, is_featured, hair_type,
         cap_construction, hair_source, density, maintenance_level)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,'active',?,?,1,'100% Human Remy Hair',?,'Indian Temple Hair','130% Natural','Low')
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), description=VALUES(description), short_description=VALUES(short_description),
         base_price=VALUES(base_price), mrp=VALUES(mrp), primary_image=VALUES(primary_image),
         images=VALUES(images), status='active', is_featured=1`,
      [h.cat, h.name, slugify(h.name), h.desc, h.desc, h.price, h.mrp, h.gender, h.size, h.colour, h.type,
       h.img, JSON.stringify([h.img]), h.type === 'wig' ? 'Full Lace / Mono Top' : 'Thin Skin Poly']
    );
  }
  console.log(`Seeded ${HAIR_SOLUTIONS.length} hair solutions`);

  // Reviews on bestsellers + featured, for visible social proof
  const [rows] = await db.query(
    `SELECT id FROM products WHERE sku IN (?) ORDER BY sales_count DESC`,
    [[...BESTSELLERS, ...FEATURED]]
  );
  await db.query('DELETE FROM reviews WHERE user_id = 3');
  let r = 0;
  for (const row of rows) {
    for (let k = 0; k < 3; k++) {
      const [t, body, rating] = REVIEWS[(r + k) % REVIEWS.length];
      await db.execute(
        `INSERT INTO reviews (product_id, user_id, rating, title, body, is_verified_purchase, status, helpful_votes, helpful_count, created_at)
         VALUES (?, 3, ?, ?, ?, 1, 'approved', ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
        [row.id, rating, t, body, 12 - k * 3, 12 - k * 3, (r + k) * 4 + 3]
      ).catch(() => {});
      r++;
    }
  }
  await db.query(`
    UPDATE products p SET
      rating_avg = COALESCE((SELECT ROUND(AVG(rating),2) FROM reviews WHERE product_id=p.id AND status='approved'), 0),
      rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id=p.id AND status='approved')`);
  console.log(`Seeded ${r} reviews`);

  const [[c1]] = await db.query("SELECT COUNT(*) c FROM products WHERE status='active'");
  const [[c2]] = await db.query("SELECT COUNT(*) c FROM hair_solutions WHERE status='active'");
  console.log(`\n✓ Done — ${c1.c} active products, ${c2.c} hair solutions`);
  await db.end();
})().catch(e => { console.error('SEED FAILED:', e.message); process.exit(1); });
