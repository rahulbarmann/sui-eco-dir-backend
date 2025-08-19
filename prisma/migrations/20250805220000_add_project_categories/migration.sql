-- CreateProjectCategoryTable
CREATE TABLE "project_categories" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_categories_projectId_categoryId_key" ON "project_categories"("projectId", "categoryId");

-- AddForeignKey
ALTER TABLE "project_categories" ADD CONSTRAINT "project_categories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_categories" ADD CONSTRAINT "project_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data from categoryId to project_categories
INSERT INTO "project_categories" ("id", "projectId", "categoryId", "createdAt")
SELECT 
    gen_random_uuid()::text,
    "id",
    "categoryId",
    "createdAt"
FROM "projects"
WHERE "categoryId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_categoryId_fkey";

-- DropColumn
ALTER TABLE "projects" DROP COLUMN "categoryId"; 