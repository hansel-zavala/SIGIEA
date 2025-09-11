/*
  Warnings:

  - You are about to drop the column `institucionProcedencia` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Guardian` ADD COLUMN `parentescoEspecifico` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Student` DROP COLUMN `institucionProcedencia`,
    ADD COLUMN `referenciaMedica` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `TipoParentesco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TipoParentesco_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
