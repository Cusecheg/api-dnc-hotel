import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decotaror";
import { Role } from "@prisma/client";


@Injectable()
export class  RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
    ){}
    canActivate(context: ExecutionContext){
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY,[
            context.getHandler(),
            context.getClass(),
        ]);

        console.log({requiredRoles});
        console.log(context.getHandler()); // función del método
        console.log(context.getClass());  
        if (!requiredRoles) return true;
        const { user } = context.switchToHttp().getRequest();
        console.log('user role:', user.role);
        if (!user) return false;

        return requiredRoles.includes(user.role);

}
}