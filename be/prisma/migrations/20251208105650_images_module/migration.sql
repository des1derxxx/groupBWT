-- CreateTable
CREATE TABLE "Images" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "galleryId" TEXT NOT NULL,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Galleries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
