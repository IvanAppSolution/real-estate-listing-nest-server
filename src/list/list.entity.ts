// import { Profile } from "src/profile/profile.entity";
// import { Tweet } from "src/tweet/tweet.entity";
import { User } from "src/user/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
 

@Entity()
export class List {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column({
      type: 'varchar',
      nullable: false,
      length: 100
   })
   name: string;

   @Column({
      type: 'varchar',
      length: 100,
      default: '',
      nullable: true
   })
   code: string;

   @Column({
      type: 'uuid',
      nullable: false
   })
   userId: string; // Reference to user ID (you might want to add @ManyToOne relation later)
 

   @Column({
      type: 'text',
      default: '',
      nullable: true
   })
   description: string;

   @Column({
      type: 'decimal',
      precision: 12,
      scale: 2,
      default: 0,
      nullable: false
   })
   price: number;

   @Column({
      type: 'json',
      nullable: true
   })
   images: string[]; // Array of image URLs

   @Column({
      type: 'json',
      nullable: true
   })
   address: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
   };

   @Column({
      type: 'json',
      nullable: true
   })
   contact: {
      name?: string;
      email?: string;
      phone?: string;
      others?: string;
   };

   @Column({
      type: 'int',
      default: 0,
      nullable: true
   })
   numBedroom: number;

   @Column({
      type: 'int',
      default: 0,
      nullable: true
   })
   numBathroom: number;

   @Column({
      type: 'int',
      nullable: true
   })
   garage: number;

   @Column({
      type: 'varchar',
      length: 100,
      nullable: true
   })
   area: string;

   @Column({
      type: 'int',
      nullable: true
   })
   yearBuilt: number;

   @Column({
      type: 'varchar',
      length: 50,
      default: 'residential',
      nullable: true
   })
   category: string;

   @Column({
      type: 'varchar',
      length: 50,
      default: 'house',
      nullable: true
   })
   propertyType: string;

   @Column({
      type: 'varchar',
      length: 50,
      default: 'for rent',
      nullable: true
   })
   propertyStatus: string;

   @Column({
      type: 'varchar',
      length: 50,
      default: '',
      nullable: true
   })
   inventoryStatus: string;

   @Column({
      type: 'decimal',
      precision: 3,
      scale: 2,
      default: 0,
      nullable: true
   })
   rating: number;

   @CreateDateColumn()
   createdAt: Date;

   @UpdateDateColumn()
   updatedAt: Date;

   @DeleteDateColumn()
   deleteAt: Date;

   @ManyToOne(() => User, (user) => user.lists)
   user: User;
}