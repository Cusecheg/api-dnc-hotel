import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UploadedFile, ParseFilePipe, MaxFileSizeValidator, UseInterceptors, FileTypeValidator } from '@nestjs/common';
import { CreateHotelService } from '../services/createHotel.service';
import { FindAllHotelService } from '../services/findAllHotel.service';
import { FindOneHotelService } from '../services/findOneHotel.service';
import { UpdateHotelService } from '../services/updateHotel.service';
import { RemoveHotelService } from '../services/removeHotel.service';
import { UpdateHotelDto } from '../domain/dto/update-hotel.dto';
import { CreateHotelDto } from '../domain/dto/create-hotel.dto';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { FindByNameHotelService } from '../services/findByNameHotel.service';
import { FindByOwnerHotelService } from '../services/findByOwnerHotel.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decotaror';
import { Role } from '@prisma/client';
import { OwnerHotelGuard } from 'src/shared/guards/ownerHotel.guard';
import { priceDecorator } from 'src/shared/decorators/price.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { QueryHotelDto } from '../domain/dto/query-hotel.dto';
import { UploadImageHotelService } from '../services/uploadImageHotel.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidatorInterceptor } from 'src/shared/interceptors/fileValidator.interceptor';

@UseGuards(AuthGuard, RoleGuard)
@Controller('hotels')
export class HotelsController {
  constructor(
    private readonly createHotelService: CreateHotelService,
    private readonly findAllHotelService: FindAllHotelService,
    private readonly findByNameHotelService: FindByNameHotelService,
    private readonly findByOwnerHotelService: FindByOwnerHotelService,
    private readonly findOneHotelService: FindOneHotelService,
    private readonly updateHotelService: UpdateHotelService,
    private readonly removeHotelService: RemoveHotelService,
    private readonly uploadImageHotelService: UploadImageHotelService,
  ) {}

  @Roles(Role.ADMIN, Role.USER)
  @Get()
  findAll(@Query() query: QueryHotelDto) {
    return this.findAllHotelService.execute(query.page, query.limit);
  }
  @Roles(Role.ADMIN, Role.USER)
  @Get('name')
  findByName(@Query('name') name: string) {
    return this.findByNameHotelService.execute(name);
  }

  @Roles(Role.ADMIN)
  @Get('owner')
  findByOwner(@User('id') id: number) {
    return this.findByOwnerHotelService.execute(id);
  }
  @Roles(Role.ADMIN, Role.USER)
  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findOneHotelService.execute(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@User('id') ownerId: number, @Body() createHotelDto: CreateHotelDto) {
    return this.createHotelService.execute(createHotelDto, ownerId);
  }

  @UseInterceptors(FileInterceptor('image'), FileValidatorInterceptor)
  @Patch('image/:hotelId')
  uploadImage(@Param('hotelId') hotelId: string, 
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 900 * 1024 }) 
      ],
    })
  ) image: Express.Multer.File
) {
    return this.uploadImageHotelService.execute(Number(hotelId), image.filename);
  }

  @UseGuards(OwnerHotelGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@ParamId() id: number, @Body() updateHotelDto: UpdateHotelDto) {
    return this.updateHotelService.execute(id, updateHotelDto);
  }

  @UseGuards(OwnerHotelGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@ParamId() id: number) {
    return this.removeHotelService.execute(id);
  }
}
