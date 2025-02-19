import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface Body {
  headings: Contents;
  contents: Contents;
  data?: Data;
  include_subscription_ids: string[];
}

export interface Contents {
  en: string;
  ar: string;
}

export interface Data {
  path: string;
  [key: string]: string | Id;
}

@Injectable()
export class NotificationsService {
  async sendNotification(body: Body) {
    await axios.post(
      env('ONE_SIGNAL_API_URL'),
      {
        app_id: env('ONE_SIGNAL_APP_ID'),
        ...body,
      },
      {
        headers: {
          Authorization: env('ONE_SIGNAL_APP_KEY'),
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
