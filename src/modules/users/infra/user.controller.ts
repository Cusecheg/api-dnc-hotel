import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDTO } from '../domain/dto/createUser.dto';
import { UpdateUserDTO } from '../domain/dto/updateUser.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { Role, type User as UserType } from '@prisma/client';
import { Roles } from 'src/shared/decorators/roles.decotaror';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { UserMatchGuard } from 'src/shared/guards/userMatch.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidatorInterceptor } from 'src/shared/interceptors/fileValidator.interceptor';
import { CustomFileValidator } from 'src/shared/interceptors/custom-file.validator';
import { ListUserService } from '../services/listUser.service';
import { ShowUserService } from '../services/showUser.service';
import { CreateUserService } from '../services/createUser.service';
import { UpdateUserService } from '../services/updateUser.service';
import { DeleteUserService } from '../services/deleteUser.Service';
import { UploadAvatarUserService } from '../services/uploadAvatarUser.service';
@UseGuards(AuthGuard, RoleGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly listUserService: ListUserService,
    private readonly showUserService: ShowUserService,
    private readonly createUserService: CreateUserService,
    private readonly updateUserService: UpdateUserService,
    private readonly deleteUserService: DeleteUserService,
    private readonly uploadAvatarUserService: UploadAvatarUserService,
) {}

  @UseGuards(ThrottlerGuard)
  @Roles(Role.ADMIN)
  @Get()
  list() {
    return this.listUserService.execute();
  }
  
  @Roles(Role.ADMIN, Role.USER)
  @Get('me')
  me(@User('id') id: number) {
    return this.showUserService.execute(id);
  }
  
  @UseGuards(UserMatchGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  show(@Param('id', ParseIntPipe) id: number) {
    return this.showUserService.execute(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateUserDTO) {
    return this.createUserService.execute(body);
  }

  @UseGuards(UserMatchGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDTO) {
    return this.updateUserService.execute(id, body);
  }

  @UseGuards(UserMatchGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.deleteUserService.execute(id);
  }
  @UseInterceptors(FileInterceptor('avatar'), FileValidatorInterceptor)
  @Post('avatar')
  uploadAvatar(
    @User('id') id: Number,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 900 * 1024,
        })
        .build({
          errorHttpStatusCode: 400,
        }),
    )
    avatar: Express.Multer.File,
  ) {
    return this.uploadAvatarUserService.execute(id, avatar.filename);
  }
}
