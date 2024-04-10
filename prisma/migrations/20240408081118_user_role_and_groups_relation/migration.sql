/*
  Warnings:

  - The primary key for the `UserRoles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,roleId,groupId]` on the table `UserRoles` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `UserRoles` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "UserRoles" DROP CONSTRAINT "UserRoles_pkey",
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoles_userId_roleId_groupId_key" ON "UserRoles"("userId", "roleId", "groupId");

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
