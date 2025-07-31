import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import _ from 'lodash';

export class ValidateException extends BadRequestException {
  constructor(errors: ValidationError[]) {
    const constraints: { property: string; message: string }[] = [];

    const findConstraints = (err: ValidationError): void => {
      if (err.constraints) {
        for (const [constraintKey, constraint] of Object.entries(err.constraints)) {
          constraints.push({
            property: err.property,
            message: constraint || `error.fields.${_.snakeCase(constraintKey)}`,
          });
        }
      }
      if (err.children && err.children.length > 0) {
        err.children.forEach((child) => findConstraints(child));
      }
    };

    errors.forEach((err) => findConstraints(err));

    super(constraints, constraints.map((c) => c.message).join(', '));
  }
}

