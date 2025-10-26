import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('latest')
  @ApiOperation({
    summary: 'Get the most recent inventory snapshot',
    description:
      'Returns the latest inventory data. Uses in-memory caching for better performance (60s TTL)',
  })
  @ApiResponse({
    status: 200,
    description: 'Latest inventory data retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          timestamp: '2025-10-24T20:55:02Z',
          inventory: [
            { name: 'apple', quantity: 3 },
            { name: 'banana', quantity: 1 },
            { name: 'yogurt', quantity: 2 },
          ],
          created_at: '2025-10-24T20:55:05Z',
          updated_at: '2025-10-24T20:55:05Z',
        },
        cached: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No inventory data found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getLatest() {
    return this.inventoryService.getLatest();
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get historical inventory snapshots',
    description:
      'Returns paginated historical inventory data for analytics and reporting',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records to return (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of records to skip (default: 0)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Historical inventory data retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 2,
            timestamp: '2025-10-24T21:00:00Z',
            inventory: [
              { name: 'apple', quantity: 2 },
              { name: 'banana', quantity: 1 },
            ],
            created_at: '2025-10-24T21:00:05Z',
            updated_at: '2025-10-24T21:00:05Z',
          },
          {
            id: 1,
            timestamp: '2025-10-24T20:55:02Z',
            inventory: [
              { name: 'apple', quantity: 3 },
              { name: 'banana', quantity: 1 },
            ],
            created_at: '2025-10-24T20:55:05Z',
            updated_at: '2025-10-24T20:55:05Z',
          },
        ],
        total: 2,
        limit: 10,
        offset: 0,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getHistory(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const parsedLimit = Math.min(limit || 10, 100); // Max 100 records
    const parsedOffset = offset || 0;
    return this.inventoryService.getHistory(parsedLimit, parsedOffset);
  }
}
