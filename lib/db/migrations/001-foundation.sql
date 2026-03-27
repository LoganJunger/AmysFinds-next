-- Amy's Finds — Foundation Schema
-- Run this against your Neon database to set up all tables

CREATE TABLE IF NOT EXISTS inventory_items (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  price_range     VARCHAR(100),
  refinishing_tips TEXT,
  posting_details  TEXT,
  condition_notes  TEXT,
  key_features     JSONB DEFAULT '[]',
  image_url       TEXT NOT NULL,
  image_blob_url  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  active          BOOLEAN DEFAULT TRUE,
  sold            BOOLEAN DEFAULT FALSE,
  sold_at         TIMESTAMPTZ,
  view_count      INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items (active);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sold ON inventory_items (sold);
CREATE INDEX IF NOT EXISTS idx_inventory_items_created_at ON inventory_items (created_at DESC);

CREATE TABLE IF NOT EXISTS inquiries (
  id         SERIAL PRIMARY KEY,
  item_id    INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  name       VARCHAR(200) NOT NULL,
  email      VARCHAR(254) NOT NULL,
  phone      VARCHAR(30),
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_item_id ON inquiries (item_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_read ON inquiries (read);
