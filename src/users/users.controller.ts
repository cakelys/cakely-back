import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @ApiBearerAuth('authorization')
  @UseGuards(AuthGuard)
  @Post('login')
  logIn(@Req() request): void {
    const uid = request.userId;
    this.usersService.logIn(uid);
  }

  // 회원가입
  @Post('signin')
  signIn(@Req() request) {
    const accessToken = request.headers['authorization'];
    return this.usersService.signIn(accessToken);
  }

  // 사용자 정보 가져오기
  // @ApiBearerAuth('authorization')
  @UseGuards(AuthGuard)
  @Get('my')
  async getUserInfo(@Req() request) {
    const uid = request.userId;
    const result = await this.usersService.getUserInfo(uid);
    return result;
  }
}
