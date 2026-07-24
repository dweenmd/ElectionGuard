-- CreateEnum
CREATE TYPE "Role" AS ENUM ('voter', 'candidate', 'admin');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nidHash" TEXT NOT NULL,
    "nidEncrypted" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'voter',
    "party" TEXT,
    "constituencyId" TEXT NOT NULL,
    "constituencyName" TEXT NOT NULL,
    "faceDescriptorEncrypted" TEXT,
    "fingerprintHashEncrypted" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateMeta" (
    "id" INTEGER NOT NULL,
    "icon" TEXT,
    "manifesto" TEXT,
    "constituencyName" TEXT,
    "extra" JSONB,

    CONSTRAINT "CandidateMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "txHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoteRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedPost" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grievance" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "voterName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grievance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollingCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "constituencyName" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "PollingCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurnoutConstituency" (
    "constituencyId" TEXT NOT NULL,
    "constituencyName" TEXT NOT NULL,
    "registered" INTEGER NOT NULL,
    "voted" INTEGER NOT NULL,

    CONSTRAINT "TurnoutConstituency_pkey" PRIMARY KEY ("constituencyId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectionStatus" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "stateIndex" INTEGER NOT NULL,

    CONSTRAINT "ElectionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebauthnCredential" (
    "id" TEXT NOT NULL,
    "nidHash" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebauthnCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nidHash_key" ON "User"("nidHash");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "VoteRecord_userId_key" ON "VoteRecord"("userId");

-- CreateIndex
CREATE INDEX "VoteRecord_candidateId_idx" ON "VoteRecord"("candidateId");

-- CreateIndex
CREATE INDEX "FeedPost_constituencyId_idx" ON "FeedPost"("constituencyId");

-- CreateIndex
CREATE INDEX "Grievance_voterId_idx" ON "Grievance"("voterId");

-- CreateIndex
CREATE INDEX "PollingCenter_constituencyId_idx" ON "PollingCenter"("constituencyId");

-- CreateIndex
CREATE UNIQUE INDEX "WebauthnCredential_credentialID_key" ON "WebauthnCredential"("credentialID");

-- CreateIndex
CREATE INDEX "WebauthnCredential_nidHash_idx" ON "WebauthnCredential"("nidHash");
