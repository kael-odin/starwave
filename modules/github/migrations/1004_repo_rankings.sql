CREATE TABLE repo_rankings (
  period          text NOT NULL,
  as_of           date NOT NULL,
  rank            integer NOT NULL,
  repo_id         bigint NOT NULL REFERENCES repos (id) ON DELETE CASCADE,
  score           numeric(5,2) NOT NULL,
  star_delta      integer,
  star_score      numeric(5,2),
  community_score numeric(5,2),
  editorial_score numeric(5,2),
  activity_score  numeric(5,2),
  reason_zh       text NOT NULL,
  computed_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (period, as_of, repo_id)
);
