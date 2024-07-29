import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StoresRepository {
  constructor(@InjectModel('Store') private readonly storeModel: Model<any>) {}

  async getAllStores(
    uid: string,
    sortCriteria: any,
    userLatitude: number,
    userLongitude: number,
  ): Promise<any[]> {
    return this.storeModel.aggregate([
      // 스토어의 좋아요 정보 가져오기
      {
        $lookup: {
          from: 'storeLikes',
          localField: '_id',
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
      // 거리 계산
      {
        $addFields: {
          distance: {
            $multiply: [
              6371, // 지구 반지름 (킬로미터 단위)
              {
                $sqrt: {
                  $add: [
                    {
                      $pow: [{ $subtract: ['$latitude', userLatitude] }, 2],
                    },
                    {
                      $pow: [{ $subtract: ['$longitude', userLongitude] }, 2],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      // 케이크 가져오기
      {
        $lookup: {
          from: 'cakes',
          localField: '_id',
          foreignField: 'storeId',
          as: 'cakes',
        },
      },
      // 케이크 데이터 그룹화
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
      // 케이크 데이터 그룹화
      {
        $group: {
          _id: {
            storeId: '$_id',
            name: '$name',
            address: '$address',
            logo: '$logo',
            distance: '$distance',
          },
          isFavorite: {
            $first: {
              $cond: {
                if: { $eq: ['$storeLikes.userId', uid] },
                then: true,
                else: false,
              },
            },
          },
          popularCakes: {
            $push: {
              _id: '$cakes._id',
              photo: { $arrayElemAt: ['$cakes.photos', 0] },
              isFavorite: {
                $cond: {
                  if: {
                    $in: [uid, '$cakeLikes.userId'],
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
                  sortBy: { popularity: -1 },
                },
              },
              10, // 최대 10개
            ],
          },
        },
      },
      {
        $project: {
          _id: '$_id.storeId',
          name: '$_id.name',
          address: '$_id.address',
          logo: '$_id.logo',
          distance: '$_id.distance',
          isFavorite: 1,
          popularCakes: 1,
        },
      },
      {
        $sort: {
          [sortCriteria]: sortCriteria === 'distance' ? 1 : -1,
        },
      },
    ]);
  }
}
