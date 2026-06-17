-- CreateTable
CREATE TABLE "PresencaGira" (
    "id" SERIAL NOT NULL,
    "giraId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "confirmado" BOOLEAN NOT NULL,
    "justificativa" TEXT,
    "dataRespondida" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresencaGira_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PresencaGira_giraId_userId_key" ON "PresencaGira"("giraId", "userId");

-- AddForeignKey
ALTER TABLE "PresencaGira" ADD CONSTRAINT "PresencaGira_giraId_fkey" FOREIGN KEY ("giraId") REFERENCES "Gira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresencaGira" ADD CONSTRAINT "PresencaGira_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
