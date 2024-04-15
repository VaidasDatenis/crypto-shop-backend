import { Test, TestingModule } from '@nestjs/testing';
import { ItemService } from './item.service';
import { DatabaseService } from '../database/database.service';
import { RolesService } from '../roles/roles.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UpdateItemDto } from './dto/item.dto';
import { GroupsService } from 'src/groups/groups.service';

describe('ItemService', () => {
  let service: ItemService;
  let groupsService: GroupsService;
  let databaseService: DatabaseService;
  let rolesService: RolesService;
  let jwtService: JwtService;

  const mockItemFindMany = jest.fn();
  const mockItemFindUnique = jest.fn();
  const mockItemCreate = jest.fn();
  const mockItemUpdate = jest.fn();
  const mockUserFindUnique = jest.fn();
  const mockIsAdmin = jest.fn();

  beforeEach(() => {
    mockItemFindMany.mockReset().mockResolvedValue([]);
    mockItemFindUnique.mockReset().mockResolvedValue(null);
    mockItemCreate.mockReset().mockResolvedValue(null);
    mockItemUpdate.mockReset().mockResolvedValue(null);
    mockUserFindUnique.mockReset().mockResolvedValue(null);
    mockIsAdmin.mockReset().mockResolvedValue(null);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: DatabaseService,
          useValue: {
            item: {
              findMany: mockItemFindMany,
              findUnique: mockItemFindUnique,
              create: mockItemCreate,
              update: mockItemUpdate,
            },
            user: {
              findUnique: mockUserFindUnique,
            },
            $transaction: jest.fn().mockImplementation(async (transactionCallback) => {
              await transactionCallback();
            }),
          },
        },
        {
          provide: GroupsService,
          useValue: {},
        },
        {
          provide: RolesService,
          useValue: {
            isUserAdmin: mockIsAdmin,
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ItemService>(ItemService);
    groupsService = module.get<GroupsService>(GroupsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    rolesService = module.get<RolesService>(RolesService) as jest.Mocked<RolesService>;
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('findAll', () => {
    it('should return an array of items', async () => {
      const expectedItems = [
        {
          id: '1',
          title: 'Item 1',
          description: 'Description 1',
          images: JSON.stringify([]),
          price: new Prisma.Decimal(10),
          currency: 'USD',
          sellerId: 'sellerId-1',
          groupId: 'groupId-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      mockItemFindMany.mockResolvedValue(expectedItems);
      expect(await service.findAll()).toEqual(expectedItems);
    });
  });

  describe('findOne', () => {
    it('should return a single item', async () => {
      const expectedItem = {
        id: '1',
        title: 'Item 1',
        description: 'Description 1',
        images: JSON.stringify([]),
        price: new Prisma.Decimal(10),
        currency: 'USD',
        sellerId: 'sellerId-1',
        groupId: 'groupId-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockItemFindUnique.mockResolvedValue(expectedItem);
      expect(await service.findOne('1')).toEqual(expectedItem);
    });

    it('should throw NotFoundException if item does not exist', async () => {
      mockItemFindUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllUserItems', () => {
    it('should return all items of a user', async () => {
      const userId = 'test-user-id';
    const walletAddr = '0x000'
    const itemId = 'item-id';
    const result = {
      id: userId,
      walletAddress: walletAddr,
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
      mockUserFindUnique.mockResolvedValue(result);
      expect(await service.findAllUserItems(userId)).toBe(result);
    });

    it('should return an empty array if the user has no items', async () => {
      const userId = 'test-user-id';
      const mockResponse = {
        id: userId,
        walletAddress: '0x000',
        email: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        items: [],
      };
      mockUserFindUnique.mockResolvedValue(mockResponse);
      const result = await service.findAllUserItems(userId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createItemByUser', () => {
    it('should successfully create an item for a user', async () => {
      const userId = 'test-user-id';
      const createItemDto = {
        title: 'New Item',
        description: 'New Item Description',
        price: '100',
        currency: 'USD',
        images: null,
        groupId: null,
        sellerId: userId,
      };
      const expectedItem = {
        ...createItemDto,
        id: 'new-item-id',
        price: new Prisma.Decimal(createItemDto.price),
        sellerId: userId,
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockItemCreate.mockResolvedValue(expectedItem);
      expect(await service.createItemByUser(createItemDto, userId)).toEqual(expectedItem);
    });
  });

  describe('updateItem', () => {
    it('should update an item successfully', async () => {
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
        id: itemId,
        title: 'Original Item',
        description: 'Original description',
        price: new Prisma.Decimal('20.00'),
        currency: 'USD',
        sellerId: userId, // Different from `userId` to simulate unauthorized access
        images: JSON.stringify(["http://example.com/original-image.jpg"]),
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockItemFindUnique.mockResolvedValue(result);
      mockItemUpdate.mockResolvedValue(result);
      expect(await service.updateItem(userId, itemId, updateItemDto)).toBe(result);
    });

    it('should throw UnauthorizedException if user is not the owner or admin', async () => {
      const userId = 'non-owner-user-id';
      const itemId = 'test-item-id';
      const updateItemDto = {
        title: 'New Item',
        description: 'Item description',
        price: '10.00',
        currency: 'USD',
        images: JSON.stringify(["http://example.com/image1.jpg", "http://example.com/image2.jpg"]),
      };
      const mockItem = {
        id: itemId,
        title: 'Original Item',
        description: 'Original description',
        price: new Prisma.Decimal('20.00'),
        currency: 'USD',
        sellerId: 'another-user-id',
        images: JSON.stringify(["http://example.com/original-image.jpg"]),
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockItemFindUnique.mockResolvedValue(mockItem);
      mockIsAdmin.mockResolvedValue(false);
      await expect(service.updateItem(userId, itemId, updateItemDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('softDeleteItem', () => {
    it('should soft delete an item successfully', async () => {
      const userId = 'test-user-id';
      const itemId = 'test-item-id';
      const mockItem = {
        id: itemId,
        title: 'Test Item',
        description: 'Description',
        images: JSON.stringify([]),
        price: new Prisma.Decimal('10.00'),
        currency: 'USD',
        sellerId: userId,
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockItemFindUnique.mockResolvedValue(mockItem);
      mockItemUpdate.mockResolvedValue({
        ...mockItem,
        deletedAt: new Date(), // Simulate deletion date
      });
      await service.softDeleteItem(userId, itemId);
      expect(databaseService.item.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException if user is not authorized to delete the item', async () => {
      const userId = 'test-user-id';
      const itemId = 'test-item-id';
      const mockItem = {
        id: itemId,
        title: 'Test Item',
        description: 'Description',
        images: JSON.stringify([]),
        price: new Prisma.Decimal('10.00'),
        currency: 'USD',
        sellerId: userId,
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockItemFindUnique.mockResolvedValue({
        ...mockItem,
        sellerId: 'another-user-id',
      });
      mockIsAdmin.mockResolvedValue(false);
      await expect(service.softDeleteItem(userId, itemId)).rejects.toThrow(UnauthorizedException);
    });
  });
});
