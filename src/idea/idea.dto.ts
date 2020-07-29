import { IsString } from 'class-validator';
import { UserResponseObject } from 'src/user/user.dto';

export class IdeaDTO {
  @IsString()
  idea: string;

  @IsString()
  description: string;
}

export class IdeaResponseObject {
  id: string;
  updated: Date;
  created: Date;
  idea: string;
  description: string;
  author: UserResponseObject;
  upvotes: number;
  downvotes: number;
}
