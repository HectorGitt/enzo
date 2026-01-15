# Enzo | The Live Resume 🚀

> **End Career Amnesia.**  
> Automatically sync your GitHub commits, PRs, and achievements into a living resume and portfolio.

Enzo is an autonomous professional identity platform. It connects to your engineering work stream (GitHub, etc.), analyzes your contributions to find "Wins", and helps you publish them as a perfect PDF resume or a public portfolio.

![Enzo Homepage](public/enzo.png)

## ✨ Key Features

### 1. **Smart Ingestion**

-   **GitHub Integration:** Automatically fetches commits and Pull Requests from your repositories.
-   **Private Repo Support:** Securely syncs work from private organizations via a GitHub App.
-   **Noise Filtering:** Distinguishes between "Fixed typo" and "Optimized API latency by 40%".
-   **Portfolio Repository:** Set a specific repo as your portfolio source for focused syncing.

### 2. **The Data Studio**

-   **Kanban Workflow:** Drag-and-drop workflow to move raw data into your "Highlights".
-   **AI Refinement:** Use **Gemini 2.5 Flash** to rewrite raw commit logs into executive-ready bullet points and generate professional bio variations.
-   **Evidence Linking:** Every highlight links back to the original PR or commit diff.
-   **GitHub Explorer:** Browse repositories and generate highlights from specific repos.

### 3. **Resume Builder**

-   **Live Preview:** See changes instantly as you edit.
-   **Custom Templates:**
    -   **PDF:** Built-in professional tech layout.
    -   **Word (.docx):** Upload **your own custom Word templates** using standard tags (e.g., `{name}`, `{summary}`) for pixel-perfect control.
-   **Section Management:** Reorder Experience, Education, Schools, and Skills with drag-and-drop.
-   **Version Control:** Save multiple "Bio Variations" to target different roles.

### 4. **Content Generator**

-   **AI-Powered Content:** Generate professional overviews, strengths analysis, recommendations, and highlights from your activity history.
-   **Customizable Tone:** Choose from professional, casual, enthusiastic, executive, or bold tones.
-   **Length Control:** Generate short, medium, or long content as needed.
-   **Date Filtering:** Filter activities by date range (all time, 1 year, 6 months, or custom).
-   **Token Estimation:** See estimated token usage before generating (input + output + thinking tokens).
-   **Save to Library:** Store generated content for easy reuse.

### 5. **Public Portfolio**

-   **Live Profiles:** Claim your unique username (e.g., `enzo.dev/p/yourname`) and share your verified career history with the world.
-   **Verified Badges:** Show off verified commits and LinkedIn activity with trust badges.

### 6. **Library & Saved Content**

-   **Content Management:** Save generated bios, cover letters, and highlights to your personal library for easy reuse.

### 7. **Credit System & Payments**

-   **Pay-As-You-Go (PAYG):** Purchase credits as needed - $2 per 1,000,000 credits.
-   **Token-Based Billing:** 1 token = 1 credit. Charged based on actual Gemini API usage.
-   **Dodo Payments Integration:** Secure payment processing with webhook verification.
-   **Credit Tracking:** View your current balance and purchase more credits from the dashboard.
-   **Usage Transparency:** See estimated token costs before AI operations and actual usage after.

### 8. **Beta Program & Waitlist**

-   **Integration Waitlist:** Users can sign up for early access to Slack, Google Calendar, and LinkedIn activity syncing directly from the dashboard.
-   **Direct Database Persistence:** Robust state management ensures your beta status is saved instantly.

---

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   PostgreSQL Database
-   GitHub OAuth App credentials
-   Google Gemini API Key
-   Dodo Payments API Key (for credit purchases)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/HectorGitt/enzo.git
    cd enzo
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file with the following:

    ```env
    # Authentication
    GITHUB_ID=your_github_oauth_id
    GITHUB_SECRET=your_github_oauth_secret
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000

    # Database
    DATABASE_URL=postgresql://user:password@host:5432/database

    # AI
    GEMINI_API_KEY=your_gemini_api_key

    # Payments (Dodo Payments)
    DODO_PAYMENTS_API_KEY=your_dodo_api_key
    DODO_PAYMENTS_WEBHOOK_KEY=your_dodo_webhook_key
    DODO_PAYMENTS_PRODUCT_ID=your_payg_product_id

    # Optional: Google OAuth
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```

4.  **Database Setup:**

    ```bash
    # Run the consolidated migration script
    npx tsx scripts/migrate.ts
    ```

5.  **Start the development server:**

    ```bash
    npm run dev
    ```

6.  **Open the App:**
    Navigate to [http://localhost:3000](http://localhost:3000).

---

## � Credit System

Enzo uses a token-based credit system for AI features:

| Feature                  | Token Usage                           |
| ------------------------ | ------------------------------------- |
| GitHub Sync              | ~100 credits per sync                 |
| AI Highlight Enhancement | Varies by content length              |
| Bio Generation           | ~500-2000 credits                     |
| Content Generator        | Depends on input size + output length |

### Token Estimation (Content Generator)

-   **Input Tokens:** ~1 token per 3 characters
-   **Output Tokens:** 500-2500 based on length setting
-   **Thinking Tokens:** ~60% of input tokens (Gemini reasoning)
-   **Buffer:** +10% safety margin

### Pricing

-   **$2 = 1,000,000 credits**
-   New users start with 10,000 free credits

---

## �📄 Word Template Guide

Enzo supports custom `.docx` templates. To create one:

1.  Open Word.
2.  Use the following tags (curly braces):
    -   `{name}`, `{title}`, `{email}`, `{phone}`, `{location}`
    -   `{summary}`
    -   `{skills}`
    -   **Experience Loop:**
        ```
        {#experience}
        {title} at {company}
        {description}
        {/experience}
        ```
3.  Upload it in the **Resume Builder** > **Templates** panel.

---

## 🔌 Webhook Setup (Dodo Payments)

For credit purchases to work in production:

1. Configure webhook URL in Dodo dashboard: `https://yourdomain.com/api/webhooks/dodo`
2. Set the webhook signing key in `DODO_PAYMENTS_WEBHOOK_KEY`
3. Events handled:
    - `payment.succeeded` - Credits added to user account
    - `payment.failed` - Logged for debugging
    - `refund.succeeded` / `refund.failed` - Credit adjustments

---

## 🛠️ Tech Stack

-   **Framework:** Next.js 16 (App Router, Turbopack)
-   **Language:** TypeScript
-   **Database:** PostgreSQL (raw SQL via `pg`)
-   **Authentication:** NextAuth.js v5 (GitHub, Google, Credentials)
-   **AI:** Google Gemini 2.5 Flash
-   **Payments:** Dodo Payments SDK
-   **Styling:** Tailwind CSS
-   **PDF Generation:** React-PDF
-   **Word Export:** docxtemplater

---

## 🤝 Contributing

This project is in **Open Beta**. Issues and PRs are welcome!

## 📝 License

MIT
