/*
  Warnings:

  - You are about to drop the column `fullName` on the `Guardian` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `TherapistProfile` table. All the data in the column will be lost.
  - Added the required column `apellidos` to the `Guardian` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `Guardian` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellidos` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellidos` to the `TherapistProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `TherapistProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Guardian` DROP COLUMN `fullName`,
    ADD COLUMN `apellidos` VARCHAR(191) NOT NULL,
    ADD COLUMN `nombres` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Student` DROP COLUMN `fullName`,
    ADD COLUMN `apellidos` VARCHAR(191) NOT NULL,
    ADD COLUMN `nombres` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `TherapistProfile` DROP COLUMN `fullName`,
    ADD COLUMN `apellidos` VARCHAR(191) NOT NULL,
    ADD COLUMN `nombres` VARCHAR(191) NOT NULL;
