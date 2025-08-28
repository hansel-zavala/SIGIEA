/*
  Warnings:

  - You are about to drop the column `esAlergico` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `usaMedicamentos` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Student` DROP COLUMN `esAlergico`,
    DROP COLUMN `usaMedicamentos`,
    ADD COLUMN `tipoSangre` ENUM('A_POSITIVO', 'A_NEGATIVO', 'B_POSITIVO', 'B_NEGATIVO', 'AB_POSITIVO', 'AB_NEGATIVO', 'O_POSITIVO', 'O_NEGATIVO') NULL;
