import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsJSON, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';
import { UserRoles } from 'src/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: '0x123456789abcdef' })
  @IsNotEmpty()
  @IsString()
  walletAddress: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: ['USER'], required: true })
  @IsArray()
  @IsString({ each: true })
  userRoles?: string[];

  // @ApiProperty({ example: ['GROUP'], required: false })
  // @IsArray()
  // @IsString({ each: true })
  // groupRoles?: string[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
