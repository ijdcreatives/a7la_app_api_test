import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html,
      });
    } catch (_) {}
  }
  async sendForgetEmail(user: { name: string; email: string }, link: string) {
    try {
      //back again
      // await this.mailerService.sendMail({
      //   to: user.email,
      //   subject: 'Password Reset Request',
      //   template: 'forget',
      //   context: {
      //     name: user.name,
      //     email: user.email,
      //     resetLink: link,
      //   },
      // });
    } catch (error) {
      catchHandler(error);
    }
  }
}
