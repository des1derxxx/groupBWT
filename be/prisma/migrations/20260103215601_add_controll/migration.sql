-- CreateEnum
CREATE TYPE "GalleryRole" AS ENUM ('VIEW_ONLY', 'FULL_ACCESS');

-- CreateTable
CREATE TABLE "GalleryMember" (
    "id" TEXT NOT NULL,
    "role" "GalleryRole" NOT NULL DEFAULT 'VIEW_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,

    CONSTRAINT "GalleryMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryMember_galleryId_idx" ON "GalleryMember"("galleryId");

-- CreateIndex
CREATE INDEX "GalleryMember_userId_idx" ON "GalleryMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryMember_userId_galleryId_key" ON "GalleryMember"("userId", "galleryId");

-- AddForeignKey
ALTER TABLE "GalleryMember" ADD CONSTRAINT "GalleryMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryMember" ADD CONSTRAINT "GalleryMember_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
