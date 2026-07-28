-- CreateTable
CREATE TABLE "SubdomainOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subdomain" TEXT NOT NULL,
    "rootDomain" TEXT NOT NULL DEFAULT 'weedkerwing.dev',
    "fullDomain" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "recordType" TEXT NOT NULL DEFAULT 'CNAME',
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "price" REAL NOT NULL DEFAULT 500,
    "currency" TEXT NOT NULL DEFAULT 'RD$',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "cfRecordId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SubdomainOrder_subdomain_key" ON "SubdomainOrder"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "SubdomainOrder_fullDomain_key" ON "SubdomainOrder"("fullDomain");
