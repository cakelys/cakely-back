import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

@Injectable()
export class StoresRepository {
  constructor(@InjectModel('Store') private readonly storeModel: Model<any>) {}

  async getAllStores(
    uid: string,
    sortCriteria: string,
    userLatitude: number,
    userLongitude: number,
    page: number,
  ): Promise<any[]> {
    const pageSize = 10; // 한 페이지에 표시할 항목 수
    const skip = (page - 1) * pageSize; // 페이지 번호에 따라 스킵할 항목 수 계산

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
      {
        $group: {
          _id: {
            storeId: '$_id',
            name: '$name',
            address: '$address',
            logo: '$logo',
            distance: '$distance',
            popularity: '$popularity',
            createdDate: '$createdDate',
          },
          isLiked: {
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
              id: '$cakes._id',
              photo: { $arrayElemAt: ['$cakes.photos', 0] },
              isLiked: {
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
          _id: 0,
          store: {
            id: '$_id.storeId',
            name: '$_id.name',
            address: '$_id.address',
            logo: '$_id.logo',
            distance: '$_id.distance',
            isLiked: '$isLiked',
            popularity: '$_id.popularity',
            createdDate: '$_id.createdDate',
          },
          popularCakes: 1,
        },
      },
      {
        $sort: {
          [`store.${sortCriteria}`]: sortCriteria === 'distance' ? 1 : -1,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ]);
  }

  async getStoreById(uid: string, storeId: string): Promise<any> {
    // storeLikes에서 storeId로 검색해서 좋아요 여부 확인
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
          as: 'result',
        },
      },
      {
        $addFields: {
          likesCount: {
            $size: '$result',
          },
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: true,
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
              $cond: {
                if: { $eq: ['$storeLikes.userId', uid] },
                then: true,
                else: false,
              },
            },
          },
          popularCakes: {
            $push: {
              id: '$cakes._id',
              photo: { $arrayElemAt: ['$cakes.photos', 0] },
              isLiked: {
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
          _id: 0,
          store: {
            id: '$_id.storeId',
            name: '$_id.name',
            address: '$_id.address',
            logo: '$_id.logo',
            isFavorite: {
              $cond: {
                if: {
                  $eq: ['$result.userId', new ObjectId(uid)],
                },
                then: true,
                else: false,
              },
            },
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
}
