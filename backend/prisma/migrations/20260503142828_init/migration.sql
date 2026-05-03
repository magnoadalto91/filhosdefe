-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Musica" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "letra" TEXT NOT NULL,
    "youtubeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Musica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Erva" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "usos" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "noQuintal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Erva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entidade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "historia" TEXT NOT NULL,
    "saudacao" TEXT NOT NULL,
    "coresVelas" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rotina" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rotina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gira" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "instrucoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntidadeMusica" (
    "entidadeId" INTEGER NOT NULL,
    "musicaId" INTEGER NOT NULL,

    CONSTRAINT "EntidadeMusica_pkey" PRIMARY KEY ("entidadeId","musicaId")
);

-- CreateTable
CREATE TABLE "EntidadeErva" (
    "entidadeId" INTEGER NOT NULL,
    "ervaId" INTEGER NOT NULL,

    CONSTRAINT "EntidadeErva_pkey" PRIMARY KEY ("entidadeId","ervaId")
);

-- CreateTable
CREATE TABLE "GiraEntidade" (
    "giraId" INTEGER NOT NULL,
    "entidadeId" INTEGER NOT NULL,

    CONSTRAINT "GiraEntidade_pkey" PRIMARY KEY ("giraId","entidadeId")
);

-- CreateTable
CREATE TABLE "GiraMusica" (
    "giraId" INTEGER NOT NULL,
    "musicaId" INTEGER NOT NULL,

    CONSTRAINT "GiraMusica_pkey" PRIMARY KEY ("giraId","musicaId")
);

-- CreateTable
CREATE TABLE "GiraRotina" (
    "giraId" INTEGER NOT NULL,
    "rotinaId" INTEGER NOT NULL,

    CONSTRAINT "GiraRotina_pkey" PRIMARY KEY ("giraId","rotinaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "EntidadeMusica" ADD CONSTRAINT "EntidadeMusica_entidadeId_fkey" FOREIGN KEY ("entidadeId") REFERENCES "Entidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntidadeMusica" ADD CONSTRAINT "EntidadeMusica_musicaId_fkey" FOREIGN KEY ("musicaId") REFERENCES "Musica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntidadeErva" ADD CONSTRAINT "EntidadeErva_entidadeId_fkey" FOREIGN KEY ("entidadeId") REFERENCES "Entidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntidadeErva" ADD CONSTRAINT "EntidadeErva_ervaId_fkey" FOREIGN KEY ("ervaId") REFERENCES "Erva"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiraEntidade" ADD CONSTRAINT "GiraEntidade_giraId_fkey" FOREIGN KEY ("giraId") REFERENCES "Gira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiraEntidade" ADD CONSTRAINT "GiraEntidade_entidadeId_fkey" FOREIGN KEY ("entidadeId") REFERENCES "Entidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiraMusica" ADD CONSTRAINT "GiraMusica_giraId_fkey" FOREIGN KEY ("giraId") REFERENCES "Gira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiraMusica" ADD CONSTRAINT "GiraMusica_musicaId_fkey" FOREIGN KEY ("musicaId") REFERENCES "Musica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiraRotina" ADD CONSTRAINT "GiraRotina_giraId_fkey" FOREIGN KEY ("giraId") REFERENCES "Gira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiraRotina" ADD CONSTRAINT "GiraRotina_rotinaId_fkey" FOREIGN KEY ("rotinaId") REFERENCES "Rotina"("id") ON DELETE CASCADE ON UPDATE CASCADE;
