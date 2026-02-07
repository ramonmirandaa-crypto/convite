-- Seed data para convite de casamento
-- Execute este SQL no Supabase SQL Editor

-- Criar evento
INSERT INTO events (
    id,
    couple_names,
    date,
    venue,
    venue_maps_url,
    description,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Ana & Pedro',
    '2025-12-15 16:00:00+00',
    'Igreja Matriz de São Paulo',
    'https://maps.google.com/?q=Igreja+Matriz+São+Paulo',
    'Com grande alegria, convidamos você para celebrar conosco este momento especial! Após a cerimônia, a recepção será no Salão de Festas Central.',
    NOW(),
    NOW()
) RETURNING id;

-- O ID do evento será usado nos inserts abaixo
-- Substitua EVENT_ID pelo UUID gerado acima

-- Criar presentes
INSERT INTO gifts (id, event_id, title, description, image_url, total_value, status, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM events LIMIT 1), 'Jogo de Panelas', 'Conjunto com 5 peças antiaderente', NULL, 500, 'available', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM events LIMIT 1), 'Cafeteira Expresso', 'Máquina de café espresso automática', NULL, 800, 'available', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM events LIMIT 1), 'Liquidificador', 'Liquidificador de alta potência', NULL, 350, 'available', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM events LIMIT 1), 'Ferro de Passar', 'Ferro a vapor com base cerâmica', NULL, 200, 'available', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM events LIMIT 1), 'Máquina de Lavar', 'Lavadora automática 12kg', NULL, 2500, 'available', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM events LIMIT 1), 'Geladeira', 'Geladeira frost free duplex 400L', NULL, 4000, 'available', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM events LIMIT 1), 'Micro-ondas', 'Micro-ondas 30 litros inox', NULL, 600, 'available', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM events LIMIT 1), 'Batedeira', 'Batedeira planetária 500W', NULL, 400, 'available', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM events LIMIT 1), 'Aspirador de Pó', 'Aspirador robô com mapeamento', NULL, 1200, 'available', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM events LIMIT 1), 'Jogo de Cama', 'Kit casal 400 fios algodão egípcio', NULL, 350, 'available', NOW(), NOW());

-- Verificar dados inseridos
SELECT 'Evento criado:' as info, couple_names, date, venue FROM events;
SELECT 'Presentes criados:' as info, COUNT(*) as total FROM gifts;
SELECT title, total_value, status FROM gifts ORDER BY created_at;
