import { Injectable } from '@nestjs/common';
import { CreateCakeLikeDto } from './dto/create-cake-like.dto';
import { CreateStoreLikeDto } from './dto/create-store-like.dto';
import { ObjectId } from 'mongodb';
import { LikesRepository } from './likes.repository';
import { setSortCriteria } from 'src/utils/validation-utils';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class LikesService {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly s3Service: S3Service,
  ) {}

  async getNewCakesInLikedStores(uid: string) {
    const newCakesInLikedStores =
      await this.likesRepository.getNewCakesInLikedStores(uid);

    for (const newCakesInLikedStore of newCakesInLikedStores) {
      if (newCakesInLikedStore.cake.photo === null) {
        newCakesInLikedStores.splice(
          newCakesInLikedStores.indexOf(newCakesInLikedStore),
          1,
        );
      }
    }

    for (const newCakesInLikedStore of newCakesInLikedStores) {
      newCakesInLikedStore.store.logo =
        await this.s3Service.generagePresignedDownloadUrl(
          process.env.S3_RESIZED_BUCKET_NAME,
          newCakesInLikedStore.store.logo,
        );

      newCakesInLikedStore.cake.photo =
        await this.s3Service.generagePresignedDownloadUrl(
          process.env.S3_RESIZED_BUCKET_NAME,
          newCakesInLikedStore.cake.photo,
        );
    }

    return newCakesInLikedStores;
  }

  async getAllLikedCakes(
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

    const allLikedCakes = await this.likesRepository.getAllLikedCakes(
      uid,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
      pageInt,
    );

    for (const LikedCake of allLikedCakes) {
      if (LikedCake.photo === null) {
        allLikedCakes.splice(allLikedCakes.indexOf(LikedCake), 1);
      }
    }

    for (const LikedCake of allLikedCakes) {
      LikedCake.photo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        LikedCake.photo,
      );
    }

    return allLikedCakes;
  }

  async getAllStoreLikes(
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

    const allLikedStores = await this.likesRepository.getAllLikedStores(
      uid,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
      pageInt,
    );

    for (const LikedStore of allLikedStores) {
      LikedStore.logo = await this.s3Service.generagePresignedDownloadUrl(
        process.env.S3_RESIZED_BUCKET_NAME,
        LikedStore.logo,
      );
    }

    return allLikedStores;
  }

  async createCakeLike(uid: string, cakeId: string) {
    const createCakeLikeDto = new CreateCakeLikeDto(
      new ObjectId(uid),
      new ObjectId(cakeId),
    );
    const newLike = await this.likesRepository.createCakeLike(
      createCakeLikeDto,
    );
    return newLike;
  }

  async createStoreLike(uid: string, storeId: string) {
    const createStoreLikeDto = new CreateStoreLikeDto(
      new ObjectId(uid),
      new ObjectId(storeId),
    );
    const newLike = await this.likesRepository.createStoreLike(
      createStoreLikeDto,
    );
    return newLike;
  }

  async deleteCakeLike(uid: string, cakeId: string) {
    const deletedCakeLike = await this.likesRepository.deleteCakeLike(
      uid,
      cakeId,
    );
    return deletedCakeLike;
  }

  async deleteStoreLike(uid: string, storeId: string) {
    const deletedStoreLike = await this.likesRepository.deleteStoreLike(
      uid,
      storeId,
    );
    return deletedStoreLike;
  }
}
