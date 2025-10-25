import { PartialType } from '@nestjs/mapped-types';
import { CreateDbTestDto } from './create-db-test.dto';

export class UpdateDbTestDto extends PartialType(CreateDbTestDto) {}
