import { Injectable } from '@nestjs/common';
import {
  Client,
  Env,
  Currency,
  Models,
  Tokens,
  InvoiceStatus,
} from 'bitpay-sdk';

interface InvoiceWebhookData {
  event: {
    code: number;
    name: 'invoice_confirmed' | string;
  };
  data: Models.Invoice;
}

const PRIVATE_KEY =
  '7f5c9415debc7cb848b393c113e3c4b1983b941dadc2cd10e48aa4f6451b661e';
const CLIENT_ID = 'TfFbbdCNghzt78RVJfcWYQqLgagKmQgqp82';
const MERCHANT_TOKEN = 'C8TmNm1yabN7GTDQeb3jYP8BPz2qmvWKZQ8s2ZW59PTN';
const POS_TOKEN = '4shRinAPohvVRd2n4vXu4h143aea2dDLZw1DEs7eFnzV';

const backendHost = 'https://d21sko.sse.codesandbox.io';
const backendSecret = '123';

export interface AppInvoice {
  id: string;
  url: string;
}

@Injectable()
export class AppService {
  private client: Client;

  constructor() {
    const tokens = Tokens;
    tokens.merchant = MERCHANT_TOKEN;
    this.client = new Client(
      null,
      Env.Test,
      PRIVATE_KEY,
      tokens,
      // {
      //   // [Tokens.merchant]: MERCHANT_TOKEN,
      //   merchant: MERCHANT_TOKEN,
      // },
    );
  }

  root(): string {
    return `Hello World ${new Date().getTime()}!`;
  }

  getClientId(): string {
    return CLIENT_ID;
  }

  async getInvoice(invoiceId: string): Promise<AppInvoice> {
    const invoice = await this.client.GetInvoice(invoiceId);
    return {
      url: invoice.url,
      id: invoice.id,
    };
  }

  async createInvoice(baseUrl: string): Promise<AppInvoice> {
    console.log('aca2');
    const orderId = '123';
    const skuId = '555';
    const price = '12.34';
    const invoiceModel = new Models.Invoice(
      Number.parseInt(price, 10),
      Currency.USD,
    );
    console.log('aca3');
    invoiceModel.posData = JSON.stringify({
      oo: null,
      somedata: 'recover',
      booo: true,
      somedecimal: 1.234,
      nested: { a: 1, b: 2 },
      arr: [1, '2', false, null],
    });
    invoiceModel.orderId = orderId;
    // ToDo: Use userid-orderid in case full text searchs enabled
    invoiceModel.guid = orderId;
    invoiceModel.transactionSpeed = 'medium';
    invoiceModel.extendedNotifications = true;
    invoiceModel.itemDesc = 'item desc';
    invoiceModel.itemCode = skuId;
    // invoiceModel.itemizedDetails = [
    //   {
    //     amount: '12.20',
    //     description: 'price wo fee',
    //     isFee: false,
    //   },
    //   {
    //     amount: '2.70',
    //     description: 'gas fee',
    //     isFee: true,
    //   },
    // ];
    invoiceModel.notificationURL = `${backendHost}/callback?secret=${backendSecret}`;
    invoiceModel.redirectURL = `${baseUrl}/${orderId}`;
    invoiceModel.closeURL = `${baseUrl}/${skuId}`;
    invoiceModel.physical = false;
    invoiceModel.autoRedirect = false;
    invoiceModel.buyer = {
      email: 'gtorterolo@zircon.tech',
      address1: 'add1',
      address2: 'add2',
      name: 'gonza',
      locality: 'SJ',
      country: 'UY',
      notify: false,
      region: 'AM',
      phone: '1234',
      postalCode: '123',
    };
    const invoice = await this.client.CreateInvoice(invoiceModel);
    console.log('aca1');
    return {
      url: invoice.url,
      id: invoice.id,
    };
  }

  async handleCallback(allBody: InvoiceWebhookData) {
    // ToDo: Log/audit/notarize all the incomming events. Only process if latest
    // ToDo: See how to process refunds also.
    console.log(JSON.stringify(allBody));
    const invoice = await this.client.GetInvoice(allBody.data.id);
    if (invoice.status !== allBody.data.status) {
      throw new Error('State out of sync');
    }
    switch (invoice.status) {
      case InvoiceStatus.New:
        console.log('all good');
        break;
      case InvoiceStatus.Confirmed:
      case InvoiceStatus.Complete:
        console.log('all good');
        break;
      case InvoiceStatus.Expired:
      case InvoiceStatus.Invalid:
        throw new Error('bad state');
      case InvoiceStatus.Paid:
        switch (invoice.exceptionStatus) {
          case 'paidPartial':
          case 'paidOver':
            throw new Error('wrong paid amount');
          case 'false':
            console.log('all good');
            break;
          default:
            throw new Error('unknown state');
        }
        break;
      default:
        throw new Error('unknown state');
    }
  }
}
