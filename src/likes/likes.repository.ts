import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateCakeLikeDto } from './dto/create-cake-like.dto';
import { CreateStoreLikeDto } from './dto/create-store-like.dto';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel('StoreLike') private readonly StoreLikeModel: Model<any>,
    @InjectModel('CakeLike') private readonly CakeLikeModel: Model<any>,
    @InjectModel('Cake') private readonly CakeModel: Model<any>,
    @InjectModel('Store') private readonly StoreModel: Model<any>,
  ) {}

  async getNewCakesInLikedStores(uid: string) {
    const newCakesInLikedStores = await this.StoreLikeModel.aggregate([
      {
        $match: {
          userId: new ObjectId(uid),
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
          preserveNullAndEmptyArrays: true,
        },
      },
      // 케이크 가게 1개 랜덤 선택
      {
        $sample: { size: 1 },
      },
      {
        $lookup: {
          from: 'cakes',
          localField: 'store._id',
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
        $sort: { 'cakes.createdDate': -1 },
      },
      {
        $limit: 6,
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
        $project: {
          _id: 0,
          'store.id': '$store._id',
          'store.name': '$store.name',
          'store.logo': '$store.logo',
          cake: {
            id: '$cakes._id',
            photo: { $arrayElemAt: ['$cakes.photos', 0] },
            isLiked: {
              $cond: {
                if: { $arrayElemAt: ['$cakeLikes', 0] },
                then: true,
                else: false,
              },
            },
          },
        },
      },
    ]);
    return newCakesInLikedStores;
  }

  async getAllLikedStores(
    uid: string,
    sortCriteria: string,
    userLatitude: number,
    userLongitude: number,
    page: number,
  ): Promise<any> {
    const pageSize = 10; // 한 페이지에 표시할 항목 수
    const skip = (page - 1) * pageSize; // 페이지 번호에 따라 스킵할 항목 수 계산

    const allLikedStores = await this.StoreLikeModel.aggregate([
      {
        $match: {
          userId: new ObjectId(uid),
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
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          distance: {
            $multiply: [
              6371, // 지구의 반지름
              {
                $sqrt: {
                  $add: [
                    {
                      $pow: [
                        {
                          $subtract: ['$store.latitude', userLatitude],
                        },
                        2,
                      ],
                    },
                    {
                      $pow: [
                        {
                          $subtract: ['$store.longitude', userLongitude],
                        },
                        2,
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          sortField: {
            $switch: {
              branches: [
                {
                  case: { $eq: [sortCriteria, 'createdDate'] },
                  then: '$createdDate',
                },
                {
                  case: { $eq: [sortCriteria, 'popularity'] },
                  then: '$store.popularity',
                },
                {
                  case: { $eq: [sortCriteria, 'distance'] },
                  then: '$distance',
                },
              ],
              default: '$store.popularity',
            },
          },
        },
      },
      {
        $sort: {
          sortField: sortCriteria === 'distance' ? 1 : -1,
        },
      },
      {
        $project: {
          _id: 0,
          store: {
            id: '$store._id',
            name: '$store.name',
            address: '$store.address',
            distance: '$distance',
            logo: '$store.logo',
          },
        },
      },
      {
        $addFields: {
          'store.isLiked': true,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ]);

    return allLikedStores;
  }

  async getAllLikedCakes(
    uid: string,
    sortCriteria: string,
    userLatitude: number,
    userLongitude: number,
    page: number,
  ): Promise<any> {
    const pageSize = 10; // 한 페이지에 표시할 항목 수
    const skip = (page - 1) * pageSize; // 페이지 번호에 따라 스킵할 항목 수 계산

    const allLikedCakes = await this.CakeLikeModel.aggregate([
      {
        $match: {
          userId: new ObjectId(uid),
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
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'stores',
          localField: 'cake.storeId',
          foreignField: '_id',
          as: 'store',
        },
      },
      {
        $unwind: {
          path: '$store',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          distance: {
            $multiply: [
              6371, // 지구의 반지름
              {
                $sqrt: {
                  $add: [
                    {
                      $pow: [
                        {
                          $subtract: ['$store.latitude', userLatitude],
                        },
                        2,
                      ],
                    },
                    {
                      $pow: [
                        {
                          $subtract: ['$store.longitude', userLongitude],
                        },
                        2,
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          sortField: {
            $switch: {
              branches: [
                {
                  case: { $eq: [sortCriteria, 'createdDate'] },
                  then: '$createdDate',
                },
                {
                  case: { $eq: [sortCriteria, 'popularity'] },
                  then: '$cake.popularity',
                },
                {
                  case: { $eq: [sortCriteria, 'distance'] },
                  then: '$distance',
                },
              ],
              default: '$cake.popularity',
            },
          },
        },
      },
      {
        $sort: {
          sortField: sortCriteria === 'distance' ? 1 : -1,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$cake._id',
          photo: { $arrayElemAt: ['$cake.photos', 0] },
        },
      },
      {
        $addFields: {
          isFavorite: true,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ]);

    return allLikedCakes;
  }

  async createCakeLike(createCakeLikeDto: CreateCakeLikeDto) {
    // 존재하는 케이크인지 체크
    const cake = await this.CakeModel.findById(createCakeLikeDto.cakeId);
    if (!cake) {
      throw new NotFoundException('Invalid cake id');
    }

    // like 중복 체크
    const isExist = await this.CakeLikeModel.findOne({
      userId: createCakeLikeDto.userId,
      cakeId: createCakeLikeDto.cakeId,
    });

    if (isExist) {
      throw new NotFoundException('Already liked');
    }

    const newLike = new this.CakeLikeModel(createCakeLikeDto);
    await newLike.save();

    return new CreateCakeLikeDto(newLike.userId, newLike.cakeId, newLike._id);
  }

  async createStoreLike(createStoreLikeDto: CreateStoreLikeDto) {
    // 존재하는 store인지 체크
    const store = await this.StoreModel.findById(createStoreLikeDto.storeId);
    if (!store) {
      throw new NotFoundException('Invalid store id');
    }

    // like 중복 체크
    const isExist = await this.StoreLikeModel.findOne({
      userId: createStoreLikeDto.userId,
      storeId: createStoreLikeDto.storeId,
    });

    if (isExist) {
      throw new NotFoundException('Already liked');
    }

    const newLike = new this.StoreLikeModel(createStoreLikeDto);
    await newLike.save();

    return new CreateStoreLikeDto(newLike.userId, newLike.storeId, newLike._id);
  }

  async deleteCakeLike(uid: string, cakeId: string) {
    // 케이크 존재 확인
    const cake = await this.CakeModel.findById(cakeId);
    if (!cake) {
      throw new NotFoundException('Cake not found');
    }

    const deletedCakeLike = await this.CakeLikeModel.deleteOne({
      userId: new ObjectId(uid),
      cakeId: new ObjectId(cakeId),
    });

    if (deletedCakeLike.deletedCount === 0) {
      throw new NotFoundException('Like not found');
    }
  }

  async deleteStoreLike(uid: string, storeId: string) {
    // store 존재 확인
    const store = await this.StoreModel.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const deletedStoreLike = await this.StoreLikeModel.deleteOne({
      userId: new ObjectId(uid),
      storeId: new ObjectId(storeId),
    });

    if (deletedStoreLike.deletedCount === 0) {
      throw new NotFoundException('Like not found');
    }
  }
}
