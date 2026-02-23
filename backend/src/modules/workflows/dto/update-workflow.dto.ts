import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class WorkflowDefinitionUpdateDto {
  @IsArray()
  nodes!: Array<Record<string, unknown>>;

  @IsArray()
  edges!: Array<Record<string, unknown>>;
}

export class UpdateWorkflowDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkflowDefinitionUpdateDto)
  definition?: WorkflowDefinitionUpdateDto;
}
