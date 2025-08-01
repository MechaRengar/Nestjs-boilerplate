import { LanguageCode } from '../../constants';
import { EnumField, StringField } from '../../decorators';

export class CreateTranslationDto {
  @EnumField(() => LanguageCode)
  language!: LanguageCode;

  @StringField()
  text!: string;
}
