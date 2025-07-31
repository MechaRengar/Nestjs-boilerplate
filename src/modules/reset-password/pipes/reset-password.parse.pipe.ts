import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ResetPasswordDoc } from '@modules/reset-password/repository/entities/reset-password.entity';
import { ResetPasswordService } from '@modules/reset-password/services/reset-password.service';
import { ENUM_ROLE_STATUS_CODE_ERROR } from '@modules/role/enums/role.status-code.enum';

@Injectable()
export class ResetPasswordParseByTokenPipe implements PipeTransform {
    constructor(private readonly resetPasswordService: ResetPasswordService) {}

    async transform(value: string): Promise<ResetPasswordDoc> {
        const resetPassword: ResetPasswordDoc =
            await this.resetPasswordService.findOneByToken(value);
        if (!resetPassword) {
            throw new NotFoundException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'resetPassword.error.notFound',
            });
        }

        return resetPassword;
    }
}
