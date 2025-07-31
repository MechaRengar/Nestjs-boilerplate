import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQuery } from '@common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from '@common/pagination/dtos/pagination.list.dto';
import { PaginationService } from '@common/pagination/services/pagination.service';
import { RequestRequiredPipe } from '@common/request/pipes/request.required.pipe';
import { ResponsePaging } from '@common/response/decorators/response.decorator';
import { IResponsePaging } from '@common/response/interfaces/response.interface';
import { ActivitySharedListDoc } from '@modules/activity/docs/activity.shared.doc';
import { ActivityListResponseDto } from '@modules/activity/dtos/response/activity.list.response.dto';
import { IActivityDoc } from '@modules/activity/interfaces/activity.interface';
import { ActivityService } from '@modules/activity/services/activity.service';
import { ApiKeyProtected } from '@modules/api-key/decorators/api-key.decorator';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from '@modules/auth/decorators/auth.jwt.decorator';
import { UserProtected } from '@modules/user/decorators/user.decorator';
import { UserParsePipe } from '@modules/user/pipes/user.parse.pipe';
import { UserDoc } from '@modules/user/repository/entities/user.entity';

@ApiTags('modules.shared.activity')
@Controller({
    version: '1',
    path: '/activity',
})
export class ActivitySharedController {
    constructor(
        private readonly paginationService: PaginationService,
        private readonly activityService: ActivityService
    ) {}

    @ActivitySharedListDoc()
    @ResponsePaging('activity.list')
    @UserProtected()
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/list')
    async list(
        @AuthJwtPayload('user', RequestRequiredPipe, UserParsePipe)
        user: UserDoc,
        @PaginationQuery()
        { _search, _limit, _offset, _order }: PaginationListDto
    ): Promise<IResponsePaging<ActivityListResponseDto>> {
        const find: Record<string, any> = {
            ..._search,
        };

        const userHistories: IActivityDoc[] =
            await this.activityService.findAllByUser(user._id, find, {
                paging: {
                    limit: _limit,
                    offset: _offset,
                },
                order: _order,
            });
        const total: number = await this.activityService.getTotalByUser(
            user._id,
            find
        );
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );

        const mapped = this.activityService.mapList(userHistories);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }
}
