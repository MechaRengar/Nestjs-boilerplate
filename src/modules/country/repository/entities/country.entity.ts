import { DatabaseUUIDEntityBase } from '@common/database/bases/database.uuid.entity';
import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from '@common/database/decorators/database.decorator';
import { IDatabaseDocument } from '@common/database/interfaces/database.interface';

export const CountryTableName = 'Countries';

@DatabaseEntity({ collection: CountryTableName })
export class CountryEntity extends DatabaseUUIDEntityBase {
    @DatabaseProp({
        required: true,
        index: true,
        maxlength: 100,
    })
    name: string;

    @DatabaseProp({
        required: true,
        index: true,
        unique: true,
        trim: true,
        maxlength: 2,
        minlength: 2,
        uppercase: true,
    })
    alpha2Code: string;

    @DatabaseProp({
        required: true,
        index: true,
        unique: true,
        trim: true,
        maxlength: 3,
        minlength: 3,
        uppercase: true,
    })
    alpha3Code: string;

    @DatabaseProp({
        required: true,
        unique: true,
        trim: true,
        maxlength: 3,
        minlength: 1,
    })
    numericCode: string;

    @DatabaseProp({
        required: true,
        unique: true,
        trim: true,
        maxlength: 2,
        minlength: 2,
        uppercase: true,
    })
    fipsCode: string;

    @DatabaseProp({
        required: true,
        index: true,
        default: [],
        type: [{ type: String, index: true, unique: true, trim: true }],
        maxlength: 4,
    })
    phoneCode: string[];

    @DatabaseProp({
        required: true,
    })
    continent: string;

    @DatabaseProp({
        required: true,
    })
    timeZone: string;

    @DatabaseProp({
        required: true,
    })
    currency: string;
}

export const CountrySchema = DatabaseSchema(CountryEntity);
export type CountryDoc = IDatabaseDocument<CountryEntity>;
