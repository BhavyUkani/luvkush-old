/** Parses jsonwebtoken-style duration strings ("15m", "8h", "30d") into
 * milliseconds. Falls back to 7 days for anything unrecognised. */
export declare function parseDurationMs(duration: string): number;
export declare class AuthService {
    private emailService;
    register(data: {
        first_name: string;
        last_name?: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: string;
            first_name: string;
            role: string;
        };
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            first_name: any;
            last_name: any;
            role: any;
        };
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    getUserById(userId: number): Promise<any>;
    private generateTokens;
    private storeRefreshToken;
}
//# sourceMappingURL=auth.service.d.ts.map