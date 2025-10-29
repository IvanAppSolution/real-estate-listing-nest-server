import { Module } from '@nestjs/common';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { List } from './list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
// import { CloudinaryModule } from 'nestjs-cloudinary';
// import { AuthModule } from "src/auth/auth.module";
// import { Profile } from 'src/profile/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([List]), CloudinaryModule],
  controllers: [ListController],
  providers: [ListService],
  exports: [ListService],  
})
export class ListModule {}
