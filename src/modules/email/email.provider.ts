import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CircuitBreakerService } from '../../circuit-breaker/circuit-breaker.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailProvider {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailProvider.name);

  constructor(
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false, 
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    const breaker = this.circuitBreaker.getBreaker('NodemailerAPI', async () => {
      const from = this.configService.get<string>('SMTP_FROM') || '"Health System" <noreply@hcms.com>';
      
      this.logger.log(`[EmailProvider] FINAL STEP: Sending email to ${to}. Subject: ${subject}`, 'EmailProvider');
      // Look for the browser name in the HTML body here in the logs!
      this.logger.log(`[EmailProvider] HTMl SNAPSHOT: ${body.substring(body.indexOf('Device:'), body.indexOf('Time of Login:'))}`, 'EmailProvider');

      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html: body,
      });
      
      // Log test URL so user can view rendered HTML visually without a real inbox!
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        this.logger.log(`Email sent successfully! 📧 Preview URL: ${testUrl}`);
      } else {
        this.logger.log(`Email sent successfully to ${to}`);
      }
      
      return true;
    });

    return await breaker.fire();
  }
}
