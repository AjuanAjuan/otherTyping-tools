import { BadRequestException, ForbiddenException, Global, Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { CreateUserDto, CreateUserResponse, GetUserListDto, LoginResponse, LoginUserDto, LogoutUserDto, UserInfoPayload, UserListItemResponse } from './dto/user.dto';
import { UserStatus } from 'src/types/modelType/user';
import { authentication, random } from 'src/utils/tool/cryto';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from 'src/config/redis/cache.service';
import { ConfigService } from '@nestjs/config';
import { generateId, generateRefreshToken } from 'src/utils/tool/tool';
import { BaseResponse } from 'src/types/http/http';
import { GetListQueryResponse } from 'src/common/dto/list-query.dto';
import { ListQueryService } from 'src/utils/common-module/list-query/list-query.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

// import { Repository } from 'typeorm';
@Injectable()
export class UserService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
    private cacheService: CacheService,
    private configService: ConfigService,
    private readonly listQueryService: ListQueryService
  ) {
  }

  /**
   * @description 创建账户
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    // 重复username查询
    const existUser = await this.findOneByUsername(createUserDto.username)
    if (existUser) {
      throw new BadRequestException("用户名已被使用,请更换")
    }
    // 使用bcrypt生成salt并哈希密码
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    // password加密
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // 设置用户对象的密码和salt
    createUserDto.password = hashedPassword;
    createUserDto.salt = salt;
    // 创建账户
    const user = await this.userRepository.createUser(createUserDto);

    // 设置用户初始状态
    user.userStatus = UserStatus.offLine;
    user.gameAccumulatedPoints = 100;
    await this.userRepository.getRepo().update(user.id, user);

    return {
      id: user.id,  // 直接使用userId
      userId: user.id,
      userStatus: user.userStatus,
      gameAccumulatedPoints: user.gameAccumulatedPoints
    } as CreateUserResponse
  }

  /**
   * @description 用户登录 通过WxId验证user后,更新用户的相关状态
   * @param loginUserDto loginDto暂时省略
   */
  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.getRepo().findOneBy({ username: loginUserDto.username, wxId: loginUserDto.wxId });
    if (user) {
      // 验证密码 - 使用bcrypt.compare进行安全验证 - 哈希值比较
      const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
      if (!isPasswordValid) {
        throw new ForbiddenException("用户名或密码错误")
      }
      // 验证通过，更新用户状态
      user.userStatus = UserStatus.onLine;
      await this.userRepository.getRepo().update(user.id, user);

      // 添加jwt，使用userId作为标识
      const payload: UserInfoPayload = { username: user.username, userId: user.id };
      const jwt = await this.jwtService.signAsync(payload, {});
      const expireUtcTime = new Date(Date.now() + (this.configService.get("JWT_EXPIRE_TIMESECOND") * 1000)); // token有效期
      // redis addRefreshToken refreshToken只要存在说明没过期
      const refreshToken = generateRefreshToken();
      this.cacheService.set(user.id, refreshToken, this.configService.get("JWT_REFRESH")) // refreshToken设定刷新时间
      const loginResponse: LoginResponse = {
        userInfo: payload,
        token: jwt,
        refreshToken,
        expireUtcTime,
        message: '登录成功',
      };
      return loginResponse;
    } else {
      throw new BadRequestException('用户名或密码错误');
    }
  }

  async logout(logoutUserDto: LogoutUserDto) {
    const user = await this.getUserById(logoutUserDto.id);
    // 更新用户状态为离线
    user.userStatus = UserStatus.offLine;
    await this.userRepository.getRepo().update(user.id, user);
    return '已注销登录';
  }

  async getUserById(id: string) {
    const user = await this.userRepository.getUserById(id);
    if (user) {
      return user;
    } else {
      throw new BadRequestException('无法找到对应的user');
    }
  }

  async findAll(getUserListDto: GetUserListDto) {
    const result = (await this.userRepository.getUserList(getUserListDto));
    let filterItems = result.items.map((item) => {
      return ({ username: item.username }) as UserListItemResponse;
    });
    return { ...result, items: filterItems }
  }

  // 新增通用列表查询方法
  async listUsers(getUserListDto: GetUserListDto): Promise<GetListQueryResponse<User>> {
    return this.listQueryService.findListByDto(
      this.userRepository,
      User,
      getUserListDto,
      ['username'], // 筛选字段
      ['id', 'username', 'createdAt', 'updatedAt'] // 有效的排序字段
    );
  }

  async findOne(id: string) {
    return await this.userRepository.getRepo().findOneBy({ id });
  }

  async findOneByUsername(username: string, wxId?: string) {
    const user = await this.userRepository.getRepo().findOneBy({ username, wxId });
    if (user) {
      return { id: user.id, username: user.username };
    } else {
      return null
    }
  }
  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async setAllUserStatus(status: UserStatus) {
    await this.userRepository.getRepo().createQueryBuilder("user")
      .update()
      .set({ userStatus: status })
      .where("user.userStatus != -10")
      .execute()

  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  test() {
    return 111;
  }

  onModuleInit() { }

  onModuleDestroy() { }
}