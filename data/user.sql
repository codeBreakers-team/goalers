DROP TABLE IF EXISTS match;
DROP TABLE IF EXISTS account;


CREATE TABLE match (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  homeTeam VARCHAR(255) NOT NULL,
  awayTeam VARCHAR(255) NOT NULL,
  date VARCHAR(255) NOT NULL,
  time VARCHAR(255) NOT NULL
);

CREATE TABLE account (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  psw VARCHAR(255) NOT NULL,
  match_id INTEGER NOT NULL,
  FOREIGN KEY (match_id) REFERENCES match (id)
);
