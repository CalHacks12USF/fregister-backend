import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryItemDto {
  @ApiProperty({
    description: 'Name of the inventory item',
    example: 'apple',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Quantity of the inventory item',
    example: 3,
  })
  @IsNumber()
  quantity: number;
}

export class InventoryPayloadDto {
  @ApiProperty({
    description: 'Timestamp when the inventory was recorded',
    example: '2025-10-24T20:55:02Z',
  })
  @IsDateString()
  timestamp: string;

  @ApiProperty({
    description: 'List of inventory items',
    type: [InventoryItemDto],
    example: [
      { name: 'apple', quantity: 3 },
      { name: 'banana', quantity: 1 },
      { name: 'yogurt', quantity: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  inventory: InventoryItemDto[];
}
