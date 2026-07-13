import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';

const CLOUDINARY_PROVIDER = {
  provide: 'CLOUDINARY',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
  },
};

@Global()
@Module({
  controllers: [CloudinaryController],
  providers: [CLOUDINARY_PROVIDER, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
