/*
  Warnings:

  - You are about to alter the column `storagePath` on the `Document` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Document` MODIFY `description` VARCHAR(191) NULL,
    MODIFY `storagePath` VARCHAR(191) NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
