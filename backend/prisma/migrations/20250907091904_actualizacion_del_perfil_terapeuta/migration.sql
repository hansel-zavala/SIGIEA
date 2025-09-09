/*
  Warnings:

  - You are about to alter the column `tipo_profesional` on the `TherapistProfile` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `TherapistProfile` ADD COLUMN `direccion` VARCHAR(191) NULL,
    ADD COLUMN `lugarNacimiento` VARCHAR(191) NULL,
    MODIFY `tipo_profesional` VARCHAR(191) NOT NULL;
