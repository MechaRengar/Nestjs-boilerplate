import { Column, PrimaryGeneratedColumn } from 'typeorm';

import { LanguageCode } from '../constants';
import type { Constructor } from '../types';
import type { AbstractDto, AbstractTranslationDto } from './dto/abstract.dto';

/**
 * Abstract Entity
 * @author Narek Hakobyan <narek.hakobyan.07@gmail.com>
 *
 * @description This class is an abstract class for all entities.
 * It's experimental and recommended using it only in microservice architecture,
 * otherwise just delete and use your own entity.
 */
export abstract class AbstractEntity<
    DTO extends AbstractDto = AbstractDto,
    O = never,
> {
    @PrimaryGeneratedColumn()
    id!: number;

    translations?: AbstractTranslationEntity[];

    dtoClass?: Constructor<DTO, [AbstractEntity, O?]>;

    toDto(options?: O): DTO {
        const dtoClass = Object.getPrototypeOf(this).dtoClass;
        if (!dtoClass) {
            throw new Error(
                `You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`
            );
        }

        return new dtoClass(this, options);
    }
}

export class AbstractTranslationEntity<
    DTO extends AbstractTranslationDto = AbstractTranslationDto,
    O = never,
> extends AbstractEntity<DTO, O> {
    @Column({ type: 'enum', enum: LanguageCode, default: 'en' })
    language!: LanguageCode;
}
