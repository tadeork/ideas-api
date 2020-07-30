/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from '../comment.entity';
import { Repository } from 'typeorm';
import { IdeaEntity } from 'src/idea/idea.entity';
import { UserEntity } from 'src/user/user.entity';
import { CommentDTO } from '../comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showByIdea(id: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['comments', 'comments.author', 'comments.idea'],
    });
    return idea.comments.map(comment => this.toResponseObject(comment));
  }

  async showByUser(id: string) {
    const comments = await this.commentRepository.find({
      where: { author: { id } },
      relations: ['author'],
    });
    return comments.map(comment => this.toResponseObject(comment));
  }

  async show(id: string): Promise<CommentDTO> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'idea'],
    });
    return this.toResponseObject(comment);
  }

  async create(
    ideaId: string,
    userId: string,
    data: CommentDTO,
  ): Promise<CommentEntity> {
    const idea = await this.ideaRepository.findOne({ where: { id: ideaId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const comment = await this.commentRepository.create({
      ...data,
      idea,
      author: user,
    });

    await this.commentRepository.save(comment);
    return this.toResponseObject(comment);
  }

  async destroy(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'idea'],
    });

    if (comment.author.id !== userId) {
      throw new HttpException(
        'You dont own this comment',
        HttpStatus.UNAUTHORIZED,
      );
    }
    await this.commentRepository.remove(comment);
    return this.toResponseObject(comment);
  }

  private toResponseObject(comment: CommentEntity) {
    const responseObject: any = comment;
    if (comment.author) {
      responseObject.author = comment.author.toResponseObject(false);
    }

    return responseObject;
  }
}
