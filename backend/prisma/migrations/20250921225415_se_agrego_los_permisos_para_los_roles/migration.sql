/*
  Warnings:

  - You are about to alter the column `storagePath` on the `Document` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Document` MODIFY `description` VARCHAR(191) NULL,
    MODIFY `storagePath` VARCHAR(191) NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMIN', 'THERAPIST', 'PARENT') NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE `TherapistPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `therapistId` INTEGER NOT NULL,
    `permission` ENUM('VIEW_STUDENTS', 'EDIT_STUDENTS', 'MANAGE_SESSIONS', 'VIEW_REPORTS', 'CREATE_REPORTS', 'MANAGE_DOCUMENTS') NOT NULL,
    `granted` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TherapistPermission_therapistId_permission_key`(`therapistId`, `permission`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TherapistPermission` ADD CONSTRAINT `TherapistPermission_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
