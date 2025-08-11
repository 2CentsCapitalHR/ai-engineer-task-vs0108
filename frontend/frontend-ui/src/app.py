import gradio as gr
import requests
import json
import os

BACKEND_URL = "http://localhost:3000/upload"
DOWNLOAD_URL = "http://localhost:3000/download/"

def process_document(file_path, issues_json):
    if file_path is None:
        return "❌ No file uploaded.", None

    # Validate JSON input
    try:
        issues_data = json.loads(issues_json)
    except json.JSONDecodeError:
        return "❌ Invalid JSON format in issues input.", None

    try:
        filename = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            files = {
                'docs': (filename, f, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            }
            data = {
                'issues': json.dumps(issues_data)
            }
            response = requests.post(BACKEND_URL, files=files, data=data)

        if response.status_code == 200:
            result = response.json()
            annotated_filename = result.get("annotated_docx")
            download_path = None
            if annotated_filename:
                # Download the annotated file from backend
                r = requests.get(DOWNLOAD_URL + annotated_filename)
                if r.status_code == 200:
                    # Save to a temp file (user can choose location after download)
                    temp_path = os.path.join(os.getcwd(), annotated_filename)
                    with open(temp_path, "wb") as out_f:
                        out_f.write(r.content)
                    download_path = temp_path
            return json.dumps(result, indent=2), download_path
        else:
            return f"❌ Error: {response.status_code}\n{response.text}", None

    except Exception as e:
        return f"❌ Request failed: {str(e)}", None

# Define the Gradio interface
iface = gr.Interface(
    fn=process_document,
    inputs=[
        gr.File(label="Upload DOCX Document"),
        gr.Textbox(label="Issues (JSON format)", placeholder='[{"document": "doc1", "issue": "Issue description"}]')
    ],
    outputs=[
        gr.Textbox(label="Output"),
        gr.File(label="Download Annotated DOCX")
    ],
    title="ADGM Agent Document Annotation",
    description="Upload a document to generate an ADGM review report. Download the annotated DOCX after processing."
)

if __name__ == "__main__":
    iface.launch()
