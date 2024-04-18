import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ethers } from 'ethers';

describe('Connect Functionality', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should authenticate successfully with valid signature', async () => {
    const wallet = ethers.Wallet.createRandom();
    const message = "Please sign this message to confirm your authentication.";
    const messageHash = ethers.utils.hashMessage(message);
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    const response = await request(app.getHttpServer())
      .post('/api/connect')
      .send({
        walletAddress: wallet.address,
        signature: signature
      })
      .expect(200);  // Assuming HTTP 200 indicates success

    expect(response.body).toHaveProperty('access_token');  // Assuming an access token is returned on success
  });

  it('should reject authentication with invalid signature', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/connect')
      .send({
        walletAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
        signature: '0xdeadbeef'
      })
      .expect(403);  // Assuming HTTP 403 indicates rejection

    expect(response.body).toHaveProperty('error');
  });

  afterAll(async () => {
    await app.close();
  });
});
