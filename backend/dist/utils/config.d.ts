interface Config {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    db: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
        poolMin: number;
        poolMax: number;
    };
    jwt: {
        accessSecret: string;
        accessExpiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
        fromName: string;
    };
    upload: {
        dir: string;
        maxSize: number;
        allowedTypes: string[];
    };
    frontendUrl: string;
    rateLimitWindowMs: number;
    rateLimitMax: number;
    razorpay: {
        keyId: string;
        keySecret: string;
        webhookSecret: string;
    };
}
export declare const config: Config;
export {};
//# sourceMappingURL=config.d.ts.map