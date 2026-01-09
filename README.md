# Enzo | The Live Resume 🚀

> **End Career Amnesia.**  
> Automatically sync your GitHub commits, PRs, and achievements into a living resume and portfolio.

Enzo is an autonomous professional identity platform. It connects to your engineering work stream (GitHub, etc.), analyzes your contributions to find "Wins", and helps you publish them as a perfect PDF resume or a public portfolio.

![Enzo Homepage](public/enzo.png)

## ✨ Key Features

### 1. **Smart Ingestion**
- **GitHub Integration:** Automatically fetches commits and Pull Requests from your repositories.
- **Private Repo Support:** Securely syncs work from private organizations via a GitHub App.
- **Noise Filtering:** Distinguishes between "Fixed typo" and "Optimized API latency by 40%".

### 2. **The Data Studio**
- **Kanban Workflow:** Drag-and-drop workflow to move raw data into your "Highlights".
- **AI Refinement:** Use **Gemini 2.5 Flash** to rewrite raw commit logs into executive-ready bullet points and generate professional bio variations.
- **Evidence Linking:** Every highlight links back to the original PR or commit diff.

### 3. **Resume Builder**
- **Live Preview:** See changes instantly as you edit.
- **Custom Templates:** 
    - **PDF:** Built-in professional tech layout.
    - **Word (.docx):** Upload **your own custom Word templates** with Jinja2 tags (e.g., `{{ name }}`, `{{ summary }}`) for pixel-perfect control.
- **Section Management:** Reorder Experience, Education, Schools, and Skills with drag-and-drop.
- **Version Control:** Save multiple "Bio Variations" to target different roles.

### 4. **Public Portfolio**
- **Enzo.dev:** (Coming Soon) Your always-updated public career history link.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** FastAPI (Python), SQLModel (SQLite).
- **Auth:** NextAuth.js (GitHub, LinkedIn, Google, Slack).
- **Templating:** `docxtpl` for Word generation.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- GitHub OAuth App / GitHub App credentials

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/enzo.git
    cd enzo
    ```

2.  **Frontend Setup:**
    ```bash
    npm install
    # Create .env.local with your auth credentials
    npm run dev
    ```

3.  **Backend Setup:**
    ```bash
    cd backend
    pip install -r requirements.txt
    # OR manual install:
    # pip install fastapi uvicorn sqlmodel docxtpl python-multipart
    uvicorn main:app --reload --port 5000
    ```

4.  **Open the App:**
    Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📄 Word Template Guide

Enzo supports custom `.docx` templates. To create one:
1.  Open Word.
2.  Use the following tags:
    - `{{ name }}`, `{{ title }}`, `{{ email }}`, `{{ phone }}`, `{{ location }}`
    - `{{ summary }}`
    - `{{ skills }}`
    - **Experience Loop:**
        ```
        {% for exp in experience %}
        {{ exp.title }} at {{ exp.company }}
        {{ exp.description }}
        {% endfor %}
        ```
3.  Upload it in the **Resume Builder** > **Templates** panel.

---

## 🤝 Contributing

This project is in **Open Beta**. Issues and PRs are welcome!

License: MIT
