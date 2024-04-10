import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsDecimal, IsJSON, IsNotEmpty } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'Vintage Lamp', description: 'The title of the item' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'A rare and stylish vintage lamp from the 1950s.', description: 'The description of the item' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: '[\"http://example.com/image1.jpg\", \"http://example.com/image2.jpg\"]', description: 'JSON array of image URLs' })
  // @IsNotEmpty() TODO: uncomment when dealt with images storage
  @IsJSON()
  images?: string;

  @ApiProperty({ example: 100.00, description: 'The price of the item in the specified cryptocurrency' })
  @IsNotEmpty()
  @IsDecimal()
  price: string;

  @ApiProperty({ example: 'ETH', description: 'The cryptocurrency in which the price is denoted' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ example: 1 })
  @IsString()
  sellerId: string;

  @ApiProperty({ example: 1 })
  @IsString()
  groupId?: string;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}
