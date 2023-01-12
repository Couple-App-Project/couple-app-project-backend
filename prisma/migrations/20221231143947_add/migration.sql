/*
  Warnings:

  - You are about to drop the column `startDate` on the `Couple` table. All the data in the column will be lost.
  - Added the required column `date` to the `Calendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Calendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Calendar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Couple" DROP COLUMN "startDate",
ADD COLUMN     "anniversary" TEXT,
ADD COLUMN     "specialPlace" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
