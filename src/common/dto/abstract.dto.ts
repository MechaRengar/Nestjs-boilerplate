import { DYNAMIC_TRANSLATION_DECORATOR_KEY, IDField } from '../../decorators';
import { ContextProvider } from '../../providers';
import type { AbstractEntity } from '../abstract.entity';
import { LanguageCode } from '../../constants';
import * as process from 'process';

export class AbstractDto {
  @IDField()
  id!: number;

  translations?: AbstractTranslationDto[];

  constructor(entity: AbstractEntity, options?: { excludeFields?: boolean }) {
    if (!options?.excludeFields) {
      this.id = entity.id;
    }
  }

  loadTranslation(entity: AbstractEntity){
    // const languageCode = ContextProvider.getLanguage();
    const defaultLanguageCode = process.env.FALLBACK_LANGUAGE as LanguageCode || LanguageCode.en;
    const languageCode = ContextProvider.getLanguage();

    if (defaultLanguageCode && entity.translations && entity.translations.length > 0) {
      let translationEntity = entity.translations.find(
        (titleTranslation) => {
          return titleTranslation.language === defaultLanguageCode
        },
      )!;

      if (!translationEntity){
        translationEntity = entity.translations[0] || translationEntity;
      }

      if (languageCode && languageCode !== defaultLanguageCode){
        translationEntity = entity.translations.find(
          (titleTranslation) => titleTranslation.language === languageCode,
        ) || translationEntity;
      }

      const fields: Record<string, string> = {};

      if (translationEntity){
        for (const key of Object.keys(translationEntity)) {
          const metadata = Reflect.getMetadata(
            DYNAMIC_TRANSLATION_DECORATOR_KEY,
            this,
            key,
          );

          if (metadata) {
            fields[key] = (translationEntity as never)[key];
          }
        }
        Object.assign(this, fields);
      }
    } else {
      this.translations = entity.translations?.toDtos();
    }
  }
}

export class AbstractTranslationDto extends AbstractDto {
  constructor(entity: AbstractEntity) {
    super(entity, { excludeFields: true });
  }
}
