# ADGM Corporate Agent (Take-home submission)

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)]<<(<https://classroom.github.com/a/vgbm4cZ0>)

This project demonstrates a minimal ADGM-compliant document review agent:

## ADGM Corporate Agent — Take-home

Simple Node.js backend demo that:

1. Accepts '.docx' uploads
2. Identifies document types and checks against ADGM incorporation checklist
3. Detects simple red flags (e.g., incorrect jurisdiction)
4. Produces annotated .docx and a structured JSON report

## Tech

1. Node.js (Express) backend for parsing and annotation
2. mammoth for .docx -> text
3. docx for producing annotated .docx
4. (Optional) RAG using embeddings + vector store for legal references

## Run

- cd backend
- npm install
- node server.js or npx nodemon server.js
- POST files to /upload (form-data key docs)

## Test

curl.exe -X POST <http://localhost:3000/upload> -F "docs=@sample_AoA.docx"

## Download

# In your folder

curl.exe -O <http://localhost:3000/download/annotated-abc123.docx>

# or open in browser

<http://localhost:3000/download/annotated-abc123.docx>

Replace "annotated-abc123.docx" with the exact file name that your /upload response gave you.
