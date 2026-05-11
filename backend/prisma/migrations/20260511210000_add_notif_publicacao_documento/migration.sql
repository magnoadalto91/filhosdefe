-- AlterTable
ALTER TABLE "NotificacaoConfig" ADD COLUMN "novaPublicacao" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "NotificacaoConfig" ADD COLUMN "novoDocumento"  BOOLEAN NOT NULL DEFAULT true;
