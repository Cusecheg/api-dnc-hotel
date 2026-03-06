import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.model';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { HotelsModule } from './modules/hotels/hotels.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';



console.log('REDIS_HOST', process.env.REDIS_HOST)
console.log('REDIS_PORT', process.env.REDIS_PORT)
@Module({
  imports: [PrismaModule, AuthModule, UserModule, 
  ThrottlerModule.forRoot([
    {
    ttl: 5000,
    limit: 3,
  },
  ]),
  MailerModule.forRoot({
    transport: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
    defaults: {
      from: `"dnc_hotel" <${process.env.MAILER_FROM}>`,
    }
  }),
  ...(process.env.REDIS_HOST && process.env.REDIS_PORT
  ? [
      RedisModule.forRoot({
        type: 'single',
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        options: {
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => Math.min(times * 1000, 60000),
          connectTimeout: 5000,
        },
      }),
    ]
  : []),
  HotelsModule,
  ReservationsModule,
   ServeStaticModule.forRoot(
    {
      rootPath: join(__dirname, '..', 'uploads-hotels'), // Ruta del directorio donde se almacenan las imágenes
      serveRoot: '/uploads-hotels',
      serveStaticOptions: {
        dotfiles: 'ignore', // Permitir servir archivos ocultos (por ejemplo, .gitignore)
         setHeaders: (res, path) => {
          console.log(join(__dirname, '..', 'uploads-hotels'))
          if (path.endsWith('.webp') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png')) {  // Solo configuramos imágenes .webp, puedes añadir más tipos si lo deseas
            res.setHeader('Content-Type', 'image/webp');
          }
        },
      }, // Ruta accesible desde el navegador
    },
    {
      rootPath: join(__dirname, '..', 'uploads/avatars'), // Ruta del directorio donde se almacenan las imágenes
      serveRoot: '/uploads/avatars',
      serveStaticOptions: {
        dotfiles: 'ignore', // Permitir servir archivos ocultos (por ejemplo, .gitignore)
         setHeaders: (res, path) => {
          console.log(join(__dirname, '..', 'uploads/avatars'))
          if (path.endsWith('.webp') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png')) {  // Solo configuramos imágenes .webp, puedes añadir más tipos si lo deseas
            res.setHeader('Content-Type', 'image/webp');
          }
        },
      }, // Ruta accesible desde el navegador
    },
    
  
  ),
],
  providers: [
    { provide: 'APP_GUARD', useClass: ThrottlerModule }
  ],
})
export class AppModule {}

console.log("Dirname", __dirname);
console.log("Join Path", join(__dirname, '..', 'uploads-hotels'));