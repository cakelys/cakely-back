import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  searchCakes(@Query('keyword') keyword: string, @Query('page') page: string) {
    const uid = '665f134a0dfff9c6393100d5';
    return this.searchService.searchCakes(uid, keyword, page);
  }

  @Get('recommend-keyword')
  recommendSearchKeyword() {
    return this.searchService.recommendSearchKeyword();
  }
}
