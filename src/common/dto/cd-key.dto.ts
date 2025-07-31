import {
  registerDecorator, ValidationArguments, ValidationOptions,
} from 'class-validator';
import { ApiException } from '../../exceptions/api.exception';
import { HttpStatus } from '@nestjs/common';

export function CdKeyCode(
  validationOptions?: ValidationOptions,
) {
  return function(object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!(/^[A-Za-z0-9]+$/.test(value))) {
            throw new ApiException(
              HttpStatus.BAD_REQUEST,
              `format code is invalid`,
              {
                translate: false,
              }
            );
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `format code is invalid`;
        },
      },
    });
  };
}
