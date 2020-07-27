/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO, IdeaResponseObject } from './idea.dto';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll(): Promise<IdeaResponseObject[]> {
    const ideas = await this.ideaRepository.find({ relations: ['author'] });
    return ideas.map(idea => this.toResponseObject(idea));
  }

  async create(userId: string, data: IdeaDTO): Promise<IdeaResponseObject> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = this.ideaRepository.create({ ...data, author: user });
    await this.ideaRepository.save(idea);
    return this.toResponseObject(idea);
  }

  async read(id: string): Promise<IdeaResponseObject> {
    return this.checkEntity(id);
  }

  async update(id: string, userId: string, data: Partial<IdeaDTO>) {
    const idea = await this.checkEntity(id);
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.update({ id }, data);
    return await this.checkEntity(id);
  }

  async destroy(id: string, userId: string) {
    const idea = await this.checkEntity(id);
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.delete({ id });
    return { deleted: true };
  }

  private async checkEntity(id: string): Promise<IdeaResponseObject> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return this.toResponseObject(idea);
  }

  private toResponseObject(idea: IdeaEntity): IdeaResponseObject {
    return {
      ...idea,
      author: idea.author ? idea.author.toResponseObject(false) : null,
    };
  }

  private ensureOwnership(idea: IdeaResponseObject, userId: string) {
    if (idea.author.id !== userId) {
      throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
    }
  }
}
