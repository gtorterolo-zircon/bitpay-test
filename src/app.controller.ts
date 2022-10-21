import {
  Get,
  Post,
  Body,
  Param,
  Controller,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { AppInvoice, AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(): string {
    console.log('root');
    return this.appService.root();
  }

  @Get('client-id')
  clientId(): string {
    return this.appService.getClientId();
  }

  @Post('invoice')
  async createInvoice(@Body('baseUrl') baseUrl: string): Promise<AppInvoice> {
    /*
Testing Considerations
Testing may involve not only the integration of the BitPay service and the payment of
invoices but also how you handle common payment exceptions.

You should consider testing the following kinds of transactions:
A fully paid invoice, paid on time (within 15 minutes of invoice generation)
A fully paid invoice, paid late (after 1 hour, after 24 hours)
An underpaid invoice (pay an amount less than the invoice requires.)
An overpaid invoice (pay an amount more than the invoice requires.)
An invoice with and without wallet fees:
Try to force an invalid transaction using a low value invoice with no wallet fees. Invalid transactions are invoices that have been paid but which have zero confirmations within one hour of being received by the BitPay server.
*/
    return this.appService.createInvoice(baseUrl);
  }

  @Get('invoice/:id')
  async getInvoice(@Param('id') id: string): Promise<AppInvoice> {
    return this.appService.getInvoice(id);
  }

  @Get('callback')
  async callback(
    @Body() allBody: any,
    @Query('secret') secret: string,
  ): Promise<void> {
    if (secret !== 'somesecret') {
      throw new ForbiddenException('Wront secret');
    }
    return this.appService.handleCallback(allBody);
  }
}
