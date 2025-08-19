/*
  Warnings:

  - The values [ACTIVE,INACTIVE,COMING_SOON] on the enum `ProjectStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProjectStatus_new" AS ENUM ('PUBLISHED', 'UNPUBLISHED');
ALTER TABLE "public"."projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."projects" ALTER COLUMN "status" TYPE "public"."ProjectStatus_new" USING ("status"::text::"public"."ProjectStatus_new");
ALTER TYPE "public"."ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "public"."ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "public"."ProjectStatus_old";
ALTER TABLE "public"."projects" ALTER COLUMN "status" SET DEFAULT 'UNPUBLISHED';
COMMIT;

-- AlterTable
ALTER TABLE "public"."projects" ALTER COLUMN "status" SET DEFAULT 'UNPUBLISHED';
