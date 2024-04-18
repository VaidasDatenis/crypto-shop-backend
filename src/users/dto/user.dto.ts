import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsEthereumAddress, IsJSON, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRoles } from 'src/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: '0x123456789abcdef' })
  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: ['USER'], required: true })
  @IsArray()
  @IsString({ each: true })
  userRoles?: UserRoles[];
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @IsEthereumAddress()
  walletAddress?: string;
  userRoles?: UserRoles[];
}
