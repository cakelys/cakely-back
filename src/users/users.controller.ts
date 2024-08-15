import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

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

  // 사용자 정보 가져오기
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth('authorization')
  @Get('my')
  async getUserInfo() {
    const uid = '665f134a0dfff9c6393100d5';
    const result = await this.usersService.getUserInfo(uid);
    return result;
  }
}
