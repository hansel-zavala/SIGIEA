/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Guardian` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Guardian` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `therapistId` INTEGER NULL;

-- CreateTable
CREATE TABLE `TherapistProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `numero_identidad` VARCHAR(191) NOT NULL,
    `fecha_nacimiento` DATETIME(3) NULL,
    `gender` ENUM('Masculino', 'Femenino') NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `tipo_profesional` ENUM('Psicologo', 'Terapeuta', 'Ambos') NOT NULL,
    `fecha_ingreso` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `copia_identidad_url` VARCHAR(191) NULL,
    `curriculum_url` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TherapistProfile_numero_identidad_key`(`numero_identidad`),
    UNIQUE INDEX `TherapistProfile_email_key`(`email`),
    UNIQUE INDEX `TherapistProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Guardian_userId_key` ON `Guardian`(`userId`);

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Guardian` ADD CONSTRAINT `Guardian_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapistProfile` ADD CONSTRAINT `TherapistProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
