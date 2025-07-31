import { applyDecorators } from '@nestjs/common';
import {
    Doc,
    DocAuth,
    DocGuard,
    DocRequest,
    DocResponse,
    DocResponsePaging,
} from '@common/doc/decorators/doc.decorator';
import { SettingFeatureListResponseDto } from '@modules/setting/dtos/response/setting-feature.list.response.dto';
import { SettingFeatureGetResponseDto } from '@modules/setting/dtos/response/setting-feature.get.response.dto';
import { ENUM_DOC_REQUEST_BODY_TYPE } from '@common/doc/enums/doc.enum';
import { SettingDocParamsId } from '@modules/setting/constants/setting.doc.constant';
import { SettingFeatureUpdateRequestDto } from '@modules/setting/dtos/request/setting-feature.update.request.dto';

export function SettingAdminListDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'return list of all feature settings',
        }),
        DocAuth({
            xApiKey: true,
            jwtAccessToken: true,
        }),
        DocGuard({
            policy: true,
            role: true,
        }),
        DocResponsePaging<SettingFeatureListResponseDto>('setting.list', {
            dto: SettingFeatureListResponseDto,
        })
    );
}

export function SettingAdminFlushDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'flush feature settings',
        }),
        DocAuth({
            xApiKey: true,
            jwtAccessToken: true,
        }),
        DocGuard({
            policy: true,
            role: true,
        }),
        DocResponse('setting.flush')
    );
}

export function SettingAdminUpdateDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'update feature setting',
        }),
        DocAuth({
            xApiKey: true,
            jwtAccessToken: true,
        }),
        DocRequest({
            params: SettingDocParamsId,
            bodyType: ENUM_DOC_REQUEST_BODY_TYPE.JSON,
            dto: SettingFeatureUpdateRequestDto,
        }),
        DocGuard({
            policy: true,
            role: true,
        }),
        DocResponse<SettingFeatureGetResponseDto>('setting.update', {
            dto: SettingFeatureGetResponseDto,
        })
    );
}
