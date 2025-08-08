-- CreateTable
CREATE TABLE `TherapyPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayOfWeek` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `therapyTitle` VARCHAR(191) NOT NULL,
    `studentId` INTEGER NOT NULL,
    `therapistId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TherapyPlan` ADD CONSTRAINT `TherapyPlan_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapyPlan` ADD CONSTRAINT `TherapyPlan_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
