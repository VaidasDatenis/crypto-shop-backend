import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsJSON, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import { UserRoles } from 'src/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: '0x123456789abcdef' })
  @IsNotEmpty()
  @IsString()
  walletAddress: string;

  @ApiProperty({ example: '{"mainWallet": "0x123456789abcdef", "secondaryWallet": "0xfedcba987654321"}', required: false })
  @IsJSON() // Ensure this matches how you handle JSON parsing; you might need custom validation
  walletNames?: Prisma.JsonValue;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: ['USER'], required: true })
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
