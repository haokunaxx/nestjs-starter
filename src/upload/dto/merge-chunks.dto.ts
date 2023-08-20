import { IsString, IsNumber } from 'class-validator';

export class MergeChunksDto {
  @IsString()
  hash: string;

  @IsNumber()
  chunkSize: number;

  @IsNumber()
  total: number;

  @IsString()
  fileName: string;
}
