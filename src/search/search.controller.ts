import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  searchCakes(@Query('keyword') keyword: string, @Query('page') page: string) {
    return this.searchService.searchCakes(keyword, page);
  }
}
