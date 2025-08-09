[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/vgbm4cZ0)


# ADGM Corporate Agent (Take-home submission)

This project demonstrates a minimal ADGM-compliant document review agent:
- Accepts `.docx` uploads
- Identifies document types and checks against ADGM incorporation checklist
- Detects simple red flags (e.g., incorrect jurisdiction)
- Produces annotated `.docx` and a structured JSON report

Tech:
- Node.js (Express) backend for parsing and annotation
- mammoth for .docx -> text
- docx for producing annotated .docx
- (Optional) RAG using embeddings + vector store for legal references

Run:
1. cd backend
2. npm install
3. node server.js
4. POST files to /upload (form-data key `docs`)
