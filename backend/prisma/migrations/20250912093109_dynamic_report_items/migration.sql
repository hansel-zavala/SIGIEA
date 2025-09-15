/*
  Warnings:

  - You are about to drop the column `attendance` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `conclusions` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `recommendations` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `therapyActivities` on the `Report` table. All the data in the column will be lost.
  - Added the required column `label` to the `ReportItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Report` DROP COLUMN `attendance`,
    DROP COLUMN `conclusions`,
    DROP COLUMN `recommendations`,
    DROP COLUMN `summary`,
    DROP COLUMN `therapyActivities`,
    ADD COLUMN `templateVersion` INTEGER NULL;

-- AlterTable
ALTER TABLE `ReportItem` ADD COLUMN `defaultValue` JSON NULL,
    ADD COLUMN `helpText` TEXT NULL,
    ADD COLUMN `key` VARCHAR(191) NULL,
    ADD COLUMN `label` VARCHAR(191) NOT NULL,
    ADD COLUMN `maxLength` INTEGER NULL,
    ADD COLUMN `options` JSON NULL,
    ADD COLUMN `placeholder` VARCHAR(191) NULL,
    ADD COLUMN `required` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `type` ENUM('short_text', 'long_text', 'rich_text', 'number', 'date', 'select', 'multiselect', 'checkbox', 'level') NOT NULL DEFAULT 'long_text',
    ADD COLUMN `width` ENUM('FULL', 'HALF', 'THIRD', 'TWO_THIRDS') NOT NULL DEFAULT 'FULL',
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `ReportItemAnswer` ADD COLUMN `valueJson` JSON NULL,
    MODIFY `level` ENUM('CONSEGUIDO', 'CON_AYUDA_ORAL', 'CON_AYUDA_GESTUAL', 'CON_AYUDA_FISICA', 'NO_CONSEGUIDO', 'NO_TRABAJADO') NULL;

-- AlterTable
ALTER TABLE `ReportSection` ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ReportTemplate` ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `TherapistProfile` MODIFY `workEndTime` VARCHAR(191) NOT NULL DEFAULT '15:00',
    MODIFY `workStartTime` VARCHAR(191) NOT NULL DEFAULT '07:00';

-- CreateIndex
CREATE INDEX `ReportItem_key_idx` ON `ReportItem`(`key`);
