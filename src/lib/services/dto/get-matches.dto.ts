import {
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  IsJSON,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetMatchesDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number = 0;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number = 10;

  @IsOptional()
  @IsJSON()
  include?: string;

  @IsOptional()
  @IsJSON()
  where?: string;

  @IsOptional()
  @IsJSON()
  orderBy?: string;

  @IsOptional()
  @IsString()
  tournamentId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFinal?: boolean;
}
