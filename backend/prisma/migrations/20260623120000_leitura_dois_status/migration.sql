-- Rename lidoEm to aberturaEm
ALTER TABLE "LeituraDocumento" RENAME COLUMN "lidoEm" TO "aberturaEm";

-- Add concluidoEm (nullable)
ALTER TABLE "LeituraDocumento" ADD COLUMN "concluidoEm" TIMESTAMP(3);
