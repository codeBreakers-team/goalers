DROP TABLE IF EXISTS account;

CREATE TABLE account (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  psw VARCHAR(255) NOT NULL
);

INSERT INTO account (username, email, psw) VALUES (
  'Menna',
  'menna@gmail.com',
  'menna'
);

