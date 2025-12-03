/*
  Warnings:

  - Added the required column `userId` to the `Galleries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Galleries" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Galleries" ADD CONSTRAINT "Galleries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
