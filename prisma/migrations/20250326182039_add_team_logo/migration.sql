/*
  Warnings:

  - Added the required column `establishedYear` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Team_shortName_key";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "establishedYear" INTEGER NOT NULL,
ALTER COLUMN "logoUrl" DROP NOT NULL;
