import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME') as string,
      api_key: configService.get('CLOUDINARY_API_KEY') as string,
      api_secret: configService.get('CLOUDINARY_API_SECRET') as string,
    });
  },
  inject: [ConfigService],
};