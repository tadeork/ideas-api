/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO, IdeaResponseObject } from './idea.dto';
import { UserEntity } from 'src/user/user.entity';
import { Votes } from 'src/shared/votes.enum';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll(page = 1, newest?: boolean): Promise<IdeaResponseObject[]> {
    const ideas = await this.ideaRepository.find({
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
      take: 25,
      skip: 25 * (page - 1),
      order: newest && { created: 'DESC' },
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

  async upvote(id: string, userId: string) {
    const idea: IdeaEntity = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
    });
    const user: UserEntity = await this.userRepository.findOne({
      where: { id: userId },
    });
    this.vote(idea, user, Votes.UP);
    return this.toResponseObject(idea);
  }

  async downvote(id: string, userId: string) {
    const idea: IdeaEntity = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
    });
    const user: UserEntity = await this.userRepository.findOne({
      where: { id: userId },
    });
    this.vote(idea, user, Votes.DOWN);
    return this.toResponseObject(idea);
  }

  private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
    const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;

    if (
      idea[opposite].filter((voter: UserEntity) => voter.id === user.id)
        .length > 0 ||
      idea[vote].filter((voter: UserEntity) => voter.id === user.id).length > 0
    ) {
      idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id);
      idea[vote] = idea[vote].filter(
        (voter: UserEntity) => voter.id !== user.id,
      );
      await this.ideaRepository.save(idea);
    } else if (
      idea[vote].filter((voter: UserEntity) => voter.id === user.id).length < 1
    ) {
      idea[vote].push(user);
      await this.ideaRepository.save(idea);
    } else {
      throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
    }

    return idea;
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
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
    });
    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return this.toResponseObject(idea);
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
