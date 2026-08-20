export interface CourierRate {
    courier_company_id: number;
    courier_name: string;
    rate: number;
    expected_delivery_date: string;
    etd: string;
    rating: string;
    cod: number;
    charge_weight?: number;
    etd_hours?: number;
    raw_details?: any;
    delivery_performance?: string;
    rto_charge?: number;
    freight_charge?: number;
    cod_charges?: number;
    avg_forward_days?: number;
    avg_rto_days?: number;
}
export declare class ShiprocketService {
    private token;
    private tokenExpiry;
    private getAuthToken;
    getServiceableCouriers(params: {
        pickup_pincode?: string;
        delivery_pincode: string;
        weight: number;
        cod: boolean;
        declared_value: number;
        length?: number;
        width?: number;
        height?: number;
        shipment_mode?: 'road' | 'air';
    }): Promise<CourierRate[]>;
    bookShipment(order: any, params: any): Promise<{
        success: boolean;
        awb_code: string;
        label_url: string;
    }>;
    getTrackingStatus(awb: string): Promise<any>;
}
//# sourceMappingURL=shiprocket.service.d.ts.map