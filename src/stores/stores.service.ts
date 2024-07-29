import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Store } from './entities/store.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { setSortCriteria } from 'src/utils/validation-utils';
import { StoresRepository } from './stores.repository';

@Injectable()
export class StoresService {
  constructor(
    private readonly storesRepository: StoresRepository,
    @InjectModel(Store.name) private readonly StoreModel: Model<Store>,
  ) {}

  // 전체 store 리스트 가져오기
  async getAllStores(
    uid: string,
    sortBy: string,
    userLatitude?: string,
    userLongitude?: string,
  ) {
    const sortCriteria = setSortCriteria(sortBy);
    const userLatitudeNumber = parseFloat(userLatitude);
    const userLongitudeNumber = parseFloat(userLongitude);

    const allStores = await this.storesRepository.getAllStores(
      uid,
      sortCriteria,
      userLatitudeNumber,
      userLongitudeNumber,
    );
    return allStores;
  }

  // 하나 store 가져오기
  async getStore(id: string) {
    const storeId = new ObjectId(id);
    const userId = new ObjectId('665f134a0dfff9c6393100d5');
    // storeLikes에서 storeId로 검색해서 좋아요 여부 확인
    const store = await this.StoreModel.aggregate([
      {
        $match: {
          _id: storeId,
        },
      },
      {
        $lookup: {
          from: 'storeLikes',
          localField: '_id',
          foreignField: 'storeId',
          as: 'result',
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          latitude: 1,
          longitude: 1,
          logo: 1,
          info: 1,
          description: 1,
          siteUrl: 1,
          sizes: 1,
          shapes: 1,
          popularity: 1,
          isFavorite: {
            $cond: {
              if: {
                $eq: ['$result.userId', userId],
              },
              then: true,
              else: false,
            },
          },
        },
      },
    ]);

    return store[0];
  }

  async getStoreCakes(id: string) {
    const storeId = new ObjectId(id);
    const cakes = await this.StoreModel.aggregate([
      {
        $match: {
          _id: storeId,
        },
      },
      {
        $lookup: {
          from: 'cakes',
          localField: '_id',
          foreignField: 'storeId',
          as: 'cakes',
        },
      },
      {
        $unwind: {
          path: '$cakes',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'cakeLikes',
          localField: 'cakes._id',
          foreignField: 'cakeId',
          as: 'result',
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: '$cakes._id',
          name: '$cakes.name',
          // photos: '$cakes.photos',
          photo: { $arrayElemAt: ['$cakes.photos', 0] },
          tags: '$cakes.tags',
          categories: '$cakes.categories',
          popularity: '$cakes.popularity',
          createdDate: '$cakes.createdDate',
          isFavorite: {
            $cond: {
              if: {
                $eq: [
                  '$result.userId',
                  new ObjectId('665f134a0dfff9c6393100d5'),
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
    ]);

    return cakes;
  }

  async getStorePopularCakes(id: string) {
    const storeId = new ObjectId(id);
    const cakes = await this.StoreModel.aggregate([
      {
        $match: {
          _id: storeId,
        },
      },
      {
        $lookup: {
          from: 'cakes',
          localField: '_id',
          foreignField: 'storeId',
          as: 'cakes',
        },
      },
      {
        $unwind: {
          path: '$cakes',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'cakeLikes',
          localField: 'cakes._id',
          foreignField: 'cakeId',
          as: 'result',
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: '$cakes._id',
          name: '$cakes.name',
          photos: '$cakes.photos',
          tags: '$cakes.tags',
          categories: '$cakes.categories',
          popularity: '$cakes.popularity',
          createdDate: '$cakes.createdDate',
          isFavorite: {
            $cond: {
              if: {
                $eq: [
                  '$result.userId',
                  new ObjectId('665f134a0dfff9c6393100d5'),
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
      // {
      //   $sort: {
      //     popularity: -1,
      //   },
      // },
      // {
      //   $limit: 10,
      // },
    ]);

    return cakes;
  }
}
