-- DropIndex
DROP INDEX "Participation_matchId_idx";

-- DropIndex
DROP INDEX "Participation_userId_idx";

-- AlterTable
ALTER TABLE "Participation" ADD COLUMN     "moneyGained" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "moneySpent" INTEGER NOT NULL DEFAULT 0;
