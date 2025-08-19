-- CreateTable
CREATE TABLE "public"."video_tags" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_tags_videoId_name_key" ON "public"."video_tags"("videoId", "name");

-- AddForeignKey
ALTER TABLE "public"."video_tags" ADD CONSTRAINT "video_tags_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."project_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
