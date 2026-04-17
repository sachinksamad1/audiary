import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;
}
