cd server
bash ./knex.sh migrate:latest
node load_questions.js
