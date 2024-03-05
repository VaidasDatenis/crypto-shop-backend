import { Prisma } from '@prisma/client';
export declare class CreateUserDto {
    walletAddress: string;
    walletNames?: Prisma.JsonValue;
    email?: string;
}
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
}
export {};
