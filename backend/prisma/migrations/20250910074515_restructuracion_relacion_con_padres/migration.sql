/*
  Warnings:

  - You are about to drop the column `studentId` on the `Guardian` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Guardian` DROP FOREIGN KEY `Guardian_studentId_fkey`;

-- DropIndex
DROP INDEX `Guardian_studentId_fkey` ON `Guardian`;

-- AlterTable
ALTER TABLE `Guardian` DROP COLUMN `studentId`;

-- CreateTable
CREATE TABLE `_GuardianToStudent` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GuardianToStudent_AB_unique`(`A`, `B`),
    INDEX `_GuardianToStudent_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_GuardianToStudent` ADD CONSTRAINT `_GuardianToStudent_A_fkey` FOREIGN KEY (`A`) REFERENCES `Guardian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GuardianToStudent` ADD CONSTRAINT `_GuardianToStudent_B_fkey` FOREIGN KEY (`B`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
