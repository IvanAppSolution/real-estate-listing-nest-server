// import { Profile } from "src/profile/profile.entity";
// import { Tweet } from "src/tweet/tweet.entity";
import { List } from "../list/list.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    ADMIN = "admin",
    USER = "user",
}

@Entity()
export class User {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column({
      type: 'varchar',
      nullable: false,
      length: 24,
      unique: true
   })
   username: string;

   @Column({
      type: 'varchar',
      nullable: false,
      length: 100,
      unique: true
   })
   email: string;

   @Column({
      type: 'varchar',
      nullable: false,
      length: 100
   })
   password: string;

   // role: { type: String, enum: ['user', 'admin'], default: 'user' }
   @Column({
      type: 'enum',
      nullable: true,
      enum: UserRole,
      default: UserRole.USER
   })
   role: string;

   // @OneToOne(() => Profile, (profile) => profile.user, {
   //    cascade: ['insert'],
   // })
   // profile?: Profile;

   // @OneToMany(() => Tweet, (tweet) => tweet.user)
   // tweets: Tweet[]

   @CreateDateColumn()
   createdAt: Date;

   @UpdateDateColumn()
   updatedAt: Date;

   @DeleteDateColumn()
   deleteAt: Date;

   @OneToMany(() => List, (list) => list.user)
   lists: List[]
}