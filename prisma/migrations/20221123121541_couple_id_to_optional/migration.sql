-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_coupleId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "coupleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE SET NULL ON UPDATE CASCADE;
