/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scoreAwayTeam" TEXT,
ADD COLUMN     "scoreHomeTeam" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "venue" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Match_externalId_key" ON "Match"("externalId");

-- CreateIndex
CREATE INDEX "Match_externalId_idx" ON "Match"("externalId");
