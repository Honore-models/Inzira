-- ============================================================
-- Update institutions to reflect BRD (formerly BDF) and add Youth Fund
-- ============================================================

-- Update BDF references to BRD
UPDATE institutions 
SET 
  title = 'BRD - Development Bank of Rwanda',
  description = 'Loan guarantees for youth and small businesses (formerly BDF)',
  initials = 'BRD',
  details = '{"fullDescription": "The Development Bank of Rwanda (BRD, formerly BDF) provides partial credit guarantees to help small business owners access bank loans. BRD covers up to 50% collateral for general SMEs, and up to 75% for youth and women-owned businesses.", "services": ["Loan guarantees for SMEs", "Youth and women financing (up to 75% collateral coverage)", "Business advisory and coaching", "Loan application support"], "phone": "+250 788 180 300", "email": "info@brd.rw", "hours": "Mon - Fri, 8:00 AM - 5:00 PM", "address": "KK 15 Rd, Kigali"}'::jsonb
WHERE initials = 'BDF';

-- Add Ministry of Youth and Arts if not exists
INSERT INTO institutions (title, description, location, category, initials, logo_bg, details)
SELECT 
  'Ministry of Youth and Arts',
  'Youth Fund single-digit interest loans for youth and artists',
  'Kigali',
  'Loans',
  'MYA',
  '#4a7c63',
  '{"fullDescription": "The Ministry of Youth and Arts offers a fund (2026) for youth and artists with 9% interest loans and 90% collateral guarantee. Loan amounts capped at RWF 10 million.", "services": ["Youth loans at 9% interest", "90% collateral guarantee", "Cooperative group lending", "10% grant bonus for on-time repayment"], "phone": "+250 788 300 000", "email": "info@mya.gov.rw", "hours": "Mon - Fri, 8:00 AM - 5:00 PM", "address": "Kigali"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE initials = 'MYA');
