import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly s3Service: S3Service,
  ) {}
  async searchCakes(keyword: string, page: string) {
    const pageInt = parseInt(page, 10);
    const size = 10;
    const searchURL = process.env.SEARCH_URL;
    const url = `${searchURL}?keyword=${keyword}&page=${pageInt}&size=${size}`;

    const searchResponse = await lastValueFrom(this.httpService.get(url));
    const searchResponseData = searchResponse.data;

    for (const cake of searchResponseData.result) {
      cake.photo = await this.s3Service.generagePresignedDownloadUrl(
        cake.photo,
      );
    }

    return searchResponseData;
  }
}
