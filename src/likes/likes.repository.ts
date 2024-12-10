import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateCakeLikeDto } from './dto/create-cake-like.dto';
import { CreateStoreLikeDto } from './dto/create-store-like.dto';
import calculateDistance from 'src/utils/distance-query-utils';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel('StoreLike') private readonly storeLikeModel: Model<any>,
    @InjectModel('CakeLike') private readonly cakeLikeModel: Model<any>,
    @InjectModel('Cake') private readonly cakeModel: Model<any>,
    @InjectModel('Store') private readonly storeModel: Model<any>,
  ) {}

  async getNewCakesInLikedStores(uid: string) {
    const newCakesInLikedStores = await this.storeLikeModel.aggregate([
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
        $group: {
          _id: '$store._id',
          store: { $first: '$store' },
          cakes: { $push: '$cakes' },
        },
      },
      {
        $project: {
          _id: 0,
          'store.id': '$store._id',
          'store.name': '$store.name',
          'store.logo': '$store.logo',
          cakes: { $slice: ['$cakes', 3] },
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
      {
        $limit: 20,
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
    const pageSize =
      page !== undefined ? DEFAULT_PAGE_SIZE : Number.MAX_SAFE_INTEGER;
    const skip = page !== undefined ? (page - 1) * pageSize : 0;

    const allLikedStores = await this.storeLikeModel.aggregate([
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
          distance: calculateDistance(
            userLatitude,
            userLongitude,
            '$store.latitude',
            '$store.longitude',
          ),
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
          id: '$store._id',
          name: '$store.name',
          address: '$store.address',
          distance: '$distance',
          logo: '$store.logo',
        },
      },
      {
        $addFields: {
          isLiked: true,
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
    const pageSize =
      page !== undefined ? DEFAULT_PAGE_SIZE : Number.MAX_SAFE_INTEGER;
    const skip = page !== undefined ? (page - 1) * pageSize : 0;

    const allLikedCakes = await this.cakeLikeModel.aggregate([
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
          distance: calculateDistance(
            userLatitude,
            userLongitude,
            '$store.latitude',
            '$store.longitude',
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
        },
      },
      {
        $addFields: {
          isLiked: true,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ]);

    return allLikedCakes;
  }

  async createCakeLike(createCakeLikeDto: CreateCakeLikeDto) {
    const cake = await this.cakeModel.findById(createCakeLikeDto.cakeId);
    if (!cake) {
      throw new NotFoundException('Invalid cake id');
    }

    const isExist = await this.cakeLikeModel.findOne({
      userId: createCakeLikeDto.userId,
      cakeId: createCakeLikeDto.cakeId,
    });

    if (isExist) {
      throw new NotFoundException('Already liked');
    }

    const newLike = new this.cakeLikeModel(createCakeLikeDto);
    await newLike.save();

    await this.cakeModel.findByIdAndUpdate(cake._id, {
      $inc: { popularity: 10 },
    });

    return new CreateCakeLikeDto(newLike.userId, newLike.cakeId, newLike._id);
  }

  async createStoreLike(createStoreLikeDto: CreateStoreLikeDto) {
    const store = await this.storeModel.findById(createStoreLikeDto.storeId);
    if (!store) {
      throw new NotFoundException('Invalid store id');
    }

    const isExist = await this.storeLikeModel.findOne({
      userId: createStoreLikeDto.userId,
      storeId: createStoreLikeDto.storeId,
    });

    if (isExist) {
      throw new NotFoundException('Already liked');
    }

    const newLike = new this.storeLikeModel(createStoreLikeDto);
    await newLike.save();

    await this.storeModel.findByIdAndUpdate(store._id, {
      $inc: { popularity: 10 },
    });

    return new CreateStoreLikeDto(newLike.userId, newLike.storeId, newLike._id);
  }

  async deleteCakeLike(uid: string, cakeId: string) {
    const cake = await this.cakeModel.findById(cakeId);
    if (!cake) {
      throw new NotFoundException('Cake not found');
    }

    const deletedCakeLike = await this.cakeLikeModel.deleteOne({
      userId: new ObjectId(uid),
      cakeId: new ObjectId(cakeId),
    });

    if (deletedCakeLike.deletedCount === 0) {
      throw new NotFoundException('Like not found');
    }

    await this.cakeModel.findByIdAndUpdate(cake._id, {
      $inc: { popularity: -10 },
    });
  }

  async deleteStoreLike(uid: string, storeId: string) {
    const store = await this.storeModel.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const deletedStoreLike = await this.storeLikeModel.deleteOne({
      userId: new ObjectId(uid),
      storeId: new ObjectId(storeId),
    });

    if (deletedStoreLike.deletedCount === 0) {
      throw new NotFoundException('Like not found');
    }

    await this.storeModel.findByIdAndUpdate(store._id, {
      $inc: { popularity: -10 },
    });
  }
}
