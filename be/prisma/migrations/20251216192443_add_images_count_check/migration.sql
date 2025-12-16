ALTER TABLE "Galleries"
ADD CONSTRAINT "images_count_non_negative"
CHECK ("imagesCount" >= 0);