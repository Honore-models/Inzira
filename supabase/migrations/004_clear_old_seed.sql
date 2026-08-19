-- ============================================================
-- Clear old seed data and prepare for verified government docs
-- ============================================================

-- Delete existing chunks (foreign key will cascade)
DELETE FROM document_chunks;

-- Delete existing documents
DELETE FROM documents;

-- Reset the document_chunks sequence if using serial IDs
-- (UUID columns don't need this, but being safe)
