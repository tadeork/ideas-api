import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/user/user.entity';

@Entity('idea')
export class IdeaEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @CreateDateColumn() created: Date;

  @Column('text') idea: string;

  @Column('text') description: string;

  @UpdateDateColumn()
  updated: Date;

  @ManyToOne(
    type => UserEntity,
    author => author.ideas,
  )
  author: UserEntity;
}
