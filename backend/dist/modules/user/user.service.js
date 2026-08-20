"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = require("../../utils/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    async getProfile(userId) {
        return database_1.db.queryOne(`
      SELECT id, first_name, last_name, email, phone, avatar_url, role, status, email_verified_at, created_at
      FROM users WHERE id = ?
    `, [userId]);
    }
    async updateProfile(userId, data) {
        const updates = [];
        const params = [];
        // `!== undefined` (not truthiness) so submitting an empty string clears
        // a field instead of being silently ignored as "no change" — a user
        // could otherwise never remove a last name or phone once set.
        if (data.first_name !== undefined) {
            updates.push('first_name = ?');
            params.push(data.first_name.trim());
        }
        if (data.last_name !== undefined) {
            updates.push('last_name = ?');
            params.push(data.last_name.trim() || null);
        }
        if (data.phone !== undefined) {
            updates.push('phone = ?');
            params.push(data.phone.trim() || null);
        }
        if (data.avatar_url !== undefined) {
            updates.push('avatar_url = ?');
            params.push(data.avatar_url || null);
        }
        if (updates.length === 0)
            throw new error_middleware_1.AppError('No fields to update', 400);
        updates.push('updated_at = NOW()');
        params.push(userId);
        await database_1.db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
        return this.getProfile(userId);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database_1.db.queryOne('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!valid)
            throw new error_middleware_1.AppError('Current password is incorrect', 400);
        if (newPassword.length < 8)
            throw new error_middleware_1.AppError('New password must be at least 8 characters', 400);
        const hash = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.db.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [hash, userId]);
        // A password change is exactly the moment a user suspects their account
        // is compromised — leaving other sessions' refresh tokens alive would
        // defeat the point of changing the password at all.
        await database_1.db.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
    }
    async getAddresses(userId) {
        return database_1.db.query('SELECT id, label, recipient_name as full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default, created_at FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [userId]);
    }
    async addAddress(userId, data) {
        const recipientName = data.full_name || data.recipient_name || '';
        const result = await database_1.db.transaction(async (conn) => {
            if (data.is_default) {
                await conn.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
            }
            const [insertResult] = await conn.execute(`
        INSERT INTO addresses (user_id, label, recipient_name, phone, address_line1, address_line2, city, state, pincode, country, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                userId, data.label || 'Home', recipientName, data.phone,
                data.address_line1, data.address_line2 || null,
                data.city, data.state, data.pincode, data.country || 'India',
                data.is_default ? 1 : 0
            ]);
            return insertResult;
        });
        return database_1.db.queryOne('SELECT id, label, recipient_name as full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default FROM addresses WHERE id = ?', [result.insertId]);
    }
    async updateAddress(userId, addressId, data) {
        const address = await database_1.db.queryOne('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
        if (!address)
            throw new error_middleware_1.AppError('Address not found', 404);
        const recipientName = data.full_name || data.recipient_name || '';
        await database_1.db.transaction(async (conn) => {
            if (data.is_default) {
                await conn.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
            }
            await conn.execute(`
        UPDATE addresses SET
          label = ?, recipient_name = ?, phone = ?,
          address_line1 = ?, address_line2 = ?,
          city = ?, state = ?, pincode = ?, country = ?,
          is_default = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `, [
                data.label || 'Home', recipientName, data.phone,
                data.address_line1, data.address_line2 || null,
                data.city, data.state, data.pincode, data.country || 'India',
                data.is_default ? 1 : 0, addressId, userId
            ]);
        });
        return database_1.db.queryOne('SELECT id, label, recipient_name as full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default FROM addresses WHERE id = ?', [addressId]);
    }
    async setDefaultAddress(userId, addressId) {
        const address = await database_1.db.queryOne('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
        if (!address)
            throw new error_middleware_1.AppError('Address not found', 404);
        await database_1.db.transaction(async (conn) => {
            await conn.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
            await conn.execute('UPDATE addresses SET is_default = 1 WHERE id = ?', [addressId]);
        });
    }
    async deleteAddress(userId, addressId) {
        const address = await database_1.db.queryOne('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
        if (!address)
            throw new error_middleware_1.AppError('Address not found', 404);
        await database_1.db.query('DELETE FROM addresses WHERE id = ?', [addressId]);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map