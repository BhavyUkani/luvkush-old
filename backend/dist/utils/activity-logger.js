"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const database_1 = require("./database");
async function logActivity(params) {
    try {
        await database_1.db.query(`INSERT INTO activity_logs
         (user_id, action, module, reference_type, reference_id, old_values, new_values, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`, [
            params.userId ?? null,
            params.action,
            params.module ?? null,
            params.referenceType ?? null,
            params.referenceId ?? null,
            params.oldValues ? JSON.stringify(params.oldValues) : null,
            params.newValues ? JSON.stringify(params.newValues) : null,
        ]);
    }
    catch {
        // Never let logging failures crash the calling operation
    }
}
//# sourceMappingURL=activity-logger.js.map