# ADGM Corporate Agent — Take-home (with local RAG)

## Setup

1. Open terminal and go to backend:
cd backend

2. Install dependencies:
npm install

3. Extract ADGM sources from the PDF:

- ensure Data Sources.pdf is placed in backend/

npm run extract-sources

This writes backend/adgm_sources/all_sources.txt

## Run server

node server.js

or for dev:
npx nodemon server.js

## Test

- Upload sample docx:

curl -X POST <http://localhost:3000/upload> -F "docs=@./sample_AoA.docx"

- Response includes:

JSON report with issues_found (and each issue has official_references if matches found)

annotated_docx filename to download

## Download

curl.exe -O <http://localhost:3000/download/><annotated-filename.docx>

## Notes

Retrieval is local keyword-overlap based (fast, explainable).

For a production RAG, use embeddings + vector DB and controlled LLM calls.
