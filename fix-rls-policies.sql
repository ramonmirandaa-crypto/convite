-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO DAS POLÍTICAS RLS (SUPABASE)
-- =====================================================

-- 1. Verificar se RLS está ativado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('events', 'gifts', 'contributions', 'guests', 'contact_messages', 'photos');

-- 2. Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('events', 'gifts', 'contributions', 'guests', 'contact_messages', 'photos');

-- =====================================================
-- CORREÇÃO: Desativar RLS para permitir acesso via Service Role
-- =====================================================

-- Desativar RLS nas tabelas (o service role já bypassa por padrão,
-- mas se houver políticas mal configuradas, isso resolve)
ALTER TABLE IF EXISTS "events" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "gifts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "contributions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "guests" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "contact_messages" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "photos" DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- ALTERNATIVA: Se quiser manter RLS ativo, criar políticas permissivas
-- =====================================================

-- Reativar RLS (opcional - só execute se quiser RLS ativo)
-- ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "gifts" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "contributions" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "guests" ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações pelo service role
-- CREATE POLICY "Enable all for service role" ON "events" FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Enable all for service role" ON "gifts" FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Enable all for service role" ON "contributions" FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Enable all for service role" ON "guests" FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar status após correção
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('events', 'gifts', 'contributions', 'guests', 'contact_messages', 'photos');
