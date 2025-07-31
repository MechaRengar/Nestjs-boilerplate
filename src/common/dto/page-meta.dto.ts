import { NumberField } from '../../decorators';
import type { PageOptionsDto } from './page-options.dto';

interface IPageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}

export class PageMetaDto {
  @NumberField()
  readonly page: number;

  @NumberField()
  readonly limit: number;

  @NumberField()
  readonly count: number;

  @NumberField()
  readonly total_page: number;

  constructor({ pageOptionsDto, itemCount }: IPageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.limit = pageOptionsDto.limit || itemCount;
    this.count = itemCount;
    this.total_page = Math.ceil(this.count / (this.limit || this.count));
  }
}
