import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException, GoneException } from '@nestjs/common';
import { FirebaseService } from 'src/auth/firebase.service';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUsersRepository = () => ({
  getUserInfo: jest.fn(),
  logIn: jest.fn(),
  signIn: jest.fn(),
  updateUserInfo: jest.fn(),
  getUserLocation: jest.fn(),
});

const mockFirebaseService = () => ({
  getUserInfoByAccessToken: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useFactory: mockUsersRepository },
        { provide: FirebaseService, useFactory: mockFirebaseService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  describe('getUserInfo', () => {
    it('유저가 존재하면 유저 정보를 반환한다', async () => {
      const mockUser = { nickname: 'John' };
      repository.getUserInfo.mockResolvedValue(mockUser);
      await expect(service.getUserInfo('valid_uid')).resolves.toEqual(mockUser);
    });

    it('유저가 존재하지 않으면 NotFoundException을 던진다', async () => {
      repository.getUserInfo.mockRejectedValue(new NotFoundException());
      await expect(service.getUserInfo('invalid_uid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('logIn', () => {
    it('유저가 존재하지 않으면 NotFoundException을 던진다', async () => {
      repository.logIn.mockRejectedValue(new NotFoundException());
      await expect(service.logIn('invalid_uid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('유저가 탈퇴한 상태이면 GoneException을 던진다', async () => {
      repository.logIn.mockRejectedValue(new GoneException());
      await expect(service.logIn('withdrawn_uid')).rejects.toThrow(
        GoneException,
      );
    });
  });

  describe('updateUserInfo', () => {
    it('repository의 updateUserInfo를 올바른 인자로 호출한다', async () => {
      const dto = new UpdateUserDto({
        latitude: 37.5,
        longitude: 127.0,
      });
      await service.updateUserInfo('uid123', dto);
      expect(repository.updateUserInfo).toHaveBeenCalledWith('uid123', dto);
    });
  });

  describe('getUserLocation', () => {
    it('유저의 위치 정보를 반환한다', async () => {
      const mockLocation = {
        address: '123 street',
        latitude: 37.5,
        longitude: 127.0,
      };
      repository.getUserLocation.mockResolvedValue(mockLocation);
      const result = await service.getUserLocation('uid123');
      expect(result).toEqual(mockLocation);
    });
  });
});
