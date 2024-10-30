import { Injectable } from '@nestjs/common';
import { setSortCriteria } from 'src/utils/validation-utils';
import { StoresRepository } from './stores.repository';
import { S3Service } from 'src/s3/s3.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    private readonly storesRepository: StoresRepository,
    private readonly s3Service: S3Service,
  ) {}

  async getAllStores(
    uid: string,
    sortBy: string,
    page: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    const sortCriteria = setSortCriteria(sortBy);
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);
    const pageInt = parseInt(page, 10);

    const allStores = await this.storesRepository.getAllStores(
      uid,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
      pageInt,
    );

    for (const storeData of allStores) {
      storeData.store.logo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        storeData.store.logo,
      );

      storeData.popularCakes = await Promise.all(
        storeData.popularCakes.map(async (popularCake) => {
          popularCake.photo = await this.s3Service.generagePresignedDownloadUrl(
            process.env.S3_RESIZED_BUCKET_NAME,
            popularCake.photo,
          );
          return popularCake;
        }),
      );
    }

    return allStores;
  }

  async getStoreById(uid: string, storeId: string) {
    const storeData = await this.storesRepository.getStoreById(uid, storeId);

    storeData.store.logo = await this.s3Service.generagePresignedDownloadUrl(
      process.env.S3_RESIZED_BUCKET_NAME,
      storeData.store.logo,
    );

    const isEmptyPopuplarCakes = storeData.popularCakes[0].photo === null;

    if (isEmptyPopuplarCakes) {
      storeData.popularCakes = [];
      storeData.store.backgroundImage =
        await this.s3Service.generagePresignedDownloadUrl(
          process.env.S3_BUCKET_NAME,
          'app-data/default-store-background.png',
        );
    } else {
      storeData.popularCakes = await Promise.all(
        storeData.popularCakes.map(async (popularCake) => {
          popularCake.photo = await this.s3Service.generagePresignedDownloadUrl(
            process.env.S3_RESIZED_BUCKET_NAME,
            popularCake.photo,
          );
          return popularCake;
        }),
      );
      const randomIndex = Math.floor(
        Math.random() * storeData.popularCakes.length,
      );
      storeData.store.backgroundImage =
        storeData.popularCakes[randomIndex].photo;
    }

    return storeData;
  }

  async getStoreCakes(uid: string, storeId: string, page: string) {
    const pageInt = parseInt(page, 10);
    const storeCakes = await this.storesRepository.getStoreCakes(
      uid,
      storeId,
      pageInt,
    );

    for (const storeCake of storeCakes) {
      if (storeCake.photo == null) {
        storeCakes.splice(storeCakes.indexOf(storeCake), 1);
      } else {
        storeCake.photo = await this.s3Service.generagePresignedDownloadUrl(
          process.env.S3_RESIZED_BUCKET_NAME,
          storeCake.photo,
        );
      }
    }
    return storeCakes;
  }

  async getStoreAllCakes(storeId: string) {
    return this.storesRepository.getStoreAllCakes(storeId);
  }

  async getStoreCake(
    uid: string,
    storeId: string,
    cakeId: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    const instargramUrl = 'https://www.instagram.com/';
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);
    const storeCake = await this.storesRepository.getStoreCake(
      uid,
      storeId,
      cakeId,
      userLatitudeNumber,
      userLongitudeNumber,
    );

    storeCake.store.siteUrl =
      storeCake.store.siteUrl === undefined
        ? instargramUrl + storeCake.store.instarId
        : storeCake.store.siteUrl;

    delete storeCake.store.instarId;

    storeCake.store.logo = await this.s3Service.generagePresignedDownloadUrl(
      process.env.S3_RESIZED_BUCKET_NAME,
      storeCake.store.logo,
    );
    storeCake.cake.photo = await this.s3Service.generagePresignedDownloadUrl(
      process.env.S3_RESIZED_BUCKET_NAME,
      storeCake.cake.photo,
    );
    storeCake.recommendedCakes = await Promise.all(
      storeCake.recommendedCakes.map(async (recommendedCake) => {
        recommendedCake.photo =
          await this.s3Service.generagePresignedDownloadUrl(
            process.env.S3_RESIZED_BUCKET_NAME,
            recommendedCake.photo,
          );
        return recommendedCake;
      }),
    );

    const key = 'app-data/store-notes.json';
    const storeNotesFileData = await this.s3Service.getFile(key);
    const storeNotesFileContent = storeNotesFileData.toString('utf-8');
    const storeNotesJsonData = JSON.parse(storeNotesFileContent);

    storeCake.notes = storeNotesJsonData.notes;
    return storeCake;
  }

  async getStoreDetails(
    uid: string,
    storeId: string,
    latitude?: string,
    longitude?: string,
  ) {
    const userLatitude = parseFloat(latitude);
    const userLongitude = parseFloat(longitude);

    const storeDetails = await this.storesRepository.getStoreDetails(
      uid,
      storeId,
      userLatitude,
      userLongitude,
    );
    return storeDetails;
  }

  async getNearbyStores(uid: string, latitude: string, longitude: string) {
    const userLatitude = parseFloat(latitude);
    const userLongitude = parseFloat(longitude);

    const nearbyStores = await this.storesRepository.getNearbyStores(
      uid,
      userLatitude,
      userLongitude,
    );

    for (const nearbyStore of nearbyStores) {
      nearbyStore.store.logo =
        await this.s3Service.generagePresignedDownloadUrl(
          process.env.S3_RESIZED_BUCKET_NAME,
          nearbyStore.store.logo,
        );

      nearbyStore.popularCakes = await Promise.all(
        nearbyStore.popularCakes.map(async (popularCake) => {
          popularCake.photo = await this.s3Service.generagePresignedDownloadUrl(
            process.env.S3_RESIZED_BUCKET_NAME,
            popularCake.photo,
          );
          return popularCake;
        }),
      );
    }
    return nearbyStores;
  }

  async createStore(createStoreDto: CreateStoreDto) {
    createStoreDto['logo'] = `${createStoreDto.instarId}/logo.png`;
    return this.storesRepository.createStore(createStoreDto);
  }

  async searchStores(keyword: string) {
    return this.storesRepository.searchStores(keyword);
  }

  async getOldestStores() {
    return this.storesRepository.getOldestStores();
  }

  async deleteStores(storeIds: string[]) {
    return this.storesRepository.deleteStores(storeIds);
  }
}
