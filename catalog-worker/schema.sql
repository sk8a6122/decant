CREATE TABLE catalog (
  lwin TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL,
  display_name TEXT NOT NULL,
  producer TEXT NOT NULL,
  wine TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  sub_region TEXT NOT NULL,
  colour TEXT NOT NULL,
  type TEXT NOT NULL,
  sub_type TEXT NOT NULL,
  vintage_config TEXT NOT NULL,
  first_vintage INTEGER,
  final_vintage INTEGER,
  reference TEXT NOT NULL,
  source_updated TEXT NOT NULL,
  search_text TEXT NOT NULL
);
CREATE VIRTUAL TABLE wine_search USING fts5(search_text, content='catalog', content_rowid='rowid', tokenize='unicode61 remove_diacritics 2', prefix='2 3');
CREATE TABLE search_terms(term TEXT PRIMARY KEY NOT NULL,prefix TEXT NOT NULL,frequency INTEGER NOT NULL);
CREATE INDEX search_terms_prefix ON search_terms(prefix,frequency DESC);
CREATE TABLE catalog_meta(key TEXT PRIMARY KEY NOT NULL,value TEXT NOT NULL);
