import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/s3/s3.service';
import { KakaoMapClient } from 'src/clients/kakao.map.client';

@Controller({ path: 'users', version: ['1', VERSION_NEUTRAL] })
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
    private readonly kakaoMapClient: KakaoMapClient,
  ) {}

  @UseGuards(AuthGuard)
  @Post('login')
  logIn(@Req() request): void {
    const uid = request.userId;
    this.usersService.logIn(uid);
  }

  @Post('signin')
  signIn(@Req() request) {
    const accessToken = request.headers['authorization'];
    return this.usersService.signIn(accessToken);
  }

  @UseGuards(AuthGuard)
  @Get('my')
  async getUserInfo(@Req() request) {
    const uid = request.userId;
    const result = await this.usersService.getUserInfo(uid);
    return result;
  }

  @UseGuards(AuthGuard)
  @Patch('my')
  @UseInterceptors(FileInterceptor('photo'))
  async updateUserInfo(
    @Req() request,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() photo,
  ) {
    const uid = request.userId;
    if (photo) {
      const photoUrl = await this.s3Service.uploadFile(
        process.env.S3_BUCKET_NAME,
        uid,
        photo,
      );
      updateUserDto.photo = photoUrl;
    }

    if (
      updateUserDto.latitude &&
      updateUserDto.longitude &&
      !updateUserDto.address
    ) {
      updateUserDto.address =
        await this.kakaoMapClient.convertCoordinatesToAddress(
          updateUserDto.latitude,
          updateUserDto.longitude,
        );
    }

    await this.usersService.updateUserInfo(uid, updateUserDto);
  }
}
