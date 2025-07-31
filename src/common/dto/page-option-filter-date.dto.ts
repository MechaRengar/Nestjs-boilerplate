import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  BooleanFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../decorators';
import { IsOptional } from 'class-validator';
import { PageOptionsDto } from './page-options.dto';

export class PageOptionsFilterDateDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  readonly sort?: string;

  @ApiPropertyOptional({enum: ['asc', 'desc']})
  @IsOptional()
  readonly order?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly keyword?: string;

  @StringFieldOptional({ nullable: true })
  start_date!: string;

  @StringFieldOptional({ nullable: true })
  end_date!: string;

  @ApiPropertyOptional()
  @BooleanFieldOptional()
  @IsOptional()
  allTime!: boolean;

  @ApiPropertyOptional()
  @BooleanFieldOptional()
  @IsOptional()
  all_time!: boolean;

  @ApiPropertyOptional()
  @BooleanFieldOptional()
  @IsOptional()
  first_time!: boolean;
}