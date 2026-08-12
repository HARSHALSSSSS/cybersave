import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderMainServicesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderedIds!: string[];
}
