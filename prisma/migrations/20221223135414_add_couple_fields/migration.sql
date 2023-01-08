/*
  Warnings:

  - You are about to drop the column `startDate` on the `Couple` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Couple" DROP COLUMN "startDate",
ADD COLUMN     "anniversary" TIMESTAMP(3),
ADD COLUMN     "specialPlace" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nickname" TEXT;
