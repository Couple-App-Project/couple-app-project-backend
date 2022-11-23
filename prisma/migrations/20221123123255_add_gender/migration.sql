/*
  Warnings:

  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `birthDay` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" TEXT NOT NULL,
ALTER COLUMN "birthDay" SET NOT NULL;
