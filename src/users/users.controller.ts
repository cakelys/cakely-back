import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(AuthGuard)
  // @ApiBearerAuth('authorization')
  // @Post('login')
  // logIn(@Req() request) {
  //   return this.usersService.logIn(request.userId);
  // }

  // // 회원가입
  // // @ApiBearerAuth('authorization')
  // @Post('signin')
  // signIn(@Req() request) {
  //   const accessToken = request.headers['authorization'];
  //   return this.usersService.signIn(accessToken); //request.userId
  // }

  // // 사용자 정보 가져오기
  // // @UseGuards(AuthGuard)
  // // @ApiBearerAuth('authorization')
  // @Get()
  // async getInfo(@Req() request) {
  //   const accessToken = request.headers['authorization'];
  //   const result = await this.usersService.getInfo(accessToken);
  //   if (typeof result === 'string') {
  //     return new HttpException(result, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  //   return result;
  // }
}
