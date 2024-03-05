import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsDecimal, IsJSON, IsNotEmpty, IsInt } from 'class-validator';

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
  @IsNotEmpty()
  @IsJSON()
  images: string; // You might need to parse/validate this as JSON in your service if you're storing it directly as JSON in the database.

  @ApiProperty({ example: '100.00', description: 'The price of the item in the specified cryptocurrency' })
  @IsNotEmpty()
  @IsDecimal()
  price: string; // or use number if you handle conversion to Decimal type in your service

  @ApiProperty({ example: 'ETH', description: 'The cryptocurrency in which the price is denoted' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ example: 1 })
  @IsString()
  sellerId: string;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}
