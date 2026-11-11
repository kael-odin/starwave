CREATE TABLE repo_snapshots (
  repo_id       bigint NOT NULL REFERENCES repos (id) ON DELETE CASCADE,
  captured_on   date NOT NULL,
  stars         integer,
  forks         integer,
  open_issues   integer,
  star_delta    integer,
  PRIMARY KEY (repo_id, captured_on)
);
