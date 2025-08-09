/*
  Warnings:

  - You are about to drop the column `therapyTitle` on the `TherapyPlan` table. All the data in the column will be lost.
  - Added the required column `leccionId` to the `TherapyPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TherapyPlan` DROP COLUMN `therapyTitle`,
    ADD COLUMN `leccionId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Leccion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `objective` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `keySkill` VARCHAR(191) NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TherapyPlan` ADD CONSTRAINT `TherapyPlan_leccionId_fkey` FOREIGN KEY (`leccionId`) REFERENCES `Leccion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Leccion` ADD CONSTRAINT `Leccion_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
