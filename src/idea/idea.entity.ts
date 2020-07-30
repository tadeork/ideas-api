import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { CommentEntity } from 'src/comment/comment.entity';

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

  @ManyToMany(type => UserEntity, { cascade: true })
  @JoinTable()
  upvotes: UserEntity[];

  @ManyToMany(type => UserEntity, { cascade: true })
  @JoinTable()
  downvotes: UserEntity[];

  @OneToMany(
    type => CommentEntity,
    comment => comment.idea,
    { cascade: true },
  )
  comments: CommentEntity[];
}
