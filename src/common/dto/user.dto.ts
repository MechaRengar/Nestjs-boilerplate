import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { ApiException } from '../../exceptions/api.exception';
import { HttpStatus } from '@nestjs/common';
import { LogHelper } from '../../helpers/log.helper';

export function SubAccountPassword(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (!/^[A-Za-z0-9]+$/.test(value)) {
                        throw new ApiException(
                            HttpStatus.BAD_REQUEST,
                            `error.user.sub_account_password`
                        );
                    }
                    if (!new RegExp(`^.{8,20}$`).test(value)) {
                        throw new ApiException(
                            HttpStatus.BAD_REQUEST,
                            `error.user.sub_account_password`
                        );
                    }
                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return `error.user.sub_account_password`;
                },
            },
        });
    };
}

export function SubAccountUserName(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (!/^(?=.*[A-Za-z])[A-Za-z0-9_]{5,15}$/.test(value)) {
                        throw new ApiException(
                            HttpStatus.BAD_REQUEST,
                            `error.user.sub_account_username`
                        );
                    }
                    if (value.toString().trim().startsWith('bee_')) {
                        throw new ApiException(
                            HttpStatus.BAD_REQUEST,
                            `error.user.sub_account_username`
                        );
                    }
                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return `error.user.sub_account_username`;
                },
            },
        });
    };
}

const specialCharacters = `!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;

@ValidatorConstraint({ async: false })
class UserPasswordConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        if (!new RegExp(`^[A-Za-z${specialCharacters}\\d]+$`).test(value)) {
            args.constraints[0] = 0;
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                `error.user.user_password`
            );
            // return false;
        }
        if (!new RegExp(`^.{8,20}$`).test(value)) {
            args.constraints[0] = 1;
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                `error.user.user_password`
            );
            // return false;
        }
        if (
            !new RegExp(
                `^(?=.*[A-Z])[A-Za-z${specialCharacters}\\d]{8,20}$`
            ).test(value)
        ) {
            args.constraints[0] = 2;
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                `error.user.user_password`
            );
            // return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        // if (args.constraints[0] === 0) {
        //   return `Password must only contain letters, numbers and special characters`;
        // }
        // if (args.constraints[0] === 1) {
        //   return `Password length must be from 8 to 20 characters`;
        // }
        // if (args.constraints[0] === 2) {
        //   return `Please ensure your password includes at one least capital letter`;
        // }
        return `Please ensure your password is between 8 and 20 characters long, and includes at one least capital letter for enhanced security`;
    }
}

export function UserPassword(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: UserPasswordConstraint,
        });
    };
}

export function CurrentTimeUpdateDataUsed(
    validationOptions?: ValidationOptions
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isCurrentTimeWithinFiveMinutes',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    // Parse value as a timestamp
                    const currentTime = new Date(Number(value) * 1000);
                    if (isNaN(currentTime.getTime())) {
                        throw new ApiException(
                            HttpStatus.BAD_REQUEST,
                            `time update must be within 5 minutes of the current time`
                        );
                    }

                    const now = new Date();
                    const limitDelayInMillis = 10 * 60 * 1000;

                    // Check if 'current_time' is within 5 minutes of the current time
                    if (
                        now.getTime() < currentTime.getTime() ||
                        now.getTime() - currentTime.getTime() >
                            limitDelayInMillis
                    ) {
                        LogHelper.error({
                            message: `Time pass from server is invalid: ${currentTime.getTime()}. current time: ${now.getTime()}`,
                        });
                        throw new ApiException(
                            HttpStatus.BAD_REQUEST,
                            `time update must be within 10 minutes of the current time`,
                            {
                                translate: false,
                            }
                        );
                    }
                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be within 10 minutes of the current time.`;
                },
            },
        });
    };
}
