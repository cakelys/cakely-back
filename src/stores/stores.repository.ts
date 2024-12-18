import { PendingS3Deletion } from './../s3/entities/pendingS3Deletion.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import calculateDistance from 'src/utils/distance-query-utils';
import { Store } from './entities/store.entity';
import { Cake } from 'src/cakes/entities/cake.entity';
import { StoreLike } from 'src/likes/entities/storeLike.entity';
import { CakeLike } from 'src/likes/entities/cakeLike.entity';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';

@Injectable()
export class StoresRepository {
  constructor(
    @InjectModel('Store') private readonly storeModel: Model<Store>,
    @InjectModel('Cake') private readonly cakeModel: Model<Cake>,
    @InjectModel('StoreLike') private readonly storeLikeModel: Model<StoreLike>,
    @InjectModel('CakeLike') private readonly cakeLikeModel: Model<CakeLike>,
    @InjectModel('PendingS3Deletion')
    private readonly pendingS3DeletionModel: Model<PendingS3Deletion>,
  ) {}

  async getAllStores(
    uid: string,
    sortCriteria: string,
    userLatitude: number,
    userLongitude: number,
    page: number,
  ): Promise<any[]> {
    const pageSize = DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const stores = await this.storeModel.aggregate([
      {
        $lookup: {
          from: 'storeLikes',
          localField: '_id',
          foreignField: 'storeId',
          as: 'storeLikes',
        },
      },
      {
        $addFields: {
          isLiked: {
            $in: [
              new ObjectId(uid),
              {
                $map: { input: '$storeLikes', as: 'like', in: '$$like.userId' },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          distance: calculateDistance(
            userLatitude,
            userLongitude,
            '$latitude',
            '$longitude',
          ),
        },
      },
      {
        $project: {
          _id: 0,
          store: {
            id: '$_id',
            name: '$name',
            address: '$address',
            logo: '$logo',
            distance: '$distance',
            isLiked: '$isLiked',
            popularity: '$popularity',
            createdDate: '$createdDate',
          },
        },
      },
      {
        $sort: {
          [`store.${sortCriteria}`]: sortCriteria === 'distance' ? 1 : -1,
          'store.createdDate': -1,
        },
      },
      {
        $project: {
          'store.popularity': 0,
          'store.createdDate': 0,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ]);

    for (const storeInfo of stores) {
      const popularCakes = await this.cakeModel.aggregate([
        {
          $match: {
            storeId: storeInfo.store.id,
          },
        },
        {
          $lookup: {
            from: 'cakeLikes',
            localField: '_id',
            foreignField: 'cakeId',
            as: 'cakeLikes',
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            photo: { $arrayElemAt: ['$photos', 0] },
            isLiked: {
              $in: [new ObjectId(uid), '$cakeLikes.userId'],
            },
          },
        },
        {
          $sort: {
            popularity: -1,
            createdDate: -1,
          },
        },
        {
          $limit: 10,
        },
      ]);
      storeInfo.popularCakes = popularCakes;
    }

    return stores;
  }

  async getStoreById(uid: string, storeId: string): Promise<any> {
    const store = await this.storeModel.aggregate([
      {
        $match: {
          _id: new ObjectId(storeId),
        },
      },
      {
        $lookup: {
          from: 'storeLikes',
          localField: '_id',
          foreignField: 'storeId',
          as: 'storeLikes',
        },
      },
      {
        $addFields: {
          likesCount: {
            $size: '$storeLikes',
          },
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
          as: 'cakeLikes',
        },
      },
      {
        $group: {
          _id: {
            storeId: '$_id',
            name: '$name',
            address: '$address',
            logo: '$logo',
            likesCount: '$likesCount',
          },
          isLiked: {
            $first: {
              $in: [new ObjectId(uid), '$storeLikes.userId'],
            },
          },
          popularCakes: {
            $push: {
              id: '$cakes._id',
              photo: { $arrayElemAt: ['$cakes.photos', 0] },
              isLiked: {
                $cond: {
                  if: {
                    $in: [new ObjectId(uid), '$cakeLikes.userId'],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          popularCakes: {
            $slice: [
              {
                $sortArray: {
                  input: '$popularCakes',
                  sortBy: { popularity: -1, createdDate: -1 },
                },
              },
              10,
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          store: {
            id: '$_id.storeId',
            name: '$_id.name',
            address: '$_id.address',
            logo: '$_id.logo',
            isLiked: '$isLiked',
            likesCount: '$_id.likesCount',
          },
          popularCakes: 1,
        },
      },
    ]);

    if (store.length <= 0) {
      throw new NotFoundException('해당 스토어를 찾을 수 없습니다.');
    }
    return store[0];
  }

  async getStoreCakes(
    uid: string,
    storeId: string,
    page: number,
  ): Promise<any> {
    const pageSize = DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const storeCakes = await this.storeModel.aggregate([
      {
        $match: {
          _id: new ObjectId(storeId),
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
          _id: 0,
          id: '$cakes._id',
          photo: { $arrayElemAt: ['$cakes.photos', 0] },
          createdDate: '$cakes.createdDate',
          isLiked: {
            $cond: {
              if: {
                $eq: ['$result.userId', new ObjectId(uid)],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $sort: {
          createdDate: -1,
        },
      },
      {
        $project: {
          createdDate: 0,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ]);

    return storeCakes;
  }

  async getStoreCake(
    uid: string,
    storeId: string,
    cakeId: string,
    userLatitude: number,
    userLongitude: number,
  ): Promise<any> {
    const cake = await this.cakeModel.aggregate([
      {
        $match: {
          _id: new ObjectId(cakeId),
        },
      },
      {
        $lookup: {
          from: 'cakeLikes',
          localField: '_id',
          foreignField: 'cakeId',
          as: 'result',
        },
      },
      {
        $addFields: {
          likesCount: { $size: '$result' },
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'stores',
          localField: 'storeId',
          foreignField: '_id',
          as: 'store',
        },
      },
      {
        $unwind: {
          path: '$store',
        },
      },
      {
        $match: {
          'store._id': new ObjectId(storeId),
        },
      },
      {
        $lookup: {
          from: 'storeLikes',
          localField: 'store._id',
          foreignField: 'storeId',
          as: 'storeLikes',
        },
      },
      {
        $unwind: {
          path: '$storeLikes',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          distance: calculateDistance(
            userLatitude,
            userLongitude,
            '$store.latitude',
            '$store.longitude',
          ),
        },
      },
      {
        $project: {
          _id: 0,
          cake: {
            id: '$_id',
            photo: { $arrayElemAt: ['$photos', 0] },
            tags: '$tags',
            isLiked: {
              $cond: {
                if: {
                  $eq: ['$result.userId', new ObjectId(uid)],
                },
                then: true,
                else: false,
              },
            },
            likesCount: '$likesCount',
          },
          'store.isLiked': {
            $cond: {
              if: {
                $eq: ['$storeLikes.userId', new ObjectId(uid)],
              },
              then: true,
              else: false,
            },
          },
          'store.id': '$store._id',
          'store.name': 1,
          'store.logo': 1,
          'store.address': 1,
          'store.distance': '$distance',
          'store.siteUrl': { $arrayElemAt: ['$store.siteUrl', 0] },
          'store.instarId': 1,
        },
      },
    ]);

    if (cake.length <= 0) {
      throw new NotFoundException('해당 스토어의 케이크를 찾을 수 없습니다.');
    }

    const recommendedCakes = await this.cakeModel.aggregate([
      {
        $match: {
          storeId: new ObjectId(storeId),
        },
      },
      {
        $lookup: {
          from: 'cakeLikes',
          localField: '_id',
          foreignField: 'cakeId',
          as: 'cakeLikes',
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          photo: { $arrayElemAt: ['$photos', 0] },
          isLiked: {
            $in: [
              new ObjectId(uid),
              {
                $map: {
                  input: '$cakeLikes',
                  as: 'like',
                  in: '$$like.userId',
                },
              },
            ],
          },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
    ]);

    return { ...cake[0], recommendedCakes: recommendedCakes };
  }

  async getStoreDetails(
    uid: string,
    storeId: string,
    userLatitude: number,
    userLongitude: number,
  ): Promise<any> {
    const storeDetails = await this.storeModel.aggregate([
      {
        $match: {
          _id: new ObjectId(storeId),
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          address: '$address',
          latitude: '$latitude',
          longitude: '$longitude',
          info: '$info',
          distance: calculateDistance(
            userLatitude,
            userLongitude,
            '$latitude',
            '$longitude',
          ),
          sizes: '$sizes',
          shapes: '$shapes',
        },
      },
    ]);

    if (storeDetails.length <= 0) {
      throw new NotFoundException('해당 스토어의 정보를 찾을 수 없습니다.');
    }

    return storeDetails[0];
  }

  async getNearbyStores(
    uid: string,
    userLatitude: number,
    userLongitude: number,
  ) {
    const maxDistanceInKm = 5;

    const nearbyStores = await this.storeModel.aggregate([
      {
        $addFields: {
          distance: calculateDistance(
            userLatitude,
            userLongitude,
            '$latitude',
            '$longitude',
          ),
        },
      },
      {
        $lookup: {
          from: 'storeLikes',
          localField: '_id',
          foreignField: 'storeId',
          as: 'storeLikes',
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
        $addFields: {
          popularCakes: {
            $slice: [
              {
                $sortArray: {
                  input: '$cakes',
                  sortBy: { popularity: -1, createdDate: -1 },
                },
              },
              10,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'cakeLikes',
          let: { cakeIds: '$popularCakes._id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$cakeId', '$$cakeIds'] },
              },
            },
            {
              $project: {
                cakeId: 1,
                userId: 1,
              },
            },
          ],
          as: 'cakeLikes',
        },
      },
      {
        $match: {
          distance: { $lte: maxDistanceInKm },
        },
      },
      {
        $addFields: {
          popularCakes: {
            $map: {
              input: '$popularCakes',
              as: 'cake',
              in: {
                id: '$$cake._id',
                photo: { $arrayElemAt: ['$$cake.photos', 0] },
                isLiked: {
                  $in: [
                    { $toObjectId: uid },
                    {
                      $map: {
                        input: '$cakeLikes',
                        as: 'like',
                        in: {
                          $cond: [
                            { $eq: ['$$like.cakeId', '$$cake._id'] },
                            '$$like.userId',
                            null,
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          store: {
            id: '$_id',
            name: '$name',
            address: '$address',
            logo: '$logo',
            distance: '$distance',
            isLiked: { $in: [new ObjectId(uid), '$storeLikes.userId'] },
            latitude: '$latitude',
            longitude: '$longitude',
          },
          popularCakes: 1,
        },
      },
    ]);

    return nearbyStores;
  }

  async searchStores(keyword: string) {
    const stores = await this.storeModel.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { address: { $regex: keyword, $options: 'i' } },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          address: 1,
          logo: 1,
          isChecked: 1,
        },
      },
    ]);

    return stores;
  }

  async getRecommendCakes(
    uid: string,
    sortCriteria: string,
    userLatitude: number,
    userLongitude: number,
    page: number,
  ): Promise<any> {
    const pageSize = DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const recommendCakes = await this.storeModel.aggregate([
      {
        $sort: {
          popularity: -1,
        },
      },
      {
        $limit: 100,
      },
      {
        $lookup: {
          from: 'cakes',
          localField: '_id',
          foreignField: 'storeId',
          as: 'cake',
        },
      },
      {
        $addFields: {
          cake: { $arrayElemAt: ['$cake', 0] },
        },
      },
      {
        $lookup: {
          from: 'cakeLikes',
          localField: 'cake._id',
          foreignField: 'cakeId',
          as: 'cakeLikes',
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
      {
        $addFields: {
          distance: calculateDistance(
            userLatitude,
            userLongitude,
            '$latitude',
            '$longitude',
          ),
        },
      },
      {
        $sort: {
          [sortCriteria]: sortCriteria === 'distance' ? 1 : -1,
          createdDate: -1,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$cake._id',
          photo: { $arrayElemAt: ['$cake.photos', 0] },
          isLiked: {
            $in: [new ObjectId(uid), '$cakeLikes.userId'],
          },
        },
      },
    ]);

    return recommendCakes;
  }
}
