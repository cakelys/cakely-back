import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { S3Service } from 'src/s3/s3.service';
import { SearchLog } from './entities/searchLog.entity';
import { ObjectId } from 'mongodb';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';

@Injectable()
export class SearchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly s3Service: S3Service,
    @InjectModel('SearchLog') private searchLogModel: Model<SearchLog>,
  ) {}

  async searchCakes(uid: string, keyword: string, page: string) {
    const pageInt = parseInt(page, 10);
    const size = DEFAULT_PAGE_SIZE;

    if (pageInt === 1) {
      await this.createSearchLog(keyword, uid);
    }

    const searchURL = process.env.SEARCH_URL;
    const url = `${searchURL}?keyword=${keyword}&page=${pageInt}&size=${size}&uid=${uid}`;

    try {
      const searchResponse = await lastValueFrom(this.httpService.get(url));
      const searchResponseData = searchResponse.data;

      for (const cake of searchResponseData.result) {
        cake.photo = await this.s3Service.generagePresignedDownloadUrl(
          process.env.S3_RESIZED_BUCKET_NAME,
          cake.photo,
        );
      }

      return searchResponseData;
    } catch (error) {
      return { result: [], total: 0 };
    }
  }

  async createSearchLog(keyword: string, userId: string) {
    const searchLog = new this.searchLogModel({
      keyword,
      userId: new ObjectId(userId),
    });
    await searchLog.save();
  }

  async recommendSearchKeyword() {
    const key = 'app-data/recommend-keyword.json';
    const recommendKeywords = await this.s3Service.getFile(key);
    const recommendKeywordsContent = recommendKeywords.toString('utf-8');
    const recommendKeywordsJson = JSON.parse(recommendKeywordsContent);

    return recommendKeywordsJson;
  }
}
