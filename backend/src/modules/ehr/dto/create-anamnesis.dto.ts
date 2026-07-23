import { IsString, IsOptional, IsObject, IsInt } from 'class-validator';

export class CreateAnamnesisDto {
  @IsString()
  patientId: string;

  @IsOptional()
  @IsString()
  formType?: string;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsInt()
  version?: number;
}
