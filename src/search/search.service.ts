import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SearchService {
  constructor(private readonly httpService: HttpService) {}
  async searchCakes(keyword: string, page: string) {
    const pageInt = parseInt(page, 10);
    const size = 10;
    const searchURL = process.env.SEARCH_URL;
    const url = `${searchURL}?keyword=${keyword}&page=${pageInt}&size=${size}`;

    const searchResponse = await lastValueFrom(this.httpService.get(url));
    const searchResponseData = searchResponse.data;
    return searchResponseData;
  }
}
