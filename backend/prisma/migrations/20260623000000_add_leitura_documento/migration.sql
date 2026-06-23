-- CreateTable
CREATE TABLE "LeituraDocumento" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "documentoId" INTEGER NOT NULL,
    "lidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeituraDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeituraDocumento_userId_documentoId_key" ON "LeituraDocumento"("userId", "documentoId");

-- AddForeignKey
ALTER TABLE "LeituraDocumento" ADD CONSTRAINT "LeituraDocumento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeituraDocumento" ADD CONSTRAINT "LeituraDocumento_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "Documento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
