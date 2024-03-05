export declare class CreateItemDto {
    title: string;
    description: string;
    images: string;
    price: string;
    currency: string;
    sellerId: string;
}
declare const UpdateItemDto_base: import("@nestjs/common").Type<Partial<CreateItemDto>>;
export declare class UpdateItemDto extends UpdateItemDto_base {
}
export {};
