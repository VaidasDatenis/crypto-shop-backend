"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let ItemService = class ItemService {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async create(createItemDto) {
        return this.databaseService.item.create({
            data: createItemDto
        });
    }
    async findAll() {
        return this.databaseService.item.findMany();
    }
    async findOne(id) {
        return this.databaseService.item.findUnique({
            where: {
                id,
            }
        });
    }
    async update(id, updateItemDto) {
        const sellerData = updateItemDto?.seller;
        return this.databaseService.item.update({
            where: {
                id,
            },
            data: updateItemDto
        });
    }
    async remove(id) {
        return this.databaseService.item.delete({
            where: {
                id,
            }
        });
    }
};
exports.ItemService = ItemService;
exports.ItemService = ItemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ItemService);
//# sourceMappingURL=item.service.js.map