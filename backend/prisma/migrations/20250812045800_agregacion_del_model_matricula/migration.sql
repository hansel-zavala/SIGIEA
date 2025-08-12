/*
  Warnings:

  - You are about to drop the column `diagnosis` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `supportLevel` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Student` DROP COLUMN `diagnosis`,
    DROP COLUMN `supportLevel`,
    ADD COLUMN `atencionDistancia` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `atencionGrupal` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `atencionIndividual` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `atencionPrevocacional` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `atencionVocacional` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `año_ingreso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `cualesAlergias` VARCHAR(191) NULL,
    ADD COLUMN `cualesMedicamentos` VARCHAR(191) NULL,
    ADD COLUMN `direccion` VARCHAR(191) NULL,
    ADD COLUMN `educacionFisica` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `esAlergico` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `genero` ENUM('Masculino', 'Femenino') NULL,
    ADD COLUMN `inclusionEscolar` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `institucionProcedencia` VARCHAR(191) NULL,
    ADD COLUMN `institutoIncluido` VARCHAR(191) NULL,
    ADD COLUMN `jornada` ENUM('Matutina', 'Vespertina') NULL,
    ADD COLUMN `lugarNacimiento` VARCHAR(191) NULL,
    ADD COLUMN `partidaNacimientoUrl` VARCHAR(191) NULL,
    ADD COLUMN `recibioEvaluacion` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `resultadoEvaluacionUrl` VARCHAR(191) NULL,
    ADD COLUMN `terapiaDomicilio` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `usaMedicamentos` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `zona` ENUM('Rural', 'Urbano') NULL;

-- CreateTable
CREATE TABLE `Guardian` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `direccionEmergencia` VARCHAR(191) NULL,
    `numeroIdentidad` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `parentesco` ENUM('Padre', 'Madre', 'Tutor_Legal', 'Otro') NOT NULL,
    `copiaIdentidadUrl` VARCHAR(191) NULL,
    `observaciones` TEXT NULL,
    `studentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Guardian_numeroIdentidad_key`(`numeroIdentidad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Guardian` ADD CONSTRAINT `Guardian_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
