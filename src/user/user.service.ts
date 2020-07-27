/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserDTO, UserResponseObject } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll(): Promise<UserResponseObject[]> {
    const users = await this.userRepository.find({ relations: ['ideas'] });
    return users.map(user => user.toResponseObject(false));
  }

  async login(data: UserDTO): Promise<UserResponseObject> {
    const { username, password } = data;
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || !(await user.comparePassword(password))) {
      throw new HttpException(
        'Invalida username/passowrd',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user.toResponseObject();
  }

  async register(data: UserDTO): Promise<UserResponseObject> {
    const { username } = data;
    let user = await this.userRepository.findOne({ where: { username } });
    if (user)
      throw new HttpException('User not available', HttpStatus.BAD_REQUEST);

    user = await this.userRepository.create(data);
    await this.userRepository.save(user);

    return user.toResponseObject();
  }
}
