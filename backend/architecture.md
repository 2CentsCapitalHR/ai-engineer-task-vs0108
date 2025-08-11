# Architecture — ADGM Agent (Take-home)

Overview:
Upload (.docx) -> Parse (mammoth) -> Checklist detection -> Rule-based issue detection -> Retrieve ADGM references (local text files) -> Create annotated .docx + JSON report.

Components:

- server.js: Express endpoints (/upload, /download).
- utils/parseDocx.js: converts .docx to plain text (mammoth).
- utils/checklist.js: detect document types and missing checklist items.
- utils/retrieveRefs.js: simple keyword-overlap retrieval from adgm_sources/*.txt.
- utils/annotateDocx.js: produce annotated .docx summarizing issues.

Security & data handling:

- Uploaded files stored in backend/uploads/ (local). For production, move to S3 and encrypt at rest.
- No executable content runs from uploaded docs; files parsed as text only.
- Implement periodic cleanup policy (e.g., delete uploads older than 24 hours).

Future improvements:

- Replace simple retrieval with embeddings + vector store (Chroma/FAISS).
- Add optional LLM step to generate suggested clause rewrite.
- Inject inline Word comments via docx XML edits.
