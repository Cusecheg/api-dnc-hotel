import { forwardRef, Module } from "@nestjs/common";
import { UserController } from "./infra/user.controller";
import { PrismaModule } from "../prisma/prisma.model";
import { AuthModule } from "../auth/auth.module";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { USER_TOKEN_REPOSITORY } from "./utils/user.token.repository";
import { UserRepository } from "./infra/user.repository";
import { ListUserService } from "./services/listUser.service";
import { ShowUserService } from "./services/showUser.service";
import { FindByEmailUserService } from "./services/findByEmailIUser.service";
import { UpdateUserService } from "./services/updateUser.service";
import { create } from "domain";
import { CreateUserService } from "./services/createUser.service";
import { DeleteUserService } from "./services/deleteUser.Service";
import { UploadAvatarUserService } from "./services/uploadAvatarUser.service";

@Module({
    imports: [PrismaModule, forwardRef(() => AuthModule),
     
    MulterModule.register({
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: async (req, file, cb) => {
                const { v4: uuidv4 } = await import ('uuid'); // <-- esto NO debe estar
                const filename = `${uuidv4()}-${file.originalname}`;   
                cb(null, filename);
        },})
    }),],
    controllers: [UserController],
    providers: [
        {
        provide: USER_TOKEN_REPOSITORY,
        useClass: UserRepository
        },
        ListUserService,
        ShowUserService,
        FindByEmailUserService,
        UpdateUserService,
        CreateUserService,
        DeleteUserService,
        UploadAvatarUserService,
    ],
    exports: [CreateUserService, FindByEmailUserService, UpdateUserService, ShowUserService],
})

export class UserModule {} 