/*
  Warnings:

  - You are about to drop the column `cualesAlergias` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `cualesMedicamentos` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Student` DROP COLUMN `cualesAlergias`,
    DROP COLUMN `cualesMedicamentos`;

-- CreateTable
CREATE TABLE `medicamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `medicamentos_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alergias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `alergias_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MedicamentoToStudent` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MedicamentoToStudent_AB_unique`(`A`, `B`),
    INDEX `_MedicamentoToStudent_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AlergiaToStudent` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AlergiaToStudent_AB_unique`(`A`, `B`),
    INDEX `_AlergiaToStudent_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_MedicamentoToStudent` ADD CONSTRAINT `_MedicamentoToStudent_A_fkey` FOREIGN KEY (`A`) REFERENCES `medicamentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MedicamentoToStudent` ADD CONSTRAINT `_MedicamentoToStudent_B_fkey` FOREIGN KEY (`B`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AlergiaToStudent` ADD CONSTRAINT `_AlergiaToStudent_A_fkey` FOREIGN KEY (`A`) REFERENCES `alergias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AlergiaToStudent` ADD CONSTRAINT `_AlergiaToStudent_B_fkey` FOREIGN KEY (`B`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
