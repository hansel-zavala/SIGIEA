/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `TherapyPlan` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `TherapyPlan` table. All the data in the column will be lost.
  - Added the required column `daysOfWeek` to the `TherapyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `TherapyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `TherapyPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TherapyPlan` DROP COLUMN `dayOfWeek`,
    DROP COLUMN `time`,
    ADD COLUMN `daysOfWeek` JSON NOT NULL,
    ADD COLUMN `duration` INTEGER NOT NULL,
    ADD COLUMN `startTime` VARCHAR(191) NOT NULL;
