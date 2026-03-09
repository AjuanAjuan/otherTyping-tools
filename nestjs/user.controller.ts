import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserHttpResponse, CreateUserResponse, GetUserListDto, GetUserListHttpResponse, LoginHttpResponse, LoginResponse, LoginUserDto, LogoutUserDto, UserListItemResponse } from './dto/user.dto';
import { BaseController } from 'src/common/baseClass/baseController';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/public/public.decorator';
import { TransactionInterceptor } from 'src/common/interceptor';
import { GetListQueryResponse } from 'src/common/dto/list-query.dto';


@ApiTags("用户")
@Controller('user')
@UseInterceptors(TransactionInterceptor)
export class UserController extends BaseController {
  constructor(private readonly usersService: UserService) {
    super();
  }

  @Public()
  @ApiOperation({ summary: "创建用户", operationId: 'Create' })
  @Post('create')
  @ApiOkResponse({ type: CreateUserHttpResponse })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: "登入", operationId: 'Login' })
  @ApiOkResponse({ type: LoginHttpResponse })
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.usersService.login(loginUserDto);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: "登出", operationId: 'Logout' })
  logout(@Body() logoutUserDto: LogoutUserDto) {
    // 安全设计暂时延后
    return this.usersService.logout(logoutUserDto);
  }

  @Post('getUserList')
  @ApiOperation({ summary: "查询List", operationId: 'GetUserList' })
  @ApiOkResponse({ type: GetUserListHttpResponse })
  getUserList(
    @Body() params: GetUserListDto,
  ) {
    return this.usersService.findAll(params);
  }

  @Get('findOne:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Public()
  @Get('findUserByName:username')
  @ApiOperation({ summary: "查询用户", operationId: 'FindUserByName' })
  findByUsername(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
