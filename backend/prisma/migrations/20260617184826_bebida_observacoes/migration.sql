/*
  Warnings:

  - You are about to drop the column `ingredientes` on the `Bebida` table. All the data in the column will be lost.
  - You are about to drop the column `preparo` on the `Bebida` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bebida" DROP COLUMN "ingredientes",
DROP COLUMN "preparo",
ADD COLUMN     "observacoes" TEXT;
