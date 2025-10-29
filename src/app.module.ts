import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ListModule } from './list/list.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, Reflector } from '@nestjs/core'; // <-- Import Reflector
import { AuthGuard } from './auth/auth.guard';
import { JwtService } from '@nestjs/jwt'; // <-- Import JwtService
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { HealthController } from './health/health.controller';
import { User } from './user/user.entity';
import { List } from './list/list.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, List],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        ssl: configService.get<string>('NODE_ENV') === 'production' 
          ? { rejectUnauthorized: false } 
          : false,
      }),
    }),
    AuthModule,
    UserModule,
    ListModule,
    CloudinaryModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      inject: [JwtService, ConfigService, Reflector],
      useFactory: (
        jwtService: JwtService,
        configService: ConfigService,
        reflector: Reflector,
      ) => new AuthGuard(jwtService, configService, reflector),
    },
  ],
})
export class AppModule {}