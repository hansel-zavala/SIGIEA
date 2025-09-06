-- CreateTable
CREATE TABLE `EvaluationPeriod` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `therapistId` INTEGER NOT NULL,
    `periodId` INTEGER NOT NULL,
    `reportDate` DATETIME(3) NOT NULL,
    `attendance` VARCHAR(191) NULL,
    `generalObservations` TEXT NULL,
    `conclusions` TEXT NULL,
    `recommendations` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `isTemplate` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ReportCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `isTemplate` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `activityId` INTEGER NOT NULL,
    `grade` ENUM('CONSEGUIDO', 'CON_AYUDA_ORAL', 'CON_AYUDA_GESTUAL', 'CON_AYUDA_FISICA', 'NO_CONSEGUIDO', 'NO_TRABAJADO') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `TherapistProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `EvaluationPeriod`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportActivity` ADD CONSTRAINT `ReportActivity_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ReportCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportResult` ADD CONSTRAINT `ReportResult_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportResult` ADD CONSTRAINT `ReportResult_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `ReportActivity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
