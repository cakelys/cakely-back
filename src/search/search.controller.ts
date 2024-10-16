import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller({ path: 'search', version: ['1', VERSION_NEUTRAL] })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(AuthGuard)
  @Get()
  searchCakes(
    @Query('keyword') keyword: string,
    @Query('page') page: string,
    @Req() request,
  ) {
    const uid = request.userId;
    return this.searchService.searchCakes(uid, keyword, page);
  }

  @Get('recommend-keyword')
  recommendSearchKeyword() {
    return this.searchService.recommendSearchKeyword();
  }
}
