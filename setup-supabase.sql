-- =====================================================
-- SETUP COMPLETO DO BANCO DE DADOS - CONVITE DE CASAMENTO
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Criar extensão para UUID (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: EVENTS (Dados do casamento)
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_names VARCHAR(200) NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    venue VARCHAR(300) NOT NULL,
    venue_maps_url TEXT,
    description TEXT,
    pix_key VARCHAR(200),
    pix_key_type VARCHAR(50),
    mp_config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: GUESTS (Convidados/RSVP)
-- =====================================================
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    confirmed BOOLEAN DEFAULT false,
    guest_count INTEGER DEFAULT 1,
    dietary_restrictions TEXT,
    suggested_song VARCHAR(200),
    qr_code_token UUID UNIQUE DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: GIFTS (Lista de presentes)
-- =====================================================
CREATE TABLE IF NOT EXISTS gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    total_value DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- available, fulfilled, hidden
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: CONTRIBUTIONS (Contribuições/Cotas)
-- =====================================================
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    message TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    payer_name VARCHAR(200) NOT NULL,
    payer_email VARCHAR(200) NOT NULL,
    payer_cpf VARCHAR(200) NOT NULL, -- Encriptado
    payer_phone VARCHAR(20),
    payment_method VARCHAR(50) DEFAULT 'pix', -- pix, credit_card, boleto
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, cancelled, refunded
    gateway_id VARCHAR(200),
    gateway_response JSONB,
    installments INTEGER DEFAULT 1,
    installment_amount DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: CONTACT_MESSAGES (Mensagens de contato)
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_gifts_event_id ON gifts(event_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_contributions_gift_id ON contributions(gift_id);
CREATE INDEX IF NOT EXISTS idx_contributions_guest_id ON contributions(guest_id);
CREATE INDEX IF NOT EXISTS idx_contributions_payment_status ON contributions(payment_status);

-- =====================================================
-- TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gifts_updated_at ON gifts;
CREATE TRIGGER update_gifts_updated_at BEFORE UPDATE ON gifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contributions_updated_at ON contributions;
CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED: DADOS INICIAIS
-- =====================================================

-- Inserir evento do casamento
INSERT INTO events (couple_names, date, venue, venue_maps_url, description)
VALUES (
    'Raiana & Raphael',
    '2026-05-16 12:00:00+00',
    'Rancho do Coutinho, Estrada Sao Jose do Turvo, 2195',
    'https://maps.google.com/?q=Estr.+de+São+José+do+Turvo+-+São+Luiz+da+Barra,+Barra+do+Piraí+-+RJ,+27165-971',
    'Com grande alegria, convidamos você para celebrar conosco este momento especial! A cerimônia e a recepção serão no mesmo local.'
)
ON CONFLICT DO NOTHING;

-- Inserir presentes
WITH event AS (SELECT id FROM events LIMIT 1)
INSERT INTO gifts (event_id, title, description, total_value, status)
SELECT 
    event.id,
    gift.title,
    gift.description,
    gift.value,
    'available'
FROM event
CROSS JOIN (VALUES 
    ('Jogo de Panelas', 'Conjunto com 5 peças antiaderente', 500),
    ('Cafeteira Expresso', 'Máquina de café espresso automática', 800),
    ('Liquidificador', 'Liquidificador de alta potência', 350),
    ('Ferro de Passar', 'Ferro a vapor com base cerâmica', 200),
    ('Máquina de Lavar', 'Lavadora automática 12kg', 2500),
    ('Geladeira', 'Geladeira frost free duplex 400L', 4000),
    ('Micro-ondas', 'Micro-ondas 30 litros inox', 600),
    ('Batedeira', 'Batedeira planetária 500W', 400),
    ('Aspirador de Pó', 'Aspirador robô com mapeamento', 1200),
    ('Jogo de Cama', 'Kit casal 400 fios algodão egípcio', 350)
) AS gift(title, description, value)
WHERE NOT EXISTS (SELECT 1 FROM gifts LIMIT 1);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT 'TABELAS CRIADAS:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT 'EVENTO CRIADO:' as info, couple_names, date::date, venue FROM events;

SELECT 'PRESENTES CRIADOS:' as info, COUNT(*) as total FROM gifts;
SELECT title, total_value::numeric::int, status FROM gifts ORDER BY created_at;
