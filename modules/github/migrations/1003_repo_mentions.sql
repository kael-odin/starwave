CREATE TABLE repo_mentions (
  article_id    text NOT NULL,
  repo_id       bigint NOT NULL REFERENCES repos (id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'mention',
  found_by      text NOT NULL DEFAULT 'url',
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (article_id, repo_id)
);
