import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { ApiException } from '../../exceptions/api.exception';
import { HttpStatus } from '@nestjs/common';

export function IsDateFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value === 'string' && /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)){
            return true;
          }
          throw new ApiException(
            HttpStatus.BAD_REQUEST,
            `${args.property} must be in the format YYYY-MM-DD`,
          );
        },
      },
    });
  };
}
