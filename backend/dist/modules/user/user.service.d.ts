export declare class UserService {
    getProfile(userId: number): Promise<any>;
    updateProfile(userId: number, data: {
        first_name?: string;
        last_name?: string;
        phone?: string;
        avatar_url?: string;
    }): Promise<any>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
    getAddresses(userId: number): Promise<any>;
    addAddress(userId: number, data: {
        label?: string;
        full_name?: string;
        recipient_name?: string;
        phone: string;
        address_line1: string;
        address_line2?: string;
        city: string;
        state: string;
        pincode: string;
        country?: string;
        is_default?: boolean;
    }): Promise<any>;
    updateAddress(userId: number, addressId: number, data: any): Promise<any>;
    setDefaultAddress(userId: number, addressId: number): Promise<void>;
    deleteAddress(userId: number, addressId: number): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map