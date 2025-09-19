/*
  Warnings:

  - A unique constraint covering the columns `[studentId,therapistId,templateId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Report_studentId_therapistId_templateId_key` ON `Report`(`studentId`, `therapistId`, `templateId`);
