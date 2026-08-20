import { PoolConnection } from 'mysql2/promise';
declare class Database {
    private pool;
    constructor();
    getConnection(): Promise<PoolConnection>;
    end(): Promise<void>;
    query<T = any>(sql: string, params?: any[]): Promise<T>;
    queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
    transaction<T>(callback: (conn: PoolConnection) => Promise<T>): Promise<T>;
    paginate<T>(sql: string, params: any[], page: number, limit: number): Promise<{
        data: T[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
}
export declare const db: Database;
export {};
//# sourceMappingURL=database.d.ts.map