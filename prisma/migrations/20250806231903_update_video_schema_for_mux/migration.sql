/*
  Warnings:

  - You are about to drop the column `duration` on the `project_videos` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `project_videos` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `project_videos` table. All the data in the column will be lost.
  - You are about to drop the `video_categories` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[playbackId]` on the table `project_videos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `playbackId` to the `project_videos` table without a default value. This is not possible if the table is not empty.

*/
-- Clear existing video data first to avoid migration issues
DELETE FROM "public"."video_categories";
DELETE FROM "public"."project_videos";

-- DropForeignKey
ALTER TABLE "public"."video_categories" DROP CONSTRAINT "video_categories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."video_categories" DROP CONSTRAINT "video_categories_videoId_fkey";

-- AlterTable
ALTER TABLE "public"."project_videos" DROP COLUMN "duration",
DROP COLUMN "order",
DROP COLUMN "videoUrl",
ADD COLUMN     "playbackId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."video_categories";

-- CreateIndex
CREATE UNIQUE INDEX "project_videos_playbackId_key" ON "public"."project_videos"("playbackId");
