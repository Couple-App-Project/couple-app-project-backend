-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_coupleId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE SET NULL ON UPDATE CASCADE;
