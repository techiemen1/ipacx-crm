/*
  Warnings:

  - You are about to drop the column `status` on the `Warehouse` table. All the data in the column will be lost.
  - You are about to alter the column `quantity` on the `InventoryStock` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to drop the column `batchNo` on the `InventoryBatch` table. All the data in the column will be lost.
  - You are about to drop the column `inwardDate` on the `InventoryBatch` table. All the data in the column will be lost.
  - You are about to drop the column `mfgDate` on the `InventoryBatch` table. All the data in the column will be lost.
  - You are about to alter the column `quantity` on the `InventoryBatch` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to drop the column `description` on the `BillOfMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `brand` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `hsnCode` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to alter the column `currentStock` on the `InventoryItem` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - Added the required column `batchNumber` to the `InventoryBatch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "baseConversion" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UomConversion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromUomId" TEXT NOT NULL,
    "toUomId" TEXT NOT NULL,
    "factor" REAL NOT NULL,
    CONSTRAINT "UomConversion_fromUomId_fkey" FOREIGN KEY ("fromUomId") REFERENCES "UnitOfMeasure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UomConversion_toUomId_fkey" FOREIGN KEY ("toUomId") REFERENCES "UnitOfMeasure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockJournal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referenceNo" TEXT,
    "type" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalId" TEXT,
    "itemId" TEXT NOT NULL,
    "sourceWarehouseId" TEXT,
    "targetWarehouseId" TEXT,
    "batchId" TEXT,
    "quantity" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "StockJournal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_sourceWarehouseId_fkey" FOREIGN KEY ("sourceWarehouseId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_targetWarehouseId_fkey" FOREIGN KEY ("targetWarehouseId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "bomId" TEXT,
    "itemId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Warehouse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "manager" TEXT,
    "capacity" TEXT,
    "parentId" TEXT,
    "isBin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Warehouse_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Warehouse" ("capacity", "createdAt", "id", "location", "manager", "name", "updatedAt") SELECT "capacity", "createdAt", "id", "location", "manager", "name", "updatedAt" FROM "Warehouse";
DROP TABLE "Warehouse";
ALTER TABLE "new_Warehouse" RENAME TO "Warehouse";
CREATE TABLE "new_InventoryStock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "batchId" TEXT,
    "quantity" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryStock_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryStock_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryStock_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "InventoryBatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryStock" ("id", "itemId", "quantity", "updatedAt", "warehouseId") SELECT "id", "itemId", "quantity", "updatedAt", "warehouseId" FROM "InventoryStock";
DROP TABLE "InventoryStock";
ALTER TABLE "new_InventoryStock" RENAME TO "InventoryStock";
CREATE UNIQUE INDEX "InventoryStock_itemId_warehouseId_batchId_key" ON "InventoryStock"("itemId", "warehouseId", "batchId");
CREATE TABLE "new_InventoryBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "batchNumber" TEXT NOT NULL,
    "manufacturingDate" DATETIME,
    "expiryDate" DATETIME,
    "quantity" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryBatch_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryBatch_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryBatch" ("expiryDate", "id", "itemId", "quantity", "updatedAt", "warehouseId") SELECT "expiryDate", "id", "itemId", "quantity", "updatedAt", "warehouseId" FROM "InventoryBatch";
DROP TABLE "InventoryBatch";
ALTER TABLE "new_InventoryBatch" RENAME TO "InventoryBatch";
CREATE UNIQUE INDEX "InventoryBatch_itemId_batchNumber_key" ON "InventoryBatch"("itemId", "batchNumber");
CREATE TABLE "new_BillOfMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    "laborCost" REAL NOT NULL DEFAULT 0,
    "overheadCost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BillOfMaterial_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BillOfMaterial" ("createdAt", "id", "itemId", "laborCost", "name", "overheadCost", "updatedAt") SELECT "createdAt", "id", "itemId", "laborCost", "name", "overheadCost", "updatedAt" FROM "BillOfMaterial";
DROP TABLE "BillOfMaterial";
ALTER TABLE "new_BillOfMaterial" RENAME TO "BillOfMaterial";
CREATE TABLE "new_InventoryGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryGroup_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "InventoryGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryGroup" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "InventoryGroup";
DROP TABLE "InventoryGroup";
ALTER TABLE "new_InventoryGroup" RENAME TO "InventoryGroup";
CREATE TABLE "new_BOMComponent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bomId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT,
    "wastePct" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "BOMComponent_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "BillOfMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BOMComponent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BOMComponent" ("bomId", "id", "itemId", "quantity", "unit", "wastePct") SELECT "bomId", "id", "itemId", "quantity", "unit", "wastePct" FROM "BOMComponent";
DROP TABLE "BOMComponent";
ALTER TABLE "new_BOMComponent" RENAME TO "BOMComponent";
CREATE TABLE "new_InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "description" TEXT,
    "groupId" TEXT,
    "category" TEXT,
    "uomId" TEXT,
    "unit" TEXT,
    "isBatchTracked" BOOLEAN NOT NULL DEFAULT false,
    "isSerialTracked" BOOLEAN NOT NULL DEFAULT false,
    "minLevel" INTEGER DEFAULT 10,
    "maxLevel" INTEGER,
    "reorderLevel" INTEGER,
    "currentStock" REAL NOT NULL DEFAULT 0,
    "lastRestock" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "InventoryGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UnitOfMeasure" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("barcode", "category", "createdAt", "currentStock", "groupId", "id", "lastRestock", "maxLevel", "minLevel", "name", "reorderLevel", "sku", "unit", "updatedAt") SELECT "barcode", "category", "createdAt", "currentStock", "groupId", "id", "lastRestock", "maxLevel", "minLevel", "name", "reorderLevel", "sku", "unit", "updatedAt" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "InventoryItem"("sku");
CREATE UNIQUE INDEX "InventoryItem_barcode_key" ON "InventoryItem"("barcode");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "UomConversion_fromUomId_toUomId_key" ON "UomConversion"("fromUomId", "toUomId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionOrder_orderNumber_key" ON "ProductionOrder"("orderNumber");
