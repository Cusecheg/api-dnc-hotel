import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Hotel } from "@prisma/client";
import { AuthService } from "src/modules/auth/auth.service";
import { FindOneHotelService } from "src/modules/hotels/services/findOneHotel.service";

@Injectable()
export class OwnerHotelGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly findOneHotelService: FindOneHotelService
    ){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const hotelId = request.params.id;
        const user = request.user;

        if (!user) return false

        const hotel = await this.findOneHotelService.execute(Number(hotelId));

        if (!hotel) return false

        return hotel.ownerId === user.id;
    }
}