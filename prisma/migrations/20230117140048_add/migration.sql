/*
  Warnings:

  - You are about to drop the column `color` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `mood` on the `Calendar` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `Calendar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Calendar" DROP COLUMN "color",
DROP COLUMN "date",
DROP COLUMN "mood",
ADD COLUMN     "endDate" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "startDate" TEXT NOT NULL;
