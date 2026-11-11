CREATE TABLE repo_editorial (
  repo_id         bigint PRIMARY KEY REFERENCES repos (id) ON DELETE CASCADE,
  verdict_zh      text,
  use_cases_zh    text,
  risks_zh        text,
  requirements_zh text
);
