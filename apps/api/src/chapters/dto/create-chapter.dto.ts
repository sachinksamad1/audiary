import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
