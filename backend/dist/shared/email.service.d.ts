export declare class EmailService {
    private transporter;
    constructor();
    private baseTemplate;
    sendVerificationEmail(email: string, name: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, name: string, token: string): Promise<void>;
    sendOrderConfirmation(email: string, name: string, order: any): Promise<void>;
    sendContactAcknowledgement(email: string, name: string): Promise<void>;
    private send;
}
//# sourceMappingURL=email.service.d.ts.map