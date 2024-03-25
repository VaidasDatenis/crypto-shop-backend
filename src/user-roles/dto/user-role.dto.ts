import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserRoleDto {
  @ApiProperty({ example: '1234', description: 'User id' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: '4321.', description: 'Role id' })
  @IsNotEmpty()
  @IsString()
  roleId: string;
}

export class UpdateUserRoleDto extends PartialType(CreateUserRoleDto) {}
