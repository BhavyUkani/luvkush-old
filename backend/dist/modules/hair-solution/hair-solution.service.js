"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HairSolutionService = void 0;
const database_1 = require("../../utils/database");
class HairSolutionService {
    async getFeatured() {
        return database_1.db.query(`
      SELECT p.id, p.name, p.slug, p.subtitle, p.short_description,
        p.price, p.mrp, p.primary_image, p.rating_avg, p.rating_count,
        p.is_bestseller, p.badges,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
        AND (c.slug IN ('hair-wigs', 'hair-patches', 'hair-extensions') OR p.tags LIKE '%hair-solution%')
      ORDER BY p.sales_count DESC
      LIMIT 20
    `);
    }
    async getWigs(gender) {
        const conditions = ["hs.type = 'wig'", "hs.status = 'active'"];
        const params = [];
        if (gender) {
            conditions.push('hs.gender = ?');
            params.push(gender);
        }
        return database_1.db.query(`
      SELECT hs.id, hs.name, hs.slug, hs.short_description, hs.base_price as price, hs.mrp,
        hs.primary_image, hs.gender, hs.size_info, hs.colour_info, hs.status
      FROM hair_solutions hs
      WHERE ${conditions.join(' AND ')}
      ORDER BY hs.created_at DESC
    `, params);
    }
    async getPatches() {
        return database_1.db.query(`
      SELECT hs.id, hs.name, hs.slug, hs.short_description, hs.base_price as price, hs.mrp,
        hs.primary_image, hs.size_info, hs.colour_info, hs.status
      FROM hair_solutions hs
      WHERE hs.type = 'patch' AND hs.status = 'active'
      ORDER BY hs.created_at DESC
    `);
    }
    async getBySlug(slug) {
        return database_1.db.queryOne("SELECT * FROM hair_solutions WHERE slug = ? AND status = 'active'", [slug]);
    }
}
exports.HairSolutionService = HairSolutionService;
//# sourceMappingURL=hair-solution.service.js.map