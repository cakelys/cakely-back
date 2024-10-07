import { Injectable } from '@nestjs/common';
import { CakesRepository } from './cakes.repository';
import { setSortCriteria } from 'src/utils/validation-utils';
import { S3Service } from 'src/s3/s3.service';
import { CreateCakeDto } from './dto/create-cake.dto';

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

    for (const recommendedCake of recommendedCakes) {
      recommendedCake.photo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        recommendedCake.photo,
      );
    }
    return recommendedCakes;
  }

  async getTodayCakes(uid: string) {
    const todayCakes = await this.cakesRepository.getTodayCakesData(uid);

    for (const todayData of todayCakes) {
      todayData.store.logo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        todayData.store.logo,
      );
      todayData.cake.photo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        todayData.cake.photo,
      );
    }

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

    for (const categoryData of categoryCakes.categoryCakes) {
      categoryData.photo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        categoryData.photo,
      );
    }
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
    const cakeData = await this.cakesRepository.getCakeByIdData(
      uid,
      cakeId,
      userLatitudeNumber,
      userLongitudeNumber,
    );

    cakeData.store.logo = await this.s3Service.generagePresignedDownloadUrl(
      process.env.S3_RESIZED_BUCKET_NAME,
      cakeData.store.logo,
    );

    cakeData.cake.photo = await this.s3Service.generagePresignedDownloadUrl(
      process.env.S3_RESIZED_BUCKET_NAME,
      cakeData.cake.photo,
    );

    for (const recommendedCake of cakeData.recommendedCakes) {
      recommendedCake.photo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        recommendedCake.photo,
      );
    }

    const key = 'app-data/store-notes.json';
    const storeNotesFileData = await this.s3Service.getFile(key);
    const storeNotesFileContent = storeNotesFileData.toString('utf-8');
    const storeNotesJsonData = JSON.parse(storeNotesFileContent);

    cakeData.notes = storeNotesJsonData.notes;
    return cakeData;
  }

  async getCakesByIds(uid: string, cakeIds: string[]) {
    const cakes = await this.cakesRepository.getCakesByIdData(uid, cakeIds);

    for (const cake of cakes) {
      cake.photo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        cake.photo,
      );
    }
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

    for (const category of categories) {
      category.photo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        category.photo,
      );
    }
    return categories;
  }

  async createCake(createCakeDto: CreateCakeDto) {
    const storeInstarId = createCakeDto.photo.split('/')[0];
    const photos = [createCakeDto.photo];

    createCakeDto['photos'] = photos;
    createCakeDto['storeInstarId'] = storeInstarId;

    const newCake = await this.cakesRepository.createCake(createCakeDto);
    return newCake;
  }

  async getWorldCupCakes() {
    const worldCupCakes = await this.cakesRepository.getWorldCupCakesData();

    for (const worldCupCake of worldCupCakes) {
      worldCupCake.photo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        worldCupCake.photo,
      );
    }
    return worldCupCakes;
  }

  async getWorldCupWinner(uid: string, cakeId: string) {
    const worldCupWinner = await this.cakesRepository.getWorldCupWinnerData(
      uid,
      cakeId,
    );

    worldCupWinner.cake.photo =
      await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        worldCupWinner.cake.photo,
      );

    worldCupWinner.store.logo =
      await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        worldCupWinner.store.logo,
      );
    return worldCupWinner;
  }
}
