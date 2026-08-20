"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const database_1 = require("../../utils/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const helpers_1 = require("../../utils/helpers");
class CategoryService {
    async getAll(includeInactive = false) {
        const where = includeInactive ? '' : "WHERE c.status = 'active'";
        return database_1.db.query(`
      SELECT
        c.id, c.name, c.slug, c.description, c.image_url,
        c.icon, c.status, c.display_order, c.is_featured,
        c.meta_title, c.meta_description, c.parent_id,
        COUNT(DISTINCT p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
      ${where}
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `);
    }
    async getBySlug(slug) {
        return database_1.db.queryOne(`
      SELECT
        c.id, c.name, c.slug, c.description, c.image_url, c.icon,
        c.status, c.display_order, c.meta_title, c.meta_description,
        COUNT(DISTINCT p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
      WHERE c.slug = ? AND c.status = 'active'
      GROUP BY c.id
    `, [slug]);
    }
    async getById(id) {
        return database_1.db.queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    }
    async create(data) {
        const slug = await this.generateUniqueSlug(data.name);
        const result = await database_1.db.query(`
      INSERT INTO categories (name, slug, description, image_url, icon, parent_id, display_order, meta_title, meta_description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
            data.name, slug, data.description || null, data.image_url || null,
            data.icon || null, data.parent_id || null, data.display_order || 0,
            data.meta_title || null, data.meta_description || null
        ]);
        return this.getById(result.insertId);
    }
    async update(id, data) {
        const category = await this.getById(id);
        if (!category)
            throw new error_middleware_1.AppError('Category not found', 404);
        const slug = data.name && data.name !== category.name
            ? await this.generateUniqueSlug(data.name, id)
            : category.slug;
        const status = data.status !== undefined ? data.status : category.status;
        await database_1.db.query(`
      UPDATE categories SET
        name = ?, slug = ?, description = ?, image_url = ?, icon = ?,
        parent_id = ?, display_order = ?, meta_title = ?, meta_description = ?,
        status = ?, updated_at = NOW()
      WHERE id = ?
    `, [
            data.name || category.name, slug,
            data.description ?? category.description,
            data.image_url ?? category.image_url,
            data.icon ?? category.icon,
            data.parent_id ?? category.parent_id,
            data.display_order ?? category.display_order,
            data.meta_title ?? category.meta_title,
            data.meta_description ?? category.meta_description,
            status, id
        ]);
        return this.getById(id);
    }
    async delete(id) {
        const count = await database_1.db.queryOne('SELECT COUNT(*) as c FROM products WHERE category_id = ? AND status != "archived"', [id]);
        if (count?.c > 0)
            throw new error_middleware_1.AppError('Cannot delete category with active products', 400);
        await database_1.db.query("UPDATE categories SET status = 'inactive', updated_at = NOW() WHERE id = ?", [id]);
    }
    async generateUniqueSlug(name, excludeId) {
        let slug = (0, helpers_1.generateSlug)(name);
        let counter = 0;
        while (true) {
            const candidate = counter ? `${slug}-${counter}` : slug;
            const existing = await database_1.db.queryOne(`SELECT id FROM categories WHERE slug = ? ${excludeId ? 'AND id != ?' : ''}`, excludeId ? [candidate, excludeId] : [candidate]);
            if (!existing)
                return candidate;
            counter++;
        }
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=category.service.js.map