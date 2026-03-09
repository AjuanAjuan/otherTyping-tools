import { forwardRef, Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
// import { PlayerModule } from '../players/players.module';
import { UserRepository } from './repository/user.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from 'src/config/redis/cache.module';
import { ListQueryService } from 'src/utils/common-module/list-query/list-query.service';

@Module({
  controllers: [UserController],
  providers: [UserRepository, UserService, ],
  exports: [UserService],
  imports: [
    // PlayerModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get("JWT_SECRET"),
        signOptions: {
          expiresIn: process.env.JWT_EXPIRE
        }
      })
    }),
    ConfigModule,

  ]
})
export class UserModule { }