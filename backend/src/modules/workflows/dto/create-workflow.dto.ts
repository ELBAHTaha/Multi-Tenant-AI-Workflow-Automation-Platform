import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';

class WorkflowDefinitionDto {
  @IsArray()
  nodes!: Array<Record<string, unknown>>;

  @IsArray()
  edges!: Array<Record<string, unknown>>;
}

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => WorkflowDefinitionDto)
  definition!: WorkflowDefinitionDto;
}
