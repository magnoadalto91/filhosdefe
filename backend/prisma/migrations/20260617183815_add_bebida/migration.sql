-- AlterTable
ALTER TABLE "NotificacaoConfig" ADD COLUMN     "novaBebida" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Bebida" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ingredientes" TEXT NOT NULL,
    "preparo" TEXT,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bebida_pkey" PRIMARY KEY ("id")
);
