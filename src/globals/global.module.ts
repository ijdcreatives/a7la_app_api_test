import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { join } from 'path';
import { MailService } from './services/email.service';
import { MapService } from './services/map.service';
import { ModelHelperService } from './services/modelHelper.service';
import { NotificationsService } from './services/notifications-service';
import { PrismaService } from './services/prisma.service';
import { ResponseService } from './services/response.service';
import { SettingService } from './services/settings.service';
import { SMSService } from './services/sms.service';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: env('MAIL_HOST'),
        port: env('MAIL_PORT'),
        secure: false,
        auth: {
          user: env('MAIL_USER'),
          pass: env('MAIL_PASSWORD'),
        },
      },
      defaults: {
        from: `"No Reply" <${env('SENDER_EMAIL')}>`,
      },
      //
      template: {
        dir: join(__dirname, '../../src/templates'), // Adjust this path
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],

  providers: [
    ResponseService,
    PrismaService,
    SMSService,
    MapService,
    NotificationsService,
    MailService,
    ModelHelperService,
    SettingService,
  ],
  exports: [
    ResponseService,
    PrismaService,
    SMSService,
    MapService,
    NotificationsService,
    MailService,
    ModelHelperService,
    SettingService,
  ],
})
export class GlobalModule {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'deliver-us',
        clientEmail: 'fahdhakem48@gmail.com',
        privateKey:
          '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5l6y5YquOqmOd\nCcKQ1oTUOHWFVZ/WvczjI6bJZbXU40EyIhRFnYvxUVhFU6tovqQS09zJM2C112e3\nQElWjXMr+QiB0av/6jB76d9SQ50zZbplblDXro4VCWJ8YJXXfEd/KhXqHgl8gl60\nKJhOqUBSDsU3TcDLJQUCFwU+gP/9uy+3+8Cl9eBp3W/JsdxwtS7BU7EZ3TfGOu1I\nQ933OzGv4KZwk12G+sYtEXDqM/vIk+9lUkpfYsLb9oA6gGgrDHk8hPM354iYg+6a\nUEPEYB3INoErAnyOg+3a4GeoepwhgwlhJcTgtG5chrX2K8Ahhx1vYhwsr+sdEeMs\n5EKWfS/1AgMBAAECggEALSy8dA6OrEYQw7GTvL4erGqGvpsKMlLWS6aKq0SY5zYe\n0TVm4lAYN3fhqNRWKYOX++Y6fHYHURPa0Mny4ADDuz0doz3WZE9MmGjjvUosek2F\nermIr4szVe8IHDbFWmOLoqorleZUUEyKgUdNVX5Qo/io7A5+wmPjLXBNjDqJtSiA\nHY1v8q57Q+2hnW2hB0j2MAuQOQ0t0u2448T/GkdIsMGcgExkrOnWcBMyZr3lBc5d\npJ0qCVN6/NdrRXjF2DQ+VaYNkhaNn+zIiKu7Hb0BKNFwxmrgK80OJHa8X1E+6Po4\nx0Rd4TZPgzDt1VGKoqzNS3mrOGxXL9iLIpgHvqEJGQKBgQDjibkILQgYGYxfHeVj\nxCimgB4MfdbjfNJpqS+GXh9cczh35lnnz1+Z+g95YNh9h8BOUFZG3kCGgy2F6VPc\nQ9cjxosFrnoGYio4HUej7kdeMxNJnk22AEsyUY3tZS7kCTqXD3LdQzZPr371UWZW\nCBnbXSnMh7XKwNq8Iw8cyy5kCQKBgQDQzsNFsSI6U9MlBuH0ySmZ96yPxgDqQrcu\nCLuLEDKsclH+EZgZQ68ZN0tYp8aDKBpI72teG2LEbYMuAEafjd5JEdCuZ/pbio8p\nODQ74ewKY37t4EPehjXH2U6MaYUcWsBR+YuiGTX5EVCDZZrJuKKKpbd7x1e3SJz+\nI1284/sfjQKBgFtBZQAub0ybEn0jVFiK13LPdz2zSne6G/lcbT8KiLFfVIphzDT4\nKnNqosIfYTQXOb0u4ytQ/7fy7FMEnSl9287xVdhVfYMJ47zVoWHRsrXI7jdcUfZo\nb8AijTVkm0XBncnv3DV5O1MCI3znxI9EeHpOBvGMjBBhAFjsBqeZpWVhAoGAK3ig\nVsYF5jbFYpQIProSmydhGZ2TWzIAiOjwgocgxZ4XS9nF3Jymu40zdoWXYn7a2gxe\nQf1ZlqNmCBGuolEa0gOPen/TM3OpUl+NIFpslc0ZA9UIzC8My0qGe90MBVcvauGV\nHG47OltMc86XZx+1V0Ag7vgVXucTKCWcwlKEWZECgYEAplIPRUHHCkjSgEdlOwch\nNGPZ3FK+5+oMqoabY45xVXpPdK3ThC9gH3fGP29NKYH31+hkxIwWNpvqhL4E30i5\n8NzuCh/HIA5WyD+XHGaNJ7Typk16X//oJp6A8n0Fwch2Gyrl2AOXGXxvHVkPe5v6\nLoTpnVANa9CCYu1mxy6DlI4=\n-----END PRIVATE KEY-----\n'.replace(
            /\\n/g,
            '\n',
          ),
      }),
    });
  }
}
