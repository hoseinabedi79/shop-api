import { Injectable } from '@nestjs/common';

export interface AppInfo {
  name: string;
  version: string;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getAbout(): AppInfo {
    return {
      name: 'Shop API',
      version: '1.0',
    };
  }
}
