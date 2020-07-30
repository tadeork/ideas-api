/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  Body,
  Delete,
} from '@nestjs/common';
import { CommentService } from './comment/comment.service';
import { AuthGuard } from 'src/shared/auth.guard';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { User } from 'src/user/user.decorator';
import { CommentDTO } from './comment.dto';

@Controller('api/comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('idea/:id')
  showCommentsByIdea(@Param('id') id: string) {
    return this.commentService.showByIdea(id);
  }

  @Get('user/:id')
  showCommentsByUser(@Param('id') userId: string) {
    return this.commentService.showByUser(userId);
  }

  @Post('idea/:id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createComment(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() data: CommentDTO,
  ) {
    return this.commentService.create(id, userId, data);
  }

  @Get(':id')
  showComment(@Param('id') id: string) {
    return this.commentService.show(id);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  destroyComment(@Param('id') id: string, @User('id') userId: string) {
    return this.commentService.destroy(id, userId);
  }
}
