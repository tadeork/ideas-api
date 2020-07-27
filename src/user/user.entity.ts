/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserResponseObject } from './user.dto';
import { IdeaEntity } from 'src/idea/idea.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(
    type => IdeaEntity,
    idea => idea.author,
  )
  ideas: IdeaEntity[];

  toResponseObject(showToken = true): UserResponseObject {
    const { id, created, username, token } = this;
    const responseObject: any = { id, created, username };
    if (showToken) {
      responseObject.token = token;
    }
    if (this.ideas) {
      responseObject.ideas = this.ideas;
    }
    return responseObject;
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  private get token() {
    const { id, username } = this;
    return jwt.sign({ id, username }, process.env.SECRET, { expiresIn: '7d' });
  }
}
