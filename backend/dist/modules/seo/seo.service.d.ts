export interface SeoMeta {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
}
export declare class SeoService {
    getMetaForPath(urlPath: string): Promise<SeoMeta | null>;
}
//# sourceMappingURL=seo.service.d.ts.map