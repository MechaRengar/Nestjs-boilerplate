import { Inject, Injectable, mixin, Type } from '@nestjs/common';
import { PipeTransform, Scope } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';
import { DatabaseService } from '@common/database/services/database.service';
import { HelperArrayService } from '@common/helper/services/helper.array.service';
import { IPaginationFilterOptions } from '@common/pagination/interfaces/pagination.interface';
import { IRequestApp } from '@common/request/interfaces/request.interface';

export function PaginationFilterInEnumPipe<T>(
    field: string,
    defaultValue: T,
    defaultEnum: Record<string, any>,
    options?: IPaginationFilterOptions
): Type<PipeTransform> {
    @Injectable({ scope: Scope.REQUEST })
    class MixinPaginationFilterInEnumPipe implements PipeTransform {
        constructor(
            @Inject(REQUEST) protected readonly request: IRequestApp,
            private readonly databaseService: DatabaseService,
            private readonly helperArrayService: HelperArrayService
        ) {}

        async transform(value: string): Promise<any> {
            if (options?.raw) {
                this.addToRequestInstance(value);
                return {
                    [field]: value,
                };
            }

            const finalValue: T[] = value
                ? this.helperArrayService.getIntersection<T>(
                      value.split(',') as T[],
                      Object.values(defaultEnum) as T[]
                  )
                : (defaultValue as T[]);

            return this.databaseService.filterIn<T>(field, finalValue);
        }

        addToRequestInstance(value: any): void {
            this.request.__pagination = {
                ...this.request.__pagination,
                filters: this.request.__pagination?.filters
                    ? {
                          ...this.request.__pagination?.filters,
                          [field]: value,
                      }
                    : { [field]: value },
            };
        }
    }

    return mixin(MixinPaginationFilterInEnumPipe);
}
