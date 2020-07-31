/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  Logger,
  UseGuards,
  Query,
} from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';
import { ValidationPipe } from '../shared/validation.pipe';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/user/user.decorator';

@Controller('api/idea')
export class IdeaController {
  private logger = new Logger('IdeaController');

  constructor(private ideaService: IdeaService) {}

  private logData(options: any) {
    options.user && this.logger.log('USER' + JSON.stringify(options.user));
    options.userId &&
      this.logger.log('USER ID' + JSON.stringify(options.userId));
    options.body && this.logger.log('BODY' + JSON.stringify(options.body));
    options.id && this.logger.log('IDEA' + JSON.stringify(options.id));
  }

  @Get()
  showAll(@Query('page') page: number) {
    return this.ideaService.showAll(page);
  }

  @Get('/newest')
  showNewest(@Query('page') page: number) {
    return this.ideaService.showAll(page, true);
  }

  @Post()
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  create(@User('id') user: any, @Body() data: IdeaDTO) {
    this.logData({ user, data });
    return this.ideaService.create(user, data);
  }

  @Get(':id')
  read(@Param('id') id: string) {
    return this.ideaService.read(id);
  }

  @Put(':id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  update(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() data: Partial<IdeaDTO>,
  ) {
    this.logData({ id, userId, data });
    return this.ideaService.update(id, userId, data);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  destroy(@Param('id') id: string, @User('id') userId: string) {
    this.logData({ id, userId });
    return this.ideaService.destroy(id, userId);
  }

  @Post(':id/bookmark')
  @UseGuards(new AuthGuard())
  bookmarkIdea(@Param('id') id: string, @User('id') userId: string) {
    this.logData({ id, userId });
    return this.ideaService.bookmark(id, userId);
  }

  @Delete(':id/bookmark')
  @UseGuards(new AuthGuard())
  unbookmarkIdea(@Param('id') id: string, @User('id') userId: string) {
    this.logData({ id, userId });
    return this.ideaService.unbookmark(id, userId);
  }

  @Post(':id/upvote')
  @UseGuards(new AuthGuard())
  upvote(@Param('id') id: string, @User('id') userId: string) {
    this.logData({ id, userId });
    return this.ideaService.upvote(id, userId);
  }

  @Post(':id/downvote')
  @UseGuards(new AuthGuard())
  downvote(@Param('id') id: string, @User('id') userId: string) {
    this.logData({ id, userId });
    return this.ideaService.downvote(id, userId);
  }
}
