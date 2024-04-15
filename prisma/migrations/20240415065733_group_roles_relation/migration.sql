/*
  Warnings:

  - You are about to drop the column `walletNames` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `UserRoles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,roleId]` on the table `UserRoles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UserRoles" DROP CONSTRAINT "UserRoles_groupId_fkey";

-- DropIndex
DROP INDEX "UserRoles_userId_roleId_groupId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "walletNames";

-- AlterTable
ALTER TABLE "UserRoles" DROP COLUMN "groupId";

-- CreateTable
CREATE TABLE "GroupRoles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "GroupRoles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupRoles_userId_roleId_groupId_key" ON "GroupRoles"("userId", "roleId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoles_userId_roleId_key" ON "UserRoles"("userId", "roleId");

-- AddForeignKey
ALTER TABLE "GroupRoles" ADD CONSTRAINT "GroupRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRoles" ADD CONSTRAINT "GroupRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRoles" ADD CONSTRAINT "GroupRoles_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
