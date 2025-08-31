-- Setup Supabase Tables for CTV Rollup
-- Run this in your Supabase SQL editor

-- Create new campaign-agnostic tables
CREATE TABLE IF NOT EXISTS campaigns (
  campaign_id   TEXT PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_uploads (
  upload_id     TEXT PRIMARY KEY,
  campaign_id   TEXT NOT NULL REFERENCES campaigns(campaign_id),
  filename      TEXT NOT NULL,
  stored_path   TEXT NOT NULL,
  uploaded_at   TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_content_raw (
  campaign_id          TEXT NOT NULL REFERENCES campaigns(campaign_id),
  campaign_name_src    TEXT,
  content_title        TEXT,
  content_network_name TEXT,
  impression           BIGINT,
  quartile100          BIGINT
);

-- Create content normalization tables (if they don't exist)
CREATE TABLE IF NOT EXISTS content_aliases (
  content_title_canon TEXT NOT NULL,
  content_key         TEXT NOT NULL,
  created_at          TIMESTAMP DEFAULT now(),
  PRIMARY KEY (content_title_canon)
);

-- Note: genre_map table already exists with 10 rows

-- Create views for data processing
CREATE OR REPLACE VIEW campaign_content_clean AS
SELECT 
  campaign_id,
  content_title,
  content_network_name,
  SUM(impression) as total_impressions,
  SUM(quartile100) as total_completes,
  COUNT(*) as row_count
FROM campaign_content_raw
GROUP BY campaign_id, content_title, content_network_name;

CREATE OR REPLACE VIEW campaign_content_norm AS
SELECT 
  cc.campaign_id,
  cc.content_title,
  cc.content_network_name,
  cc.total_impressions,
  cc.total_completes,
  cc.row_count,
  CASE 
    WHEN cc.total_impressions > 0 THEN 
      ROUND(CAST(cc.total_completes AS FLOAT) / cc.total_impressions * 100, 2)
    ELSE 0 
  END as vcr,
  LOWER(TRIM(REGEXP_REPLACE(cc.content_title, '[^a-zA-Z0-9 ]', ''))) as content_title_canon,
  COALESCE(ca.content_key, LOWER(TRIM(REGEXP_REPLACE(cc.content_title, '[^a-zA-Z0-9 ]', '')))) as content_key
FROM campaign_content_clean cc
LEFT JOIN content_aliases ca ON ca.content_title_canon = LOWER(TRIM(REGEXP_REPLACE(cc.content_title, '[^a-zA-Z0-9 ]', '')));

CREATE OR REPLACE VIEW campaign_content_genred AS
SELECT 
  ccn.*,
  COALESCE(gm.genre_canon, 'Unknown') as genre_canon
FROM campaign_content_norm ccn
LEFT JOIN genre_map gm ON gm.raw_genre = ccn.content_network_name;

-- Create rollup views
CREATE OR REPLACE VIEW rr_rollup_app AS
SELECT 
  campaign_id,
  content_network_name as app_name,
  SUM(total_impressions) as impressions,
  SUM(total_completes) as completes,
  ROUND(AVG(vcr), 2) as avg_vcr,
  COUNT(*) as content_count
FROM campaign_content_genred
GROUP BY campaign_id, content_network_name
ORDER BY campaign_id, impressions DESC;

CREATE OR REPLACE VIEW rr_rollup_genre AS
SELECT 
  campaign_id,
  genre_canon,
  SUM(total_impressions) as impressions,
  SUM(total_completes) as completes,
  ROUND(AVG(vcr), 2) as avg_vcr,
  COUNT(*) as content_count
FROM campaign_content_genred
GROUP BY campaign_id, genre_canon
ORDER BY campaign_id, impressions DESC;

CREATE OR REPLACE VIEW rr_rollup_content AS
SELECT 
  campaign_id,
  content_key,
  content_title,
  content_network_name,
  SUM(total_impressions) as impressions,
  SUM(total_completes) as completes,
  ROUND(AVG(vcr), 2) as avg_vcr
FROM campaign_content_genred
GROUP BY campaign_id, content_key, content_title, content_network_name
ORDER BY campaign_id, impressions DESC;

-- Grant permissions (adjust as needed for your Supabase setup)
-- ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaign_uploads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaign_content_raw ENABLE ROW LEVEL SECURITY;
