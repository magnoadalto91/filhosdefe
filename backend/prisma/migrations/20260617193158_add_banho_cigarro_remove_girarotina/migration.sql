/*
  Warnings:

  - You are about to drop the `GiraRotina` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GiraRotina" DROP CONSTRAINT "GiraRotina_giraId_fkey";

-- DropForeignKey
ALTER TABLE "GiraRotina" DROP CONSTRAINT "GiraRotina_rotinaId_fkey";

-- DropTable
DROP TABLE "GiraRotina";

-- CreateTable
CREATE TABLE "Banho" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ingredientes" TEXT,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cigarro" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "observacoes" TEXT,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cigarro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiraBanho" (
    "giraId" INTEGER NOT NULL,
    "banhoId" INTEGER NOT NULL,

    CONSTRAINT "GiraBanho_pkey" PRIMARY KEY ("giraId","banhoId")
);

-- AddForeignKey
ALTER TABLE "GiraBanho" ADD CONSTRAINT "GiraBanho_giraId_fkey" FOREIGN KEY ("giraId") REFERENCES "Gira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiraBanho" ADD CONSTRAINT "GiraBanho_banhoId_fkey" FOREIGN KEY ("banhoId") REFERENCES "Banho"("id") ON DELETE CASCADE ON UPDATE CASCADE;
