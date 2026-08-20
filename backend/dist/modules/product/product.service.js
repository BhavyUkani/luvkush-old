"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const database_1 = require("../../utils/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const helpers_1 = require("../../utils/helpers");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../../utils/config");
const VALID_PRODUCT_STATUSES = ['active', 'inactive', 'draft', 'archived'];
class ProductService {
    ALLOWED_SORT = ['created_at', 'price', 'name', 'rating_avg', 'sales_count'];
    async getAdminAll(filters) {
        const { page, limit, search, status, category } = filters;
        const conditions = [];
        const params = [];
        if (status) {
            conditions.push('p.status = ?');
            params.push(status);
        }
        else {
            conditions.push('p.status != "archived"');
        }
        if (category) {
            conditions.push('(c.slug = ? OR c.id = ?)');
            params.push(category, category);
        }
        if (search) {
            conditions.push('(p.name LIKE ? OR p.sku LIKE ?)');
            const t = `%${search}%`;
            params.push(t, t);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `
      SELECT p.id, p.name, p.slug, p.sku, p.price, p.mrp, p.stock_quantity,
        p.status, p.is_featured, p.is_bestseller, p.is_new, p.primary_image,
        p.created_at, p.updated_at, c.name as category_name, c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
      ORDER BY p.created_at DESC
    `;
        const [paginated, counts] = await Promise.all([
            database_1.db.paginate(sql, params, page, limit),
            database_1.db.query(`
        SELECT status, COUNT(*) as count 
        FROM products 
        GROUP BY status
      `)
        ]);
        const stats = {
            total: 0,
            active: 0,
            inactive: 0,
            draft: 0,
            archived: 0
        };
        for (const row of (counts || [])) {
            if (row.status === 'active')
                stats.active = Number(row.count);
            else if (row.status === 'inactive')
                stats.inactive = Number(row.count);
            else if (row.status === 'draft')
                stats.draft = Number(row.count);
            else if (row.status === 'archived')
                stats.archived = Number(row.count);
        }
        stats.total = stats.active + stats.inactive + stats.draft + stats.archived;
        return {
            ...paginated,
            stats
        };
    }
    async patch(id, data) {
        const updates = [];
        const params = [];
        if (data.is_featured !== undefined) {
            updates.push('is_featured = ?');
            params.push(data.is_featured ? 1 : 0);
        }
        if (data.is_bestseller !== undefined) {
            updates.push('is_bestseller = ?');
            params.push(data.is_bestseller ? 1 : 0);
        }
        if (data.is_new !== undefined) {
            updates.push('is_new = ?');
            params.push(data.is_new ? 1 : 0);
        }
        if (data.status !== undefined) {
            if (!VALID_PRODUCT_STATUSES.includes(data.status))
                throw new error_middleware_1.AppError('Invalid status', 400);
            updates.push('status = ?');
            params.push(data.status);
        }
        if (data.stock_quantity !== undefined) {
            const qty = Number(data.stock_quantity);
            if (!Number.isFinite(qty) || qty < 0)
                throw new error_middleware_1.AppError('stock_quantity must be a non-negative number', 400);
            updates.push('stock_quantity = ?');
            params.push(Math.floor(qty));
        }
        if (!updates.length)
            return;
        updates.push('updated_at = NOW()');
        params.push(id);
        await database_1.db.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    async getAll(filters) {
        const { page, limit, category, sort, order, minPrice, maxPrice, search, inStock, featured } = filters;
        const safeSort = this.ALLOWED_SORT.includes(sort) ? `p.${sort}` : 'p.created_at';
        const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';
        const conditions = ['p.status = "active"'];
        const params = [];
        if (category) {
            conditions.push('(c.slug = ? OR c.id = ?)');
            params.push(category, category);
        }
        if (minPrice !== undefined) {
            conditions.push('p.price >= ?');
            params.push(minPrice);
        }
        if (maxPrice !== undefined) {
            conditions.push('p.price <= ?');
            params.push(maxPrice);
        }
        if (search) {
            conditions.push("(p.name LIKE ? ESCAPE '\\\\' OR p.description LIKE ? ESCAPE '\\\\' OR p.tags LIKE ? ESCAPE '\\\\')");
            const escaped = search.replace(/[%_\\]/g, ch => `\\${ch}`);
            const term = `%${escaped}%`;
            params.push(term, term, term);
        }
        if (inStock) {
            conditions.push('p.stock_quantity > 0');
        }
        if (featured) {
            conditions.push('p.is_featured = 1');
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `
      SELECT
        p.id, p.name, p.slug, p.subtitle, p.price, p.mrp,
        p.stock_quantity, p.is_featured, p.is_bestseller, p.is_new,
        p.rating_avg, p.rating_count, p.sales_count,
        p.primary_image, p.images,
        p.short_description, p.badges, p.ingredients_list,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
      ORDER BY ${safeSort} ${safeOrder}
    `;
        return database_1.db.paginate(sql, params, page, limit);
    }
    async getFeatured(limit) {
        const safeLimit = Math.min(Math.max(1, Math.floor(Number(limit)) || 8), 50);
        return database_1.db.query(`
      SELECT p.id, p.name, p.slug, p.subtitle, p.price, p.mrp,
        p.rating_avg, p.rating_count, p.primary_image, p.images,
        p.is_bestseller, p.is_new, p.badges, p.ingredients_list,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active' AND p.is_featured = 1
      ORDER BY p.sales_count DESC
      LIMIT ${safeLimit}
    `);
    }
    async getBySlug(slug, userId) {
        const product = await database_1.db.queryOne(`
      SELECT
        p.*,
        c.name as category_name, c.slug as category_slug
        ${userId ? ', (SELECT 1 FROM wishlists WHERE user_id = ? AND product_id = p.id LIMIT 1) as is_wishlisted' : ''}
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.status = 'active'
    `, userId ? [userId, slug] : [slug]);
        if (!product)
            return null;
        // Fetch variants and reviews in separate queries (MariaDB 10.4 compatible)
        const [variants, recent_reviews] = await Promise.all([
            database_1.db.query(`
        SELECT id, name, value, price_modifier, stock_quantity as stock
        FROM product_variants
        WHERE product_id = ? AND status = 'active'
      `, [product.id]),
            database_1.db.query(`
        SELECT r.id, r.rating, r.title, r.body, r.created_at, u.first_name as user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ? AND r.status = 'approved'
        ORDER BY r.created_at DESC
        LIMIT 5
      `, [product.id])
        ]);
        product.variants = variants;
        product.recent_reviews = recent_reviews;
        // Increment view count without holding up the response — this is a
        // best-effort counter, not something the page load should wait on.
        database_1.db.query('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [product.id])
            .catch(() => { });
        return product;
    }
    async search(q, limit) {
        // Escape LIKE wildcards in user input so `%` / `_` in a search query
        // can't be used to widen the match beyond a literal substring search.
        const escaped = q.replace(/[%_\\]/g, ch => `\\${ch}`);
        const term = `%${escaped}%`;
        const safeLimit = Math.min(Math.max(1, Math.floor(Number(limit)) || 10), 50);
        return database_1.db.query(`
      SELECT p.id, p.name, p.slug, p.price, p.mrp, p.primary_image, p.category_id,
             p.tags, p.subtitle, p.rating_avg, p.rating_count, p.is_bestseller, p.is_new, p.stock_quantity,
             c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active' AND (p.name LIKE ? ESCAPE '\\\\' OR p.tags LIKE ? ESCAPE '\\\\' OR p.ingredients_list LIKE ? ESCAPE '\\\\')
      ORDER BY p.sales_count DESC
      LIMIT ${safeLimit}
    `, [term, term, term]);
    }
    async getRelated(productId) {
        return database_1.db.query(`
      SELECT p.id, p.name, p.slug, p.price, p.mrp, p.primary_image,
        p.rating_avg, p.rating_count
      FROM products p
      WHERE p.id != ?
        AND p.status = 'active'
        AND p.category_id = (SELECT category_id FROM products WHERE id = ?)
      ORDER BY p.sales_count DESC
      LIMIT 8
    `, [productId, productId]);
    }
    async create(data, files) {
        if (!data.name?.trim())
            throw new error_middleware_1.AppError('Product name is required', 400);
        if (data.price === undefined || data.price === '')
            throw new error_middleware_1.AppError('Price is required', 400);
        if (!data.category_id)
            throw new error_middleware_1.AppError('Category is required', 400);
        this.validatePricing(data);
        const slug = await this.generateUniqueSlug(data.name);
        const sku = (0, helpers_1.generateSku)(data.name, data.category_id);
        // Process images
        const images = [];
        for (const file of files || []) {
            const imageName = await this.processImage(file);
            images.push(imageName);
        }
        const n = (v) => (v === undefined || v === '') ? null : v;
        const result = await database_1.db.query(`
      INSERT INTO products (
        name, slug, sku, subtitle, description, short_description,
        how_to_use, benefits,
        price, mrp, cost_price, category_id, stock_quantity,
        is_featured, is_bestseller, is_new, status,
        primary_image, images, tags, ingredients_list, badges,
        seo_title, seo_description, seo_keywords,
        weight, length_cm, width_cm, height_cm,
        payment_mode, advance_amount, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            data.name, slug, sku, n(data.subtitle), n(data.description), n(data.short_description),
            n(data.how_to_use), n(data.benefits),
            Number(data.price), Number(data.mrp) || Number(data.price), n(data.cost_price) ? Number(data.cost_price) : null,
            data.category_id, data.stock_quantity || 0,
            data.is_featured || 0, data.is_bestseller || 0, data.is_new || 0, data.status || 'draft',
            images[0] || n(data.primary_image), images.length ? JSON.stringify(images) : (n(data.primary_image) ? JSON.stringify([data.primary_image]) : null),
            n(data.tags), n(data.ingredients_list), n(data.badges),
            n(data.seo_title), n(data.seo_description), n(data.seo_keywords),
            n(data.weight) ? Number(data.weight) : null,
            n(data.length_cm) ? Number(data.length_cm) : null,
            n(data.width_cm) ? Number(data.width_cm) : null,
            n(data.height_cm) ? Number(data.height_cm) : null,
            data.payment_mode || 'full_cod',
            n(data.advance_amount) ? Number(data.advance_amount) : null,
            null
        ]);
        return this.getById(result.insertId);
    }
    async update(id, data, files) {
        const product = await this.getById(id);
        if (!product)
            return null;
        this.validatePricing(data);
        if (data.status !== undefined && !VALID_PRODUCT_STATUSES.includes(data.status)) {
            throw new error_middleware_1.AppError('Invalid status', 400);
        }
        // Process newly uploaded files
        const uploadedUrls = [];
        for (const file of files || []) {
            const imageName = await this.processImage(file);
            uploadedUrls.push(imageName);
        }
        // The field is only absent when the client isn't managing images at all
        // (e.g. a non-multipart partial update through this endpoint) — an
        // explicit empty array means "every image was removed", which must be
        // honoured rather than silently falling back to the previous images.
        const imagesManaged = data.existing_images !== undefined;
        let keptUrls = [];
        try {
            if (imagesManaged)
                keptUrls = JSON.parse(data.existing_images);
        }
        catch { /* ignore */ }
        const n = (v) => (v === undefined || v === '') ? null : v;
        // Merge: kept URLs (admin-ordered) + newly uploaded appended
        const allImages = [...keptUrls, ...uploadedUrls];
        const imagesChanged = imagesManaged || uploadedUrls.length > 0;
        const newPrimary = imagesChanged ? (allImages[0] || null) : (n(data.primary_image) || product.primary_image);
        const newImages = imagesChanged ? (allImages.length ? JSON.stringify(allImages) : null) : product.images;
        // slug/sku are only touched when the caller explicitly supplies a new
        // value — both default to the product's current value otherwise — and
        // must stay unique across the rest of the catalogue.
        let slug = product.slug;
        if (data.slug && data.slug.trim()) {
            const normalized = (0, helpers_1.generateSlug)(data.slug);
            if (normalized !== slug) {
                const clash = await database_1.db.queryOne('SELECT id FROM products WHERE slug = ? AND id != ?', [normalized, id]);
                if (clash)
                    throw new error_middleware_1.AppError('This slug is already in use by another product', 409);
                slug = normalized;
            }
        }
        let sku = product.sku;
        if (data.sku && data.sku.trim() && data.sku !== sku) {
            const clash = await database_1.db.queryOne('SELECT id FROM products WHERE sku = ? AND id != ?', [data.sku, id]);
            if (clash)
                throw new error_middleware_1.AppError('This SKU is already in use by another product', 409);
            sku = data.sku;
        }
        await database_1.db.query(`
      UPDATE products SET
        name = ?, slug = ?, sku = ?, subtitle = ?, description = ?, short_description = ?,
        how_to_use = ?, benefits = ?,
        price = ?, mrp = ?, cost_price = ?, category_id = ?,
        stock_quantity = ?, is_featured = ?, is_bestseller = ?, is_new = ?,
        status = ?,
        tags = ?, ingredients_list = ?, badges = ?,
        seo_title = ?, seo_description = ?, seo_keywords = ?,
        weight = ?, length_cm = ?, width_cm = ?, height_cm = ?,
        payment_mode = ?, advance_amount = ?,
        primary_image = ?, images = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
            data.name, slug, sku, n(data.subtitle), n(data.description), n(data.short_description),
            n(data.how_to_use), n(data.benefits),
            Number(data.price), Number(data.mrp) || Number(data.price), n(data.cost_price) ? Number(data.cost_price) : null,
            data.category_id, data.stock_quantity ?? product.stock_quantity,
            data.is_featured || 0, data.is_bestseller || 0, data.is_new || 0,
            data.status || product.status || 'draft',
            n(data.tags), n(data.ingredients_list), n(data.badges),
            n(data.seo_title), n(data.seo_description), n(data.seo_keywords),
            n(data.weight) ? Number(data.weight) : null,
            n(data.length_cm) ? Number(data.length_cm) : null,
            n(data.width_cm) ? Number(data.width_cm) : null,
            n(data.height_cm) ? Number(data.height_cm) : null,
            data.payment_mode || 'full_cod',
            n(data.advance_amount) ? Number(data.advance_amount) : null,
            newPrimary, newImages,
            id
        ]);
        return this.getById(id);
    }
    async updateStatus(id, status) {
        if (!VALID_PRODUCT_STATUSES.includes(status))
            throw new error_middleware_1.AppError('Invalid status', 400);
        await database_1.db.query('UPDATE products SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
    }
    async delete(id) {
        const product = await this.getById(id);
        if (!product)
            throw new error_middleware_1.AppError('Product not found', 404);
        const ordered = await database_1.db.queryOne('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [id]);
        if (ordered) {
            // Products referenced by past orders are protected by ON DELETE
            // RESTRICT — archiving preserves order history while removing the
            // product from the storefront, instead of surfacing a raw FK 500.
            await database_1.db.query("UPDATE products SET status = 'archived', updated_at = NOW() WHERE id = ?", [id]);
            return;
        }
        await database_1.db.query('DELETE FROM products WHERE id = ?', [id]);
        // Non-fatal image file cleanup
        try {
            const imgPaths = [];
            if (product.primary_image)
                imgPaths.push(product.primary_image);
            try {
                imgPaths.push(...JSON.parse(product.images || '[]'));
            }
            catch { /* ignore */ }
            const seen = new Set();
            for (const rel of imgPaths) {
                if (!rel || !rel.startsWith('/uploads/'))
                    continue;
                const filename = path_1.default.basename(rel);
                const full = path_1.default.join(config_1.config.upload.dir, 'products', filename);
                if (!seen.has(full) && fs_1.default.existsSync(full)) {
                    fs_1.default.unlinkSync(full);
                    seen.add(full);
                }
            }
        }
        catch { /* non-fatal */ }
    }
    validatePricing(data) {
        if (data.price === undefined)
            return;
        const price = Number(data.price);
        if (!Number.isFinite(price) || price < 0)
            throw new error_middleware_1.AppError('price must be a non-negative number', 400);
        if (data.mrp !== undefined && data.mrp !== '' && data.mrp !== null) {
            const mrp = Number(data.mrp);
            if (!Number.isFinite(mrp) || mrp < price)
                throw new error_middleware_1.AppError('mrp cannot be less than price', 400);
        }
    }
    async getAdminById(id) {
        return database_1.db.queryOne('SELECT * FROM products WHERE id = ?', [id]);
    }
    async getById(id) {
        return database_1.db.queryOne('SELECT * FROM products WHERE id = ?', [id]);
    }
    async generateUniqueSlug(name) {
        let slug = (0, helpers_1.generateSlug)(name);
        let counter = 0;
        while (true) {
            const existing = await database_1.db.queryOne('SELECT id FROM products WHERE slug = ?', [counter ? `${slug}-${counter}` : slug]);
            if (!existing)
                return counter ? `${slug}-${counter}` : slug;
            counter++;
        }
    }
    async processImage(file) {
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;
        const productsDir = path_1.default.join(config_1.config.upload.dir, 'products');
        if (!fs_1.default.existsSync(productsDir)) {
            fs_1.default.mkdirSync(productsDir, { recursive: true });
        }
        const outputPath = path_1.default.join(productsDir, filename);
        await (0, sharp_1.default)(file.buffer)
            .resize(800, 1000, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .webp({ quality: 85 })
            .toFile(outputPath);
        return `/uploads/products/${filename}`;
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map