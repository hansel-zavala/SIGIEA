/*
  Warnings:

  - You are about to drop the column `generalObservations` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `periodId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the `EvaluationPeriod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportResult` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `templateId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_periodId_fkey`;

-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_therapistId_fkey`;

-- DropForeignKey
ALTER TABLE `ReportActivity` DROP FOREIGN KEY `ReportActivity_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `ReportResult` DROP FOREIGN KEY `ReportResult_activityId_fkey`;

-- DropForeignKey
ALTER TABLE `ReportResult` DROP FOREIGN KEY `ReportResult_reportId_fkey`;

-- DropIndex
DROP INDEX `Report_periodId_fkey` ON `Report`;

-- DropIndex
DROP INDEX `Report_therapistId_fkey` ON `Report`;

-- AlterTable
ALTER TABLE `Report` DROP COLUMN `generalObservations`,
    DROP COLUMN `periodId`,
    ADD COLUMN `summary` TEXT NULL,
    ADD COLUMN `templateId` INTEGER NOT NULL,
    ADD COLUMN `therapyActivities` TEXT NULL,
    MODIFY `reportDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `EvaluationPeriod`;

-- DropTable
DROP TABLE `ReportActivity`;

-- DropTable
DROP TABLE `ReportCategory`;

-- DropTable
DROP TABLE `ReportResult`;

-- CreateTable
CREATE TABLE `ReportTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ReportTemplate_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `templateId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NOT NULL,
    `order` INTEGER NOT NULL,
    `sectionId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportItemAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `level` ENUM('CONSEGUIDO', 'CON_AYUDA_ORAL', 'CON_AYUDA_GESTUAL', 'CON_AYUDA_FISICA', 'NO_CONSEGUIDO', 'NO_TRABAJADO') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ReportItemAnswer_reportId_itemId_key`(`reportId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReportSection` ADD CONSTRAINT `ReportSection_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `ReportTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportItem` ADD CONSTRAINT `ReportItem_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `ReportSection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `ReportTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportItemAnswer` ADD CONSTRAINT `ReportItemAnswer_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportItemAnswer` ADD CONSTRAINT `ReportItemAnswer_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `ReportItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
