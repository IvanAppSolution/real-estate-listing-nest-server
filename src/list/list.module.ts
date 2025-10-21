import { Module } from '@nestjs/common';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { List } from './list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
// import { CloudinaryModule } from 'nestjs-cloudinary';
// import { AuthModule } from "src/auth/auth.module";
// import { Profile } from 'src/profile/profile.entity';

@Module({
  controllers: [ListController],
  providers: [ListService],
  exports: [ListService],
  imports: [TypeOrmModule.forFeature([List]), CloudinaryModule],
})
export class ListModule {}
