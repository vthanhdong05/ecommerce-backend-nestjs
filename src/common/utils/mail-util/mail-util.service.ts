import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailUtilService {
  constructor(private readonly mailerService: MailerService) {}

  sendMail(sendMailOptions: ISendMailOptions) {
    return this.mailerService.sendMail(sendMailOptions);
  }
}
