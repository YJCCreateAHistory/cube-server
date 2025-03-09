import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from 'src/module/user/entity/user.entity'
import { IRegsiter, IResponse } from 'src/types/base';
import { createTime } from 'src/utils/common';
import { EntityManager, Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid';
import { Resp } from 'src/constant';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly entityManager: EntityManager,
  ) { }

  isExistUserById(uid: string): Promise<UserEntity | any> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.uid = :uid', { uid })
      .orderBy('user.name', 'ASC')
      .getMany()
  }

  isExistUserByPhone(phone_number: string): Promise<UserEntity | any> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.phone_number = :phone_number', { phone_number })
      .orderBy('user.name', 'ASC')
      .select(['user.name', 'user.phone_number', 'user.uid', 'user.psd'])
      .getMany()
  }

  findUserlist() {
    return this.usersRepository
      .createQueryBuilder('user')
      .orderBy('user.name', 'ASC')
      .getMany()
  }

  async regeister(regsiterInfo: IRegsiter): Promise<IResponse> {

    const { telephone, password, username } = regsiterInfo
    const retrievalUser = await this.isExistUserByPhone(telephone)

    if (retrievalUser.length)  return null;

    const createUid = uuidv4()
    const time = createTime()

    await this.entityManager.transaction(async (manager) => {
      const u = manager.create(UserEntity, {
        uid: createUid,
        name: username,
        psd: password,
        phone_number: telephone,
        create_time: time,
        update_time: time
      })

      await manager.save(u)
    })

    return Resp.SUCCESS

  }

}

