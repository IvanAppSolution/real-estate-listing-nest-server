import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { HealthController } from './health/health.controller';
import { User } from './user/user.entity';
import { List } from './list/list.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ListModule } from './list/list.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      global: true, // <-- ADD THIS LINE TO MAKE JWT SERVICES AVAILABLE EVERYWHERE
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5h' },
      }),
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