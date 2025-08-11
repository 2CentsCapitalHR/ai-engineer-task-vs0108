## ADGM Corporate Agent — Take-home (with local RAG) 🧑‍💼

This project is an intelligent AI-powered legal assistant designed to review, validate, and prepare documentation for business incorporation and compliance within the Abu Dhabi Global Market (ADGM) jurisdiction. It uses a Retrieval-Augmented Generation (RAG) system to ensure compliance with real-world ADGM laws, regulations, and processes.

# 🚀 Key Features

- Document Processing: Accepts and parses .docx documents to identify document types.

- Checklist Verification: Automatically recognizes the legal process (e.g., company incorporation) and compares uploaded documents against a predefined ADGM checklist. It notifies the user if any mandatory documents are missing.

- Red Flag Detection: Detects legal red flags and inconsistencies, such as:

- Invalid or missing clauses

- Incorrect jurisdiction (e.g., referencing UAE Federal Courts instead of ADGM)

- Ambiguous or non-binding language

- Missing signatory sections or improper formatting

- Non-compliance with ADGM-specific templates

- Inline Commenting: Inserts contextual comments inside the .docx file for flagged content, citing the exact ADGM law or rule that applies (e.g., "Per ADGM Companies Regulations 2020, Art. 6...").

- Structured Output: Generates a structured JSON or Python dictionary report summarizing the analysis, along with a downloadable, reviewed .docx file.

# 🛠️ Technologies Used

UI: Gradio or Streamlit

Core: Python

Dependencies:

pandas

numpy

docx


LLM: Any RAG-compatible LLM (Gemini, OpenAI, Ollama, Claude, etc.)

# ⚙️ Setup

Open your terminal and navigate to the backend directory:

> cd backend

Install the necessary dependencies using npm:

> npm install

And the Python dependencies from the requirements.txt file:

> pip install -r requirements.txt

Extract ADGM sources from the provided Data Sources.pdf file. Ensure this PDF is placed in the backend/ directory.

> npm run extract-sources

This command will create a file named all_sources.txt in the backend/adgm_sources/ directory.

# ▶️ Running the Server

To start the server, use one of the following commands:

Production:

> node server.js

Development:

> npx nodemon server.js

# 🧪 Testing and Usage

You can test the agent by uploading a sample .docx document and then downloading the reviewed version.

- Upload a document (e.g., sample_AoA.docx) using curl:

curl -X POST http://localhost:3000/upload -F "docs=@./sample_AoA.docx"

The response will include a JSON report detailing any issues found, along with an annotated .docx filename for download.

- Download the reviewed file using the filename from the response:

curl.exe -O http://localhost:3000/download/<annotated-filename.docx>

# 📝 Notes on Retrieval-Augmented Generation (RAG)

This system uses a local keyword-overlap based retrieval method, which is fast and explainable. For a production environment, it is recommended to use embeddings and a vector database with controlled LLM calls for more advanced RAG.
