import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ListModule } from './list/list.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [AuthModule, UserModule,   ListModule, CloudinaryModule,
  ConfigModule.forRoot({
    isGlobal: true
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
      type: configService.get('DB_TYPE'),
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_NAME'),
      autoLoadEntities: true,
      synchronize: true,
      ssl: configService.get('NODE_ENV') === "production",
      extra: configService.get('NODE_ENV') === "production" ? {
        ssl: {
          rejectUnauthorized: false, // Disables strict certificate validation
        },
      } : {}
    } as TypeOrmModuleOptions)
  })  
  ],
  controllers: [],
  providers: [  {
      provide: APP_GUARD,
      useClass: AuthGuard,
  }],
})
export class AppModule {}
