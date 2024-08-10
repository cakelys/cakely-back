import { Injectable } from '@nestjs/common';
import { CakesRepository } from './cakes.repository';
import { setSortCriteria } from 'src/utils/validation-utils';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class CakesService {
  constructor(
    private readonly cakesRepository: CakesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async getRecommendCakes(
    uid: string,
    sortBY: string,
    page: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    // 현재는 랜덤으로 케이크 10개 가져온다
    const sortCriteria = setSortCriteria(sortBY);
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);
    const pageInt = parseInt(page, 10);

    const recommendedCakes = await this.cakesRepository.getRecommendCakes(
      uid,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
      pageInt,
    );
    return recommendedCakes;
  }

  async getTodayCakes(uid: string) {
    // 최신 순으로 정렬해서 최근 5개 케이크와 해당 케이크 마켓의 정보를 가져온다.
    const todayCakes = await this.cakesRepository.getTodayCakesData(uid);

    return todayCakes;
  }

  async getCategoryCakes(
    uid: string,
    category: string,
    sortBy: string,
    page: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    const sortCriteria = setSortCriteria(sortBy);
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);
    const pageInt = parseInt(page, 10);

    const categoryCakes = await this.cakesRepository.getCakeByCategory(
      uid,
      category,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
      pageInt,
    );
    return categoryCakes;
  }

  async getCakeById(
    uid: string,
    cakeId: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);
    const cake = await this.cakesRepository.getCakeByIdData(
      uid,
      cakeId,
      userLatitudeNumber,
      userLongitudeNumber,
    );

    const key = 'app-data/store-notes.json';
    const storeNotesFileData = await this.s3Service.getFile(key);
    const storeNotesFileContent = storeNotesFileData.toString('utf-8');
    const storeNotesJsonData = JSON.parse(storeNotesFileContent);

    cake.cakeOverview.notes = storeNotesJsonData.notes;
    return cake;
  }

  async getCakesByIds(uid: string, cakeIds: string[]) {
    const cakes = await this.cakesRepository.getCakesByIdData(uid, cakeIds);
    return cakes;
  }

  async getCategories() {
    const key = 'app-data/category-list.json';
    const categoryListFileData = await this.s3Service.getFile(key);
    const categoryListFileContent = categoryListFileData.toString('utf-8');
    const categoryListJsonData = JSON.parse(categoryListFileContent);

    const categories = await this.cakesRepository.getCategories(
      categoryListJsonData,
    );
    return categories;
  }
}
