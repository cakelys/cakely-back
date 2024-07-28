import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class CakesRepository {
  constructor(@InjectModel('Cake') private readonly cakeModel: Model<any>) {}

  // 오늘의 케이크 데이터를 가져오는 함수
  async getTodayCakesData(uid: string): Promise<any[]> {
    return this.cakeModel.aggregate([
      {
        $lookup: {
          from: 'cakeLikes',
          localField: '_id',
          foreignField: 'cakeId',
          as: 'likes',
        },
      },
      {
        $unwind: {
          path: '$likes',
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
        $lookup: {
          from: 'storeLikes',
          localField: 'store._id',
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
          photo: { $arrayElemAt: ['$photos', 0] },
          isFavorite: {
            $cond: {
              if: {
                $eq: [
                  '$likes.userId',
                  new ObjectId('665f134a0dfff9c6393100d5'),
                ],
              },
              then: true,
              else: false,
            },
          },
          isFavoriteStore: {
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
          'store._id': 1,
          'store.name': 1,
          'store.logo': 1,
          'store.address': 1,
        },
      },
      {
        $sort: {
          createdDate: -1,
        },
      },
      {
        $limit: 5,
      },
    ]);
  }

  // 특정 케이크 데이터를 가져오는 함수
  async getCakeById(cakeId: string): Promise<any> {
    return this.cakeModel.findById(cakeId).exec();
  }

  // 새 케이크 데이터를 추가하는 함수
  async addCake(cakeData: any): Promise<any> {
    const newCake = new this.cakeModel(cakeData);
    return newCake.save();
  }

  // 케이크 데이터를 업데이트하는 함수
  async updateCake(cakeId: string, updateData: any): Promise<any> {
    return this.cakeModel
      .findByIdAndUpdate(cakeId, updateData, { new: true })
      .exec();
  }

  // 케이크 데이터를 삭제하는 함수
  async deleteCake(cakeId: string): Promise<any> {
    return this.cakeModel.findByIdAndDelete(cakeId).exec();
  }
}
