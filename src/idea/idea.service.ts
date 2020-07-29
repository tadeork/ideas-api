/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO, IdeaResponseObject } from './idea.dto';
import { UserEntity } from 'src/user/user.entity';
import { UserResponseObject } from 'src/user/user.dto';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll(): Promise<IdeaResponseObject[]> {
    const ideas = await this.ideaRepository.find({
      relations: ['author', 'upvotes', 'downvotes'],
    });
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

  async bookmark(id: string, userId: string) {
    const idea = await this.checkEntity(id);
    const user = await this.checkBookmark(
      id,
      userId,
      'Idea already bookmarked',
    );
    user.bookmarks.push(idea);
    await this.userRepository.save(user);

    return user.toResponseObject(false);
  }

  async unbookmark(id: string, userId: string) {
    const idea = await this.checkEntity(id);
    const user = await this.checkBookmark(id, userId, 'No bookmark registered');

    user.bookmarks.splice(0, user.bookmarks.indexOf(idea));
    await this.userRepository.save(user);

    return user.toResponseObject(false);
  }

  private async checkBookmark(
    id: string,
    userId: string,
    message: string,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });
    const idea = await this.checkEntity(id);

    if (
      user.bookmarks &&
      user.bookmarks.filter(bookmark => bookmark.id === idea.id).length == 1
    ) {
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
    if (!user.bookmarks) {
      user.bookmarks = new Array<IdeaResponseObject>();
    }
    return user;
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

  private async checkEntityIdea(id: string): Promise<IdeaEntity> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return idea;
  }

  private toResponseObject(idea: IdeaEntity): IdeaResponseObject {
    const responseObject: any = {
      ...idea,
      author: idea.author ? idea.author.toResponseObject(false) : null,
    };

    if (responseObject.upvotes) {
      responseObject.upvotes = idea.upvotes.length;
    }
    if (responseObject.downvotes) {
      responseObject.downvotes = idea.downvotes.length;
    }
    return responseObject;
  }

  private ensureOwnership(idea: IdeaResponseObject, userId: string) {
    if (idea.author.id !== userId) {
      throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
    }
  }
}
