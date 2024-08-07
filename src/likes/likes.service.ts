import { Injectable } from '@nestjs/common';
import { CreateCakeLikeDto } from './dto/create-cake-like.dto';
import { CreateStoreLikeDto } from './dto/create-store-like.dto';
import { Model } from 'mongoose';
import { StoreLike } from './entities/storeLike.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CakeLike } from './entities/cakeLike.entity';
import { ObjectId } from 'mongodb';
import { LikesRepository } from './likes.repository';
import { setSortCriteria } from 'src/utils/validation-utils';

@Injectable()
export class LikesService {
  constructor(
    private readonly likesRepository: LikesRepository,
    @InjectModel(StoreLike.name)
    private readonly StoreLikeModel: Model<StoreLike>,
    @InjectModel(CakeLike.name) private readonly CakeLikeModel: Model<CakeLike>,
  ) {}

  // 찜한 가게의 새로 나온 케이크 리스트 가져오기
  async getNewCakesInLikedStores(uid: string) {
    const newCakesInLikedStores =
      await this.likesRepository.getNewCakesInLikedStores(uid);
    return newCakesInLikedStores;
  }

  // 전체 찜 케이크 리스트 가져오기
  async getAllCakeLikes() {
    const userId = new ObjectId('665f134a0dfff9c6393100d5');
    const allCakeLikes = await this.CakeLikeModel.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $lookup: {
          from: 'cakes',
          localField: 'cakeId',
          foreignField: '_id',
          as: 'cake',
        },
      },
      {
        $unwind: {
          path: '$cake',
          // preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: '$cake._id',
          // photos: '$cake.photos',
          photo: { $arrayElemAt: ['$cake.photos', 0] },
          tags: '$cake.tags',
          categories: '$cake.categories',
          popularity: '$cake.popularity',
          createdDate: '$cake.createdDate',
        },
      },
      {
        $addFields: {
          isFavorite: true,
        },
      },
    ]);

    return allCakeLikes;
  }

  // 전체 찜 가게 리스트 가져오기
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

    return allLikedStores;
  }

  // 찜 케이크 추가 -> 테스트 x
  async createCakeLike(createCakeLikeDto: CreateCakeLikeDto) {
    const userId = new ObjectId('665f134a0dfff9c6393100d5');
    createCakeLikeDto.userId = userId;
    const newLike = new this.CakeLikeModel(createCakeLikeDto);
    return newLike.save();
  }

  // 찜 가게 추가 -> 테스트 x
  async createStoreLike(createStoreLikeDto: CreateStoreLikeDto) {
    const userId = new ObjectId('665f134a0dfff9c6393100d5');
    createStoreLikeDto.userId = userId;
    const newLike = new this.StoreLikeModel(createStoreLikeDto);
    return newLike.save();
  }

  // 찜 케이크 삭제 -> not tested
  async deleteCakeLike(id: string): Promise<any> {
    const userId = new ObjectId('665f134a0dfff9c6393100d5');
    const deletedLike = await this.CakeLikeModel.deleteOne({
      userId: userId,
      cakeId: id,
    });

    return deletedLike;
  }

  // 찜 가게 삭제 -> not tested
  async deleteStoreLike(id: string): Promise<any> {
    const userId = new ObjectId('665f134a0dfff9c6393100d5');
    return this.StoreLikeModel.deleteOne({
      userId: userId,
      storeId: id,
    });
  }
}
