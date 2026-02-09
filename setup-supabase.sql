-- =====================================================
-- SETUP DO BANCO (SUPABASE) - CONVITE DE CASAMENTO
--
-- Importante:
-- - Este script cria as tabelas/colunas no mesmo formato esperado pelo app (camelCase).
-- - Se voce preferir, pode usar as migrations do Prisma em vez deste arquivo.
-- =====================================================

-- Util para gerar UUID no seed (gen_random_uuid()).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELA: events
-- =====================================================
CREATE TABLE IF NOT EXISTS "events" (
  "id" TEXT NOT NULL,
  "coupleNames" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "venue" TEXT NOT NULL,
  "venueMapsUrl" TEXT,
  "description" TEXT,
  "pixKey" TEXT,
  "pixKeyType" TEXT,
  "mpConfig" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- TABELA: guests
-- =====================================================
CREATE TABLE IF NOT EXISTS "guests" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "confirmed" BOOLEAN NOT NULL DEFAULT false,
  "guestCount" INTEGER NOT NULL DEFAULT 1,
  "dietaryRestrictions" TEXT,
  "suggestedSong" TEXT,
  "qrCodeToken" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'guests_eventId_fkey'
  ) THEN
    ALTER TABLE "guests"
      ADD CONSTRAINT "guests_eventId_fkey"
      FOREIGN KEY ("eventId") REFERENCES "events"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "guests_qrCodeToken_key" ON "guests"("qrCodeToken");
CREATE INDEX IF NOT EXISTS "idx_guests_eventId" ON "guests"("eventId");
CREATE INDEX IF NOT EXISTS "idx_guests_email" ON "guests"("email");

-- =====================================================
-- TABELA: gifts
-- =====================================================
CREATE TABLE IF NOT EXISTS "gifts" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "totalValue" DECIMAL(10,2) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'available',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gifts_eventId_fkey'
  ) THEN
    ALTER TABLE "gifts"
      ADD CONSTRAINT "gifts_eventId_fkey"
      FOREIGN KEY ("eventId") REFERENCES "events"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_gifts_eventId" ON "gifts"("eventId");
CREATE INDEX IF NOT EXISTS "idx_gifts_status" ON "gifts"("status");

-- =====================================================
-- TABELA: contributions
-- =====================================================
CREATE TABLE IF NOT EXISTS "contributions" (
  "id" TEXT NOT NULL,
  "giftId" TEXT NOT NULL,
  "guestId" TEXT,
  "amount" DECIMAL(10,2) NOT NULL,
  "message" TEXT,
  "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
  "payerName" TEXT NOT NULL,
  "payerEmail" TEXT NOT NULL,
  "payerCPF" TEXT NOT NULL,
  "payerPhone" TEXT,
  "paymentMethod" TEXT NOT NULL,
  "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
  "gatewayId" TEXT NOT NULL,
  "gatewayResponse" JSONB,
  "installments" INTEGER NOT NULL DEFAULT 1,
  "installmentAmount" DECIMAL(10,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contributions_giftId_fkey'
  ) THEN
    ALTER TABLE "contributions"
      ADD CONSTRAINT "contributions_giftId_fkey"
      FOREIGN KEY ("giftId") REFERENCES "gifts"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contributions_guestId_fkey'
  ) THEN
    ALTER TABLE "contributions"
      ADD CONSTRAINT "contributions_guestId_fkey"
      FOREIGN KEY ("guestId") REFERENCES "guests"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_contributions_giftId" ON "contributions"("giftId");
CREATE INDEX IF NOT EXISTS "idx_contributions_guestId" ON "contributions"("guestId");
CREATE INDEX IF NOT EXISTS "idx_contributions_paymentStatus" ON "contributions"("paymentStatus");

-- =====================================================
-- TABELA: contact_messages
-- =====================================================
CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- TABELA: photos
-- =====================================================
CREATE TABLE IF NOT EXISTS "photos" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'gallery',
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- SEED (OPCIONAL)
-- =====================================================
-- Evento padrao (somente se nao existir)
INSERT INTO "events" (
  "id","coupleNames","date","venue","venueMapsUrl","description","createdAt","updatedAt"
)
SELECT
  gen_random_uuid()::text,
  'Raiana & Raphael',
  '2026-05-16T12:00:00.000Z'::timestamp,
  'Rancho do Coutinho, Estrada Sao Jose do Turvo, 2195',
  'https://maps.google.com/?q=Estr.+de+S%C3%A3o+Jos%C3%A9+do+Turvo+-+S%C3%A3o+Luiz+da+Barra,+Barra+do+Pira%C3%AD+-+RJ,+27165-971',
  'Com imensa alegria, convidamos voce para celebrar conosco o inicio da nossa eternidade.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "events");

-- Presentes padrao (somente se nao existir)
WITH ev AS (SELECT "id" FROM "events" LIMIT 1)
INSERT INTO "gifts" (
  "id","eventId","title","description","imageUrl","totalValue","status","createdAt","updatedAt"
)
SELECT
  gen_random_uuid()::text,
  ev."id",
  g."title",
  g."description",
  NULL,
  g."value",
  'available',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM ev
CROSS JOIN (VALUES
  ('Jogo de Panelas', 'Conjunto com 5 pecas antiaderente', 500),
  ('Cafeteira Expresso', 'Maquina de cafe espresso automatica', 800),
  ('Liquidificador', 'Liquidificador de alta potencia', 350),
  ('Ferro de Passar', 'Ferro a vapor com base ceramica', 200),
  ('Maquina de Lavar', 'Lavadora automatica 12kg', 2500),
  ('Geladeira', 'Geladeira frost free duplex 400L', 4000),
  ('Micro-ondas', 'Micro-ondas 30 litros inox', 600),
  ('Batedeira', 'Batedeira planetaria 500W', 400),
  ('Aspirador de Po', 'Aspirador robo com mapeamento', 1200),
  ('Jogo de Cama', 'Kit casal 400 fios algodao egipcio', 350)
) AS g("title","description","value")
WHERE NOT EXISTS (SELECT 1 FROM "gifts");

