import { TokenService } from './service/token.service'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { AUTH } from 'src/constant/api'
import { UserService } from '../user/index.service'
import { Resp } from 'src/constant'
import { AES_CBC_DECRYPT } from 'src/utils/encryption'
import { generateTokenKey } from 'src/utils/redisKey'
import { RedisService } from '../redis/redis.service'

enum INDEX {
  START = 0
}
@Controller(AUTH.BASE)
export class AuthController {

  constructor(
    private readonly UserService: UserService,
    private readonly TokenService: TokenService,
    private readonly RedisService: RedisService
  ) { }

  @Get(AUTH.INDEITY)
  isExister() {
    return this.UserService.isExistUserById('123')
  }

  @Post(AUTH.LOGIN)
  async login(@Body() body) {

    const { telephone, password } = body
    const encryoptPassword = AES_CBC_DECRYPT(password, process.env.SECRET_KEY)
    const retrievalUser = await this.UserService.isExistUserByPhone(telephone)
    if (!retrievalUser.length) {
      return Resp.NO_AUTHORIZATION
    }
    if (retrievalUser[INDEX.START].psd === encryoptPassword) {
      const token = await this.TokenService.builderAccessToken(retrievalUser[INDEX.START].uid, telephone)
      await this.RedisService.setValue(generateTokenKey(retrievalUser[INDEX.START].uid), token.accessToken)
      delete retrievalUser[INDEX.START].psd
      return {
        ...Resp.SUCCESS,
        data: {
          data: retrievalUser[INDEX.START],
          token: token
        }
      }
    }
    return Resp.NO_AUTHORIZATION

  }

  @Post(AUTH.REGISTER)
  async register(@Body() body) {
    const { telephone, password, username } = body
    const retrievalUser = await this.UserService.regeister({ telephone, password, username })
    if (!retrievalUser) {
      return Resp.EXIST
    }
    return retrievalUser
  }

}