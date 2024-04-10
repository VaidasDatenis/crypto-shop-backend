import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { MyLoggerService } from '../my-logger/my-logger.service';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

describe('ItemController', () => {
  let controller: ItemController;
  let service: ItemService;
  let loggerService: MyLoggerService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findAllUserItems: jest.fn(),
            createItemByUser: jest.fn(),
            updateItem: jest.fn(),
            softDeleteItem: jest.fn(),
          },
        },
        {
          provide: MyLoggerService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);
    service = module.get<ItemService>(ItemService);
    loggerService = module.get<MyLoggerService>(MyLoggerService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return all items', async () => {
    const result = [];
    jest.spyOn(service, 'findAll').mockResolvedValue(result);
    expect(await controller.findAll('127.0.0.1')).toBe(result);
  });

  it('should return a single item', async () => {
    const userId = 'user-id';
    const itemId = 'item-id';
    const result = {
      id: itemId,
      title: 'New Item',
      description: 'Item description',
      price: new Prisma.Decimal('10.00'),
      currency: 'USD',
      sellerId: userId,
      images: null,
      groupId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    jest.spyOn(service, 'findOne').mockResolvedValue(result);
    expect(await controller.findOne('1')).toBe(result);
  });

  it('should return all items of a user', async () => {
    const userId = 'test-user-id';
    const walletAddr = '0x000'
    const itemId = 'item-id';
    const result = {
      id: userId,
      walletAddress: walletAddr,
      walletNames: ['metamask'],
      email: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      items: [
        {
          id: itemId,
          title: 'New Item',
          description: 'Item description',
          price: new Prisma.Decimal('10.00'),
          currency: 'USD',
          sellerId: userId,
          images: null,
          groupId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ]
    };
    jest.spyOn(service, 'findAllUserItems').mockResolvedValue(result);
    expect(await controller.findAllUserItems(userId)).toBe(result);
  });

  it('should create an item for a user', async () => {
    const userId = 'test-user-id';
    const itemDto: CreateItemDto = {
      title: 'New Item',
      description: 'Item description',
      price: '10.00',
      currency: 'USD',
      sellerId: userId,
      images: JSON.stringify(["http://example.com/image1.jpg", "http://example.com/image2.jpg"]),
      groupId: null,
    };
    const result = {
      ...itemDto,
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      price: new Prisma.Decimal(itemDto.price),
      images: JSON.parse(itemDto.images),
      groupId: null,
    };
    jest.spyOn(service, 'createItemByUser').mockResolvedValue(result);
    expect(await controller.createItemByUser(userId, itemDto)).toBe(result);
  });

  it('should update an item', async () => {
    const userId = 'test-user-id';
    const itemId = 'test-item-id';
    const updateItemDto: UpdateItemDto = {
      title: 'New Item',
      description: 'Item description',
      price: '10.00',
      currency: 'USD',
      sellerId: userId,
      images: JSON.stringify(["http://example.com/image1.jpg", "http://example.com/image2.jpg"]),
      groupId: null,
    };
    const result = {
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      title: 'New Item',
      description: 'Item description',
      price: new Prisma.Decimal('10.00'),
      currency: 'USD',
      sellerId: userId,
      images: ["http://example.com/image1.jpg", "http://example.com/image2.jpg"],
      groupId: null,
    };
    jest.spyOn(service, 'updateItem').mockResolvedValue(result);
    expect(await controller.updateItem(userId, itemId, updateItemDto)).toBe(result);
  });

  it('should soft delete an item', async () => {
    const itemId = 'test-item-id';
    const userId = 'test-user-id';
    jest.spyOn(service, 'softDeleteItem').mockResolvedValue(undefined);
    await controller.softDeleteItem(itemId, userId);
    expect(service.softDeleteItem).toHaveBeenCalledWith(userId, itemId);
});
});
