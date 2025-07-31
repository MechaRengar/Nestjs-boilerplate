# Overview

The database architecture in ACK NestJS Boilerplate follows a clean repository pattern that provides a clear separation between business logic and data access layers. The architecture is built on MongoDB using Mongoose as the Object Data Modeling (ODM) library, offering a robust, type-safe approach to database operations.

This documentation explains the features and usage of:
- **Database Core**: Located at `src/common/database`

The database functionality is organized into several key components:

1. **Database Module** - Global module providing database services
2. **Repository Pattern** - Implementation for data access abstraction
3. **Entity Definitions** - MongoDB schema representations
4. **Repository Implementations** - Concrete data access implementations


# Table of Contents
- [Overview](#overview)
- [Table of Contents](#table-of-contents)
  - [Modules](#modules)
  - [Services](#services)
    - [DatabaseOptionService](#databaseoptionservice)
    - [DatabaseService](#databaseservice)
  - [Repository](#repository)
    - [Base Repository Classes](#base-repository-classes)
      - [Database UUID Repository Base](#database-uuid-repository-base)
      - [Database Object ID Repository Base](#database-object-id-repository-base)
      - [Soft Delete Implementation](#soft-delete-implementation)
    - [Entity Base Classes](#entity-base-classes)
      - [Database UUID Entity Base](#database-uuid-entity-base)
      - [Database Object ID Entity Base](#database-object-id-entity-base)
  - [Structure](#structure)
  - [Example](#example)
    - [Entity](#entity)
    - [Repository](#repository-1)
    - [Repository Module Example](#repository-module-example)
    - [Service](#service)

## Modules

The database architecture uses two primary modules:

1. **DatabaseOptionModule**: Provides the configuration for MongoDB connections.
2. **DatabaseModule**: Global module that provides database services throughout the application.

```typescript
@Module({
    providers: [DatabaseOptionService],
    exports: [DatabaseOptionService],
    imports: [],
    controllers: [],
})
export class DatabaseOptionModule {}

@Global()
@Module({})
export class DatabaseModule {
    static forRoot(): DynamicModule {
        return {
            module: DatabaseModule,
            providers: [DatabaseService],
            exports: [DatabaseService],
            imports: [],
            controllers: [],
        };
    }
}
```

## Services

### DatabaseOptionService

The `DatabaseOptionService` configures MongoDB connection parameters, handling environment variables and connection optimization:

```typescript
@Injectable()
export class DatabaseOptionService implements IDatabaseOptionService {
    constructor(private readonly configService: ConfigService) {}

    createOptions(): MongooseModuleOptions {
        const env = this.configService.get<string>('app.env');
        const name = this.configService.get<string>('app.name');

        const url = this.configService.get<string>('database.url');
        const debug = this.configService.get<boolean>('database.debug');

        let timeoutOptions = this.configService.get<Record<string, number>>(
            'database.timeoutOptions'
        );

        let poolOptions = this.configService.get<Record<string, number>>(
            'database.poolOptions'
        );

        if (env !== ENUM_APP_ENVIRONMENT.PRODUCTION) {
            mongoose.set('debug', debug);
        }

        if (env === ENUM_APP_ENVIRONMENT.MIGRATION) {
            timeoutOptions = {
                serverSelectionTimeoutMS: 60 * 1000, // 60 secs
                socketTimeoutMS: 300 * 1000, // 5 minutes
                heartbeatFrequencyMS: 10 * 1000, // 10 secs
            };

            poolOptions = {
                maxPoolSize: 20,
                minPoolSize: 5,
                maxIdleTimeMS: 120000, // Increased from 60000
                waitQueueTimeoutMS: 60000, // Increased from 30000
            };
        }

        const mongooseOptions: MongooseModuleOptions = {
            uri: url,
            autoCreate: env !== ENUM_APP_ENVIRONMENT.MIGRATION,
            autoIndex: env !== ENUM_APP_ENVIRONMENT.MIGRATION,
            appName: name,
            retryWrites: true,
            retryReads: true,
            ...timeoutOptions,
            ...poolOptions,
        };

        return mongooseOptions;
    }
}
```

### DatabaseService

The `DatabaseService` provides database functionality, including transaction management and query helpers:

```typescript
@Injectable()
export class DatabaseService implements IDatabaseService {
    constructor(
        @InjectDatabaseConnection()
        private readonly databaseConnection: Connection
    ) {}

    // Transaction support
    async createTransaction(): Promise<ClientSession> {
        const session: ClientSession = await this.databaseConnection.startSession();
        session.startTransaction();
        return session;
    }

    async commitTransaction(session: ClientSession): Promise<void> {
        await session.commitTransaction();
        await session.endSession();
    }

    async abortTransaction(session: ClientSession): Promise<void> {
        await session.abortTransaction();
        await session.endSession();
    }
    
    // ...
}
```

## Repository

The repository pattern implementation provides a consistent approach to database operations across all entities in the application.

### Base Repository Classes

The boilerplate provides two base repository implementations to support different MongoDB ID types:

#### Database UUID Repository Base

The `DatabaseUUIDRepositoryBase` class serves as the foundation for repositories that use UUID strings as primary keys. This is the recommended approach for most use cases as it provides readable IDs that can be generated on the client side and don't expose incremental information about record counts.

```typescript
export class DatabaseUUIDRepositoryBase<
    Entity extends DatabaseUUIDEntityBase,
    EntityDocument extends IDatabaseDocument<Entity>,
> {
    protected readonly _repository: Model<Entity>;
    readonly _join?: PopulateOptions | (string | PopulateOptions)[];

    constructor(
        repository: Model<Entity>,
        options?: PopulateOptions | (string | PopulateOptions)[]
    ) {
        this._repository = repository;
        this._join = options;
    }

    // Categories of operations provided:
    
    // 1. Query Methods - for searching and retrieving data
    async findAll<T = EntityDocument>(...): Promise<T[]> { /* ... */ }
    async findOne<T = EntityDocument>(...): Promise<T> { /* ... */ }
    async findOneById<T = EntityDocument>(...): Promise<T> { /* ... */ }
    async getTotal(...): Promise<number> { /* ... */ }
    async exists(...): Promise<boolean> { /* ... */ }

    // 2. Mutation Methods - for creating and modifying data
    async create<T extends Entity>(...): Promise<EntityDocument> { /* ... */ }
    async save(...): Promise<EntityDocument> { /* ... */ }
    async update(...): Promise<EntityDocument> { /* ... */ }
    async updateRaw(...): Promise<EntityDocument> { /* ... */ }
    async upsert(...): Promise<EntityDocument> { /* ... */ }
    async delete(...): Promise<EntityDocument> { /* ... */ }

    // 3. Soft Delete - supports data deletion without actually removing it
    async softDelete(...): Promise<EntityDocument> { /* ... */ }
    async restore(...): Promise<EntityDocument> { /* ... */ }

    // 4. Relation Methods - for accessing relationships between entities
    async join<T = any>(...): Promise<T> { /* ... */ }

    // 5. Bulk Operations - for mass operations
    async createMany<T extends Partial<Entity>>(...): Promise<InsertManyResult<Entity>> { /* ... */ }
    async updateMany<T = Entity>(...): Promise<UpdateResult<Entity>> { /* ... */ }
    async updateManyRaw(...): Promise<UpdateResult<Entity>> { /* ... */ }
    async deleteMany(...): Promise<DeleteResult> { /* ... */ }
    async softDeleteMany(...): Promise<UpdateResult<Entity>> { /* ... */ }
    async restoreMany(...): Promise<UpdateResult<Entity>> { /* ... */ }

    // 6. Aggregate Operations - for aggregation queries
    async aggregate<AggregatePipeline extends PipelineStage, AggregateResponse = any>(...): Promise<AggregateResponse[]> { /* ... */ }
    async findAllAggregate<AggregatePipeline extends PipelineStage, AggregateResponse = any>(...): Promise<AggregateResponse[]> { /* ... */ }
    async getTotalAggregate<AggregatePipeline extends PipelineStage>(...): Promise<number> { /* ... */ }

    // 7. Model Access - direct access to the Mongoose model
    async model(): Promise<Model<Entity>> { /* ... */ }
}
```

#### Database Object ID Repository Base

The `DatabaseObjectIdRepositoryBase` class serves a similar function but uses MongoDB's native ObjectId type as the primary key. This can be useful for specific use cases where native ObjectId performance benefits are needed.

The API surface is almost identical to the UUID version with the main difference being the handling of ID fields.

#### Soft Delete Implementation

The repository implements soft delete functionality where records are marked as deleted but not physically removed from the database. This provides data recoverability and historical preservation when needed.

When querying data:
- By default, soft-deleted records are filtered out (only returns records where `deleted: false`)
- When the `withDeleted` option is set to `true`, both deleted and non-deleted records are returned

Implementation example:

```typescript
async findAll<T = EntityDocument>(
    find?: RootFilterQuery<Entity>,
    options?: IDatabaseFindAllOptions
): Promise<T[]> {
    const repository = this._repository.find<T>({
        ...find,
        ...(!options?.withDeleted && {
            deleted: false,
        }),
    });
    
    // Additional query operations...
    
    return repository.exec();
}
```

This pattern is consistently applied across all query methods to ensure proper handling of soft-deleted records.

### Entity Base Classes

The boilerplate provides two entity base classes that correspond to the repository base classes.

#### Database UUID Entity Base

The `DatabaseUUIDEntityBase` class provides a foundation for entities using UUID strings as primary keys. It includes common fields like timestamps and soft delete flags.

```typescript
export class DatabaseUUIDEntityBase {
    // Primary key using UUID by default
    @DatabaseProp({
        type: String,
        required: true,
        default: uuidV4,
    })
    _id: string;

    // Other fields for auditing
}
```

#### Database Object ID Entity Base

The `DatabaseObjectIdEntityBase` class serves the same purpose but uses MongoDB's native ObjectId type as the primary key.

```typescript
export class DatabaseObjectIdEntityBase {
    @DatabaseProp({
        type: Types.ObjectId,
        required: true,
        default: () => new Types.ObjectId(),
    })
    _id: Types.ObjectId;

    // Similar fields to UUID version but with ObjectId references
    // ...
}
```

## Structure

Each module in the application follows a consistent repository structure:

```
/modules/{module-name}/
├── repository/
│   ├── entities/
│   │   └── {entity-name}.entity.ts    # Schema definition
│   ├── repositories/
│   │   └── {entity-name}.repository.ts # Repository implementation
│   └── {entity-name}.repository.module.ts # Repository module config
```

## Example

### Entity

Entity definitions include schema fields and validation through decorators. Each entity defines the data structure stored in MongoDB.

```typescript
@DatabaseEntity({ collection: UserTableName })
export class UserEntity extends DatabaseUUIDEntityBase {
    // Field definitions with decorators for index configuration and validation
    @DatabaseProp({
        required: true,
        unique: true,
        index: true,
        trim: true,
        type: String,
        maxlength: 100,
    })
    email: string;

    // Other fields with validation
    @DatabaseProp({
        required: true,
        index: true,
        trim: true,
        type: String,
    })
    firstName: string;

    // Add entity fields according to requirements
}

// Code to generate schema and define document type
export const UserSchema = DatabaseSchema(UserEntity);
export type UserDoc = IDatabaseDocument<UserEntity>;
```

### Repository

Each repository extends the appropriate base repository and can customize functionality as needed. The repository handles all data operations for a specific entity.

```typescript
@Injectable()
export class UserRepository extends DatabaseUUIDRepositoryBase<UserEntity, UserDoc> {
    constructor(
        @InjectDatabaseModel(UserEntity.name)
        private readonly userModel: Model<UserEntity>
    ) {
        // Call parent constructor with model and join (relation) definitions
        super(userModel, [
            // Example of join configuration: User with Role
            {
                path: 'role',
                localField: 'role',
                foreignField: '_id',
                model: RoleEntity.name,
                justOne: true,
            },
            // Other join definitions...
        ]);
    }

    // Add custom methods if needed
}
```

Repositories provide a clean abstraction over Mongoose and enable:
- Complete CRUD operations on entities
- Automatic relations/joins based on configuration
- Soft delete and restore
- Bulk operations for high performance


### Repository Module Example

Each repository has its own module to handle dependencies and exports. This module facilitates dependency injection and NestJS integration.

```typescript
@Module({
    providers: [UserRepository],
    exports: [UserRepository],
    controllers: [],
    imports: [
        // Register schema with Mongoose
        MongooseModule.forFeature(
            [
                {
                    name: UserEntity.name,
                    schema: UserSchema,
                },
            ],
            DATABASE_CONNECTION_NAME
        ),
    ],
})
export class UserRepositoryModule {}
```

### Service

Services use repositories for data access, implementing business logic on top of the repository layer. The service layer bridges controllers and the data access layer.

```typescript
@Injectable()
export class UserService implements IUserService {
    constructor(
        private readonly userRepository: UserRepository,
        // Other dependencies...
        private readonly helperDateService: HelperDateService,
        private readonly configService: ConfigService
    ) {}

    // Service method implementations
    async findAll<T>(find?: Record<string, any>, options?: IDatabaseFindAllOptions): Promise<T[]> {
        // Call repository with required parameters
        return this.userRepository.findAll<T>(find, {
            ...options,
            join: true, // Enable automatic relation joining
        });
    }
    
    // Method that includes soft-deleted records in results
    async findAllWithDeleted<T>(find?: Record<string, any>, options?: IDatabaseFindAllOptions): Promise<T[]> {
        return this.userRepository.findAll<T>(find, {
            ...options,
            join: true,
            withDeleted: true, // This will include soft-deleted records
        });
    }

    async create<Dto>(data: Dto, options?: IDatabaseCreateOptions): Promise<UserDoc> {
        // Transform DTO to entity before saving
        const create: UserEntity = new UserEntity();
        Object.assign(create, data);
        
        return this.userRepository.create<UserEntity>(create, options);
    }
    
    // Soft delete a record
    async softDelete(id: string, options?: IDatabaseSoftDeleteOptions): Promise<UserDoc> {
        const user = await this.userRepository.findOneById<UserDoc>(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        return this.userRepository.softDelete(user, options);
    }
    
    // Restore a soft-deleted record
    async restore(id: string, options?: IDatabaseSaveOptions): Promise<UserDoc> {
        // We need to include deleted records to find the one to restore
        const user = await this.userRepository.findOneById<UserDoc>(id, { withDeleted: true });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        return this.userRepository.restore(user, options);
    }

    // Other service methods...
}
```