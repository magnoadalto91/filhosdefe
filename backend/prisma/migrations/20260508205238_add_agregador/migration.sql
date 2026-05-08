-- AlterTable
ALTER TABLE "Musica" ADD COLUMN     "agregadorId" INTEGER;

-- CreateTable
CREATE TABLE "Agregador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agregador_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Musica" ADD CONSTRAINT "Musica_agregadorId_fkey" FOREIGN KEY ("agregadorId") REFERENCES "Agregador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
