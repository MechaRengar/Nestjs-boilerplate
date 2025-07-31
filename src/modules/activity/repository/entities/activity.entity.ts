import { DatabaseUUIDEntityBase } from '@common/database/bases/database.uuid.entity';
import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from '@common/database/decorators/database.decorator';
import { IDatabaseDocument } from '@common/database/interfaces/database.interface';
import { UserEntity } from '@modules/user/repository/entities/user.entity';

export const ActivityTableName = 'Activities';

@DatabaseEntity({ collection: ActivityTableName })
export class ActivityEntity extends DatabaseUUIDEntityBase {
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
    description: string;

    @DatabaseProp({
        required: true,
        trim: true,
        type: String,
        ref: UserEntity.name,
    })
    by: string;
}

export const ActivitySchema = DatabaseSchema(ActivityEntity);
export type ActivityDoc = IDatabaseDocument<ActivityEntity>;
