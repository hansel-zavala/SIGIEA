-- CreateTable
CREATE TABLE `Document` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ownerType` ENUM('STUDENT', 'THERAPIST', 'GUARDIAN', 'MISC') NOT NULL,
  `ownerId` INT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(191) NULL,
  `fileName` VARCHAR(191) NOT NULL,
  `mimeType` VARCHAR(191) NOT NULL,
  `size` INT NOT NULL,
  `storagePath` VARCHAR(255) NOT NULL,
  `uploadedBy` INT NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `Document_ownerType_ownerId_idx`(`ownerType`, `ownerId`),
  INDEX `Document_category_idx`(`category`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Document_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
