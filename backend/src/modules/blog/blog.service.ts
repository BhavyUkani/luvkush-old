import { db } from '../../utils/database';
import { AppError } from '../../middleware/error.middleware';

export class BlogService {
  async getAll(page: number, limit: number, tag?: string) {
    const conditions = ["b.status = 'published'"];
    const params: any[] = [];

    if (tag) { conditions.push('b.tags LIKE ?'); params.push(`%${tag}%`); }

    const sql = `
      SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image, b.tags,
        u.first_name as author_name, b.published_at, b.reading_time_mins
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE ${conditions.join(' AND ')} ORDER BY b.published_at DESC
    `;
    return db.paginate(sql, params, page, limit);
  }

  async getBySlug(slug: string) {
    const post = await db.queryOne<any>(`
      SELECT b.*, u.first_name as author_name
      FROM blog_posts b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.slug = ? AND b.status = 'published'
    `, [slug]);
    if (!post) throw new AppError('Post not found', 404);

    // Best-effort — doesn't hold up the response.
    db.query('UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = ?', [slug])
      .catch(() => { /* non-fatal */ });

    return post;
  }

  async create(data: {
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    cover_image?: string;
    tags?: string;
    status?: string;
    reading_time_mins?: number;
  }, authorId: number) {
    if (!data.title?.trim() || !data.slug?.trim()) throw new AppError('Title and slug are required', 400);
    const status = data.status || 'draft';

    const result = await db.query<any>(`
      INSERT INTO blog_posts (title, slug, content, excerpt, cover_image, tags, author_id, status, reading_time_mins, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${status === 'published' ? 'NOW()' : 'NULL'})
    `, [data.title.trim(), data.slug.trim(), data.content, data.excerpt, data.cover_image, data.tags, authorId, status, data.reading_time_mins || 5]);

    return { id: result.insertId };
  }

  async update(id: number, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    cover_image?: string;
    tags?: string;
    status?: string;
    reading_time_mins?: number;
  }) {
    await db.query(`
      UPDATE blog_posts SET title = ?, content = ?, excerpt = ?, cover_image = ?,
        tags = ?, status = ?, reading_time_mins = ?,
        ${data.status === 'published' ? 'published_at = COALESCE(published_at, NOW()),' : ''}
        updated_at = NOW()
      WHERE id = ?
    `, [data.title, data.content, data.excerpt, data.cover_image, data.tags, data.status, data.reading_time_mins || 5, id]);
  }

  async delete(id: number) {
    await db.query('DELETE FROM blog_posts WHERE id = ?', [id]);
  }
}
