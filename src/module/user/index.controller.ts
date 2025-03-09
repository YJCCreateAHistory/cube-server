import { Body, Controller, Post, Get, Delete } from '@nestjs/common';
import { UserService } from './index.service';
import { USER } from 'src/constant/api';

@Controller(USER.BASE)
export class UserController {
  // 依赖注入
  constructor(
    private readonly UserService: UserService,
  ) { }

  @Get(USER.LIST)
  async userlist() {
    return this.UserService.findUserlist()
  }

  @Post(USER.UPDATE)
  async update(@Body() body) {

  }

  @Delete(USER.DELETE)
  async delete(@Body() body) {

  }

}