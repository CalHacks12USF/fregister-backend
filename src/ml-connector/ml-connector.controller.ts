import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { MlConnectorService } from './ml-connector.service';
import { InventoryPayloadDto } from './dto/inventory-payload.dto';

@ApiTags('ml-connector')
@Controller('ml-connector')
export class MlConnectorController {
  constructor(private readonly mlConnectorService: MlConnectorService) {}

  @Post('inventory')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Receive and store inventory data from ML service',
    description: 'ML service sends inventory snapshots to this endpoint. Automatically updates the cache for fast reads.',
  })
  @ApiBody({ type: InventoryPayloadDto })
  @ApiResponse({
    status: 201,
    description: 'Inventory data successfully saved to database',
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
        },
        message: 'Inventory data saved successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid payload format',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to save data',
  })
  async receiveInventory(@Body() payload: InventoryPayloadDto) {
    return this.mlConnectorService.saveInventoryData(payload);
  }
}
