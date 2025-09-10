/*
  Warnings:

  - You are about to drop the column `attendance` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `conclusions` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `recommendations` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `therapyActivities` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Report` DROP COLUMN `attendance`,
    DROP COLUMN `conclusions`,
    DROP COLUMN `recommendations`,
    DROP COLUMN `summary`,
    DROP COLUMN `therapyActivities`;

-- AlterTable
ALTER TABLE `ReportSection` ADD COLUMN `type` ENUM('ITEMS', 'TEXT') NOT NULL DEFAULT 'ITEMS';

-- CreateTable
CREATE TABLE `ReportTextAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `sectionId` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ReportTextAnswer_reportId_sectionId_key`(`reportId`, `sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReportTextAnswer` ADD CONSTRAINT `ReportTextAnswer_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportTextAnswer` ADD CONSTRAINT `ReportTextAnswer_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `ReportSection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
