-- CreateTable
CREATE TABLE `SessionLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `attendance` ENUM('Presente', 'Ausente', 'Justificado') NOT NULL,
    `notes` TEXT NOT NULL,
    `behavior` TEXT NULL,
    `progress` TEXT NULL,
    `studentId` INTEGER NOT NULL,
    `therapistId` INTEGER NOT NULL,
    `therapyPlanId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SessionLog` ADD CONSTRAINT `SessionLog_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionLog` ADD CONSTRAINT `SessionLog_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionLog` ADD CONSTRAINT `SessionLog_therapyPlanId_fkey` FOREIGN KEY (`therapyPlanId`) REFERENCES `TherapyPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
