-- CreateTable
CREATE TABLE "evals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eval_ID" TEXT,
    "data_ID" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evals_name_key" ON "evals"("name");
