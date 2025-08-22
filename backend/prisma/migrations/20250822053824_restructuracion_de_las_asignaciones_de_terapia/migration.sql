/*
  Warnings:

  - You are about to drop the `SessionLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TherapyPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `SessionLog` DROP FOREIGN KEY `SessionLog_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `SessionLog` DROP FOREIGN KEY `SessionLog_therapistId_fkey`;

-- DropForeignKey
ALTER TABLE `SessionLog` DROP FOREIGN KEY `SessionLog_therapyPlanId_fkey`;

-- DropForeignKey
ALTER TABLE `TherapyPlan` DROP FOREIGN KEY `TherapyPlan_leccionId_fkey`;

-- DropForeignKey
ALTER TABLE `TherapyPlan` DROP FOREIGN KEY `TherapyPlan_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `TherapyPlan` DROP FOREIGN KEY `TherapyPlan_therapistId_fkey`;

-- AlterTable
ALTER TABLE `TherapistProfile` ADD COLUMN `lunchEndTime` VARCHAR(191) NOT NULL DEFAULT '13:00',
    ADD COLUMN `lunchStartTime` VARCHAR(191) NOT NULL DEFAULT '12:00',
    ADD COLUMN `workDays` JSON NOT NULL,
    ADD COLUMN `workEndTime` VARCHAR(191) NOT NULL DEFAULT '17:00',
    ADD COLUMN `workStartTime` VARCHAR(191) NOT NULL DEFAULT '08:00';

-- DropTable
DROP TABLE `SessionLog`;

-- DropTable
DROP TABLE `TherapyPlan`;

-- CreateTable
CREATE TABLE `TherapySession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `status` ENUM('Programada', 'Completada', 'Cancelada', 'Ausente') NOT NULL DEFAULT 'Programada',
    `notes` TEXT NULL,
    `behavior` TEXT NULL,
    `progress` TEXT NULL,
    `studentId` INTEGER NOT NULL,
    `therapistId` INTEGER NOT NULL,
    `leccionId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TherapySession` ADD CONSTRAINT `TherapySession_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapySession` ADD CONSTRAINT `TherapySession_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapySession` ADD CONSTRAINT `TherapySession_leccionId_fkey` FOREIGN KEY (`leccionId`) REFERENCES `Leccion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
