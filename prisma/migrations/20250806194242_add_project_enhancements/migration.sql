-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "bountySubmissionUrl" TEXT,
ADD COLUMN     "careerPageUrl" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "isHiring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOpenForBounty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOpenSource" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tagline" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "description" SET DEFAULT '';
