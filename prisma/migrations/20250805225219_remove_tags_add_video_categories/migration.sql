/*
  Warnings:

  - You are about to drop the `project_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `video_tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."project_tags" DROP CONSTRAINT "project_tags_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."video_tags" DROP CONSTRAINT "video_tags_videoId_fkey";

-- DropTable
DROP TABLE "public"."project_tags";

-- DropTable
DROP TABLE "public"."video_tags";

-- CreateTable
CREATE TABLE "public"."video_categories" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_categories_videoId_categoryId_key" ON "public"."video_categories"("videoId", "categoryId");

-- AddForeignKey
ALTER TABLE "public"."video_categories" ADD CONSTRAINT "video_categories_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."project_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."video_categories" ADD CONSTRAINT "video_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
