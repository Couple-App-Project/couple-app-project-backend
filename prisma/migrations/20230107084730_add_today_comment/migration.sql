/*
  Warnings:

  - Added the required column `todayComment` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "todayComment" TEXT NOT NULL DEFAULT '';