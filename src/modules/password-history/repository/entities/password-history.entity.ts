import { DatabaseUUIDEntityBase } from '@common/database/bases/database.uuid.entity';
import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from '@common/database/decorators/database.decorator';
import { IDatabaseDocument } from '@common/database/interfaces/database.interface';
import { ENUM_PASSWORD_HISTORY_TYPE } from '@modules/password-history/enums/password-history.enum';
import { UserEntity } from '@modules/user/repository/entities/user.entity';

export const PasswordHistoryTableName = 'PasswordHistories';

@DatabaseEntity({ collection: PasswordHistoryTableName })
export class PasswordHistoryEntity extends DatabaseUUIDEntityBase {
    @DatabaseProp({
        required: true,
        index: true,
        trim: true,
        type: String,
        ref: UserEntity.name,
    })
    user: string;

    @DatabaseProp({
        required: true,
        type: String,
    })
    password: string;

    @DatabaseProp({
        required: true,
        type: String,
        enum: ENUM_PASSWORD_HISTORY_TYPE,
    })
    type: ENUM_PASSWORD_HISTORY_TYPE;

    @DatabaseProp({
        required: true,
        type: Date,
    })
    expiredAt: Date;

    @DatabaseProp({
        required: true,
        trim: true,
        type: String,
        ref: UserEntity.name,
    })
    by: string;
}

export const PasswordHistorySchema = DatabaseSchema(PasswordHistoryEntity);
export type PasswordHistoryDoc = IDatabaseDocument<PasswordHistoryEntity>;
