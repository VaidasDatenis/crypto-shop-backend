import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export function setupHelmet(app: INestApplication): void {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      }
    },
    frameguard: { action: 'deny' },
    hsts: {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
    },
    hidePoweredBy: true,
  }));
}
