import { IsNotEmpty } from 'class-validator';
import { IdeaResponseObject } from 'src/idea/idea.dto';

export class UserDTO {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  password: string;
}

export class UserResponseObject {
  id: string;
  username: string;
  created: Date;
  token?: string;
  bookmarks?: IdeaResponseObject[];
}
