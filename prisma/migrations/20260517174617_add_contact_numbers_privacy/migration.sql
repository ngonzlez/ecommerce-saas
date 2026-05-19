-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "privacyPolicy" TEXT;

-- CreateTable
CREATE TABLE "ContactNumber" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContactNumber_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContactNumber" ADD CONSTRAINT "ContactNumber_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
