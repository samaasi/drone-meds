-- CreateTable
CREATE TABLE "Drone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serialNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "weightLimit" REAL NOT NULL,
    "batteryCapacity" REAL NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Drone_serialNumber_key" ON "Drone"("serialNumber");
