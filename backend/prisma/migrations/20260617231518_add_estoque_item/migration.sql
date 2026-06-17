-- CreateTable
CREATE TABLE "EstoqueItem" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "precisaRepor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstoqueItem_pkey" PRIMARY KEY ("id")
);
