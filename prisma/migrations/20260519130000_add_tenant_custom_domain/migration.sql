-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "customDomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");

-- CreateIndex (Product performance indexes)
CREATE INDEX "Product_tenantId_active_idx" ON "Product"("tenantId", "active");
CREATE INDEX "Product_tenantId_categoryId_idx" ON "Product"("tenantId", "categoryId");
CREATE INDEX "Product_tenantId_createdAt_idx" ON "Product"("tenantId", "createdAt" DESC);
CREATE INDEX "Product_tenantId_featured_idx" ON "Product"("tenantId", "featured");
