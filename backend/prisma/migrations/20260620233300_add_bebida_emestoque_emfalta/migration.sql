-- AlterTable
ALTER TABLE "Bebida" ADD COLUMN     "emEstoque" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emFalta" BOOLEAN NOT NULL DEFAULT false;
