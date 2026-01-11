-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- UserProfile Table
CREATE TABLE IF NOT EXISTS "UserProfile" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    location TEXT,
    bio TEXT,
    title TEXT,
    "portfolioRepo" TEXT,
    "connectedProviders" TEXT, -- JSON string
    "lastSyncLog" TEXT, -- JSON string
    "resumeConfig" TEXT, -- JSON string
    "bioVariations" TEXT, -- JSON string
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Experience Table
CREATE TABLE IF NOT EXISTS "Experience" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    current BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE,
    wins TEXT -- JSON string
);

-- Education Table
CREATE TABLE IF NOT EXISTS "Education" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    degree TEXT NOT NULL,
    school TEXT NOT NULL,
    "graduationDate" TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
);

-- Skill Table
CREATE TABLE IF NOT EXISTS "Skill" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level INTEGER NOT NULL,
    "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
);

-- Publication Table
CREATE TABLE IF NOT EXISTS "Publication" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    publisher TEXT NOT NULL,
    date TEXT NOT NULL,
    link TEXT NOT NULL,
    type TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
);

-- SpeakingEngagement Table
CREATE TABLE IF NOT EXISTS "SpeakingEngagement" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event TEXT NOT NULL,
    date TEXT NOT NULL,
    link TEXT,
    "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
);

-- Win Table
CREATE TABLE IF NOT EXISTS "Win" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    "rawContent" TEXT NOT NULL,
    summary TEXT NOT NULL,
    date TEXT NOT NULL,
    tags TEXT, -- JSON string
    status TEXT NOT NULL,
    "showOnResume" BOOLEAN DEFAULT FALSE,
    "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
);

-- RawActivity Table
CREATE TABLE IF NOT EXISTS "RawActivity" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    "metadataJson" TEXT,
    date TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
);

-- ResumeTemplate Table
CREATE TABLE IF NOT EXISTS "ResumeTemplate" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    "uploadDate" TIMESTAMP NOT NULL DEFAULT NOW(),
    "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
);
