import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateChapterDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
