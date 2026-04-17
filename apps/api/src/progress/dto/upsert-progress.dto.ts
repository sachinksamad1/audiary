import { IsString, IsNotEmpty, IsInt, IsNumber, Min } from 'class-validator';

export class UpsertProgressDto {
  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsInt()
  @Min(0)
  chunkIndex!: number;

  @IsNumber()
  @Min(0)
  playbackPosition!: number;
}
