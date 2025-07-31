import {
  NumberFieldOptional,
  StringFieldOptional,
} from '../../decorators';
import { IsOptional, registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { ApiException } from '../../exceptions/api.exception';
import { HttpStatus } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

export function OrderBy(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'orderBy',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) {
            return false;
          }
          const data = value.split(':');
          if (
            data.length !== 2 ||
            (data[1].toLowerCase() !== 'desc' &&
              data[1].toLowerCase() !== 'asc')
          ) {
            return false;
          }
          if (!fields.includes(data[0])) {
            throw new ApiException(
              HttpStatus.BAD_REQUEST,
              `Order field must be one of [${fields.join(', ')}]`,
            );
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is not invalid`;
        },
      },
    });
  };
}

export class PageOptionsDto {
  // constructor({page, limit}: {page?: number, limit?: number}) {
  //   if (page){
  //     this.page = page;
  //   }
  //   if (limit){
  //     this.limit = limit;
  //   }
  // }
  @NumberFieldOptional({
    min: 1,
    default: 1,
    int: true,
  })
  page: number = 1;

  @NumberFieldOptional({
    min: 1,
    max: 50,
    int: true,
    default: 10,
    nullable: true,
  })
  limit!: number;

  get skip(): number {
    if (this.limit){
      return (this.page - 1) * this.limit;
    }
    return 0;
  }
}
export class PageOptionsAndKeywordDto {
  @ApiPropertyOptional()
  @IsOptional()
  keyword!: string | null;

  @NumberFieldOptional({
    min: 1,
    default: 1,
    int: true,
  })
  readonly page: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({enum: ['asc', 'desc']})
  @IsOptional()
  order!: string  | null;

  @NumberFieldOptional({
    min: 1,
    maximum: 50,
    int: true,
    default: 10,
    nullable: true,
  })
  readonly limit: number | 10 = 10;

  get skip(): number {
    if (this.limit){
      return (this.page - 1) * this.limit;
    }
    return 0;
  }
}
