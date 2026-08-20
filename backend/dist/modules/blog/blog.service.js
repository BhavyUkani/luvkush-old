"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const database_1 = require("../../utils/database");
const error_middleware_1 = require("../../middleware/error.middleware");
class BlogService {
    async getAll(page, limit, tag) {
        const conditions = ["b.status = 'published'"];
        const params = [];
        if (tag) {
            conditions.push('b.tags LIKE ?');
            params.push(`%${tag}%`);
        }
        const sql = `
      SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image, b.tags,
        u.first_name as author_name, b.published_at, b.reading_time_mins
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE ${conditions.join(' AND ')} ORDER BY b.published_at DESC
    `;
        return database_1.db.paginate(sql, params, page, limit);
    }
    async getBySlug(slug) {
        const post = await database_1.db.queryOne(`
      SELECT b.*, u.first_name as author_name
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.slug = ? AND b.status = 'published'
    `, [slug]);
        if (!post)
            throw new error_middleware_1.AppError('Post not found', 404);
        // Best-effort — doesn't hold up the response.
        database_1.db.query('UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = ?', [slug])
            .catch(() => { });
        return post;
    }
    async create(data, authorId) {
        if (!data.title?.trim() || !data.slug?.trim())
            throw new error_middleware_1.AppError('Title and slug are required', 400);
        const status = data.status || 'draft';
        const result = await database_1.db.query(`
      INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, tags, author_id, status, reading_time_mins, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${status === 'published' ? 'NOW()' : 'NULL'})
    `, [data.title.trim(), data.slug.trim(), data.content, data.excerpt, data.cover_image, data.tags, authorId, status, data.reading_time_mins || 5]);
        return { id: result.insertId };
    }
    async update(id, data) {
        await database_1.db.query(`
      UPDATE blog_posts SET title = ?, content = ?, excerpt = ?, cover_image = ?,
        tags = ?, status = ?, reading_time_mins = ?,
        ${data.status === 'published' ? 'published_at = COALESCE(published_at, NOW()),' : ''}
        updated_at = NOW()
      WHERE id = ?
    `, [data.title, data.content, data.excerpt, data.cover_image, data.tags, data.status, data.reading_time_mins || 5, id]);
    }
    async delete(id) {
        await database_1.db.query('DELETE FROM blog_posts WHERE id = ?', [id]);
    }
}
exports.BlogService = BlogService;
//# sourceMappingURL=blog.service.js.map