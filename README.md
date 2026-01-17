# Enzo | The Live Resume 🚀

> **End Career Amnesia.**  
> Automatically sync your GitHub commits, PRs, and achievements into a living resume and portfolio.

Enzo is an autonomous professio- **Buffer:** +10% safety margin

### Pricing

- **$2 = 1,000,000 credits**
- New users start with 500,000 free credits
- **Minimum purchase: $10** (5M credits)\*$2 = 1,000,000 credits\*\*
- New users start with 500,000 free credits
- **Minimum purchase: $10** (5M credits)dentity platform. It connects to your engineering work stream (GitHub, etc.), analyzes your contributions to find "Wins", and helps you publish them as a perfect PDF resume or a public portfolio.

![Enzo Homepage](public/enzo.png)

## ✨ Key Features

### 1. **Smart Ingestion**

- **GitHub Integration:** Automatically fetches commits and Pull Requests from your repositories.
- **GitHub App Integration:** Secure OAuth flow with automatic repository detection and permission management.
- **Private Repo Support:** Securely syncs work from private organizations via a GitHub App.
- **Noise Filtering:** Distinguishes between "Fixed typo" and "Optimized API latency by 40%".
- **Portfolio Repository:** Set a specific repo as your portfolio source for focused syncing.
- **Real-time Sync:** Automatic portfolio updates when you push code to GitHub.

### 2. **AI-Powered Portfolio Updates**

- **Intelligent Code Analysis:** Gemini AI analyzes your codebase structure, frameworks, and technologies.
- **Automatic Content Generation:** Creates portfolio descriptions, project highlights, and technical summaries.
- **Framework Detection:** Identifies React, Next.js, Vue, Svelte, Node.js, Python, and other technologies.
- **Smart Updates:** Updates existing portfolio content instead of overwriting, preserving customizations.
- **GitHub App Permissions:** Secure repository access with granular permission controls.

### 3. **The Data Studio**

- **Kanban Workflow:** Drag-and-drop workflow to move raw data into your "Highlights".
- **AI Refinement:** Use **Gemini 2.5 Flash** to rewrite raw commit logs into executive-ready bullet points and generate professional bio variations.
- **Evidence Linking:** Every highlight links back to the original PR or commit diff.
- **GitHub Explorer:** Browse repositories and generate highlights from specific repos.
- **Bulk Operations:** Process multiple commits and PRs simultaneously.

### 4. **Resume Builder**

- **Live Preview:** See changes instantly as you edit.
- **PDF Import:** Upload existing PDF resumes and parse content automatically.
- **Custom Templates:**
    - **PDF:** Built-in professional tech layout.
    - **Word (.docx):** Upload **your own custom Word templates** using standard tags (e.g., `{name}`, `{summary}`) for pixel-perfect control.
- **Section Management:** Reorder Experience, Education, Schools, and Skills with drag-and-drop.
- **Version Control:** Save multiple "Bio Variations" to target different roles.
- **Export Options:** Download as PDF or Word document.

### 5. **Content Generator**

- **AI-Powered Content:** Generate professional overviews, strengths analysis, recommendations, and highlights from your activity history.
- **Customizable Tone:** Choose from professional, casual, enthusiastic, executive, or bold tones.
- **Length Control:** Generate short, medium, or long content as needed.
- **Date Filtering:** Filter activities by date range (all time, 1 year, 6 months, or custom).
- **Token Estimation:** See estimated token usage before generating (input + output + thinking tokens).
- **Real Token Usage:** Actual Gemini API costs billed to your account.
- **Save to Library:** Store generated content for easy reuse.
- **Free Tier Limit:** Free users can generate content once; upgrade to Pro for unlimited usage.

### 6. **Public Portfolio**

- **Live Profiles:** Claim your unique username (e.g., `enzo.dev/p/yourname`) and share your verified career history with the world.
- **Verified Badges:** Show off verified commits and LinkedIn activity with trust badges.
- **SEO Optimized:** Meta tags, Open Graph, and JSON-LD structured data for better search visibility.
- **Responsive Design:** Mobile-friendly portfolio layouts.

### 7. **Library & Saved Content**

- **Content Management:** Save generated bios, cover letters, and highlights to your personal library for easy reuse.
- **Organization:** Categorize and search through your saved content.
- **Version History:** Track changes to your saved content over time.

### 8. **Credit System & Payments**

- **Pay-As-You-Go (PAYG):** Purchase credits as needed - $2 per 1,000,000 credits.
- **Token-Based Billing:** 1 token = 1 credit. Charged based on actual Gemini API usage.
- **Dodo Payments Integration:** Secure payment processing with webhook verification.
- **Credit Tracking:** View your current balance and purchase more credits from the dashboard.
- **Usage Transparency:** See estimated token costs before AI operations and actual usage after.
- **Payment Status Handling:** Robust error handling for failed payments with proper user feedback.
- **Timeout Protection:** Automatic fallbacks prevent infinite loading states.
- **Free Tier Limits:** Free users get 500,000 credits and can generate content once; upgrade to Pro for unlimited usage.

### 9. **Authentication & Security**

- **Multi-Provider Auth:** GitHub, Google, and LinkedIn OAuth integration.
- **Secure Sessions:** NextAuth.js v5 with proper session management.
- **GitHub App Security:** OAuth flow with secure token management and permission scopes.
- **Database Security:** Connection pooling and prepared statements for SQL injection prevention.

### 10. **Beta Program & Waitlist**

- **Integration Waitlist:** Users can sign up for early access to Slack, Google Calendar, and LinkedIn activity syncing directly from the dashboard.
- **Direct Database Persistence:** Robust state management ensures your beta status is saved instantly.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database
- GitHub OAuth App credentials
- GitHub App credentials (for portfolio automation)
- Google Gemini API Key
- Dodo Payments API Key (for credit purchases)

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

    # GitHub App (for portfolio automation)
    GITHUB_APP_ID=your_github_app_id
    GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nyour_private_key_here\n-----END RSA PRIVATE KEY-----"

    # Database
    DATABASE_URL=postgresql://user:password@host:5432/database

    # AI
    GEMINI_API_KEY=your_gemini_api_key

    # Payments (Dodo Payments)
    DODO_PAYMENTS_API_KEY=your_dodo_api_key
    DODO_PAYMENTS_WEBHOOK_KEY=your_dodo_webhook_key
    DODO_PAYMENTS_PRODUCT_ID=your_payg_product_id

    # Optional: Additional OAuth providers
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    LINKEDIN_CLIENT_ID=your_linkedin_client_id
    LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
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

## 💰 Credit System

Enzo uses a token-based credit system for AI features:

| Feature                  | Token Usage                           |
| ------------------------ | ------------------------------------- |
| GitHub Sync              | ~100 credits per sync                 |
| Portfolio Update         | ~500-2000 credits per update          |
| AI Highlight Enhancement | Varies by content length              |
| Bio Generation           | ~500-2000 credits                     |
| Content Generator        | Depends on input size + output length |

### Token Estimation (Content Generator)

- **Input Tokens:** ~1 token per 3 characters
- **Output Tokens:** 500-2500 based on length setting
- **Thinking Tokens:** ~60% of input tokens (Gemini reasoning)
- **Buffer:** +10% safety margin

### Pricing

- **$2 = 1,000,000 credits**
- New users start with 10,000 free credits
- **Minimum purchase: $10** (5M credits)

### Credit Packages

| Package      | Credits | Price | Best For                          |
| ------------ | ------- | ----- | --------------------------------- |
| Starter      | 5M      | $10   | Light AI usage, resume building   |
| Professional | 12.5M   | $25   | Regular content generation        |
| Enterprise   | 25M     | $50   | Heavy AI usage, portfolio updates |

Transparent billing based on actual API usage.

---

## 🔧 GitHub App Setup

For automatic portfolio updates:

1. **Create a GitHub App** in your GitHub settings
2. **Set permissions:**
    - Repository contents: Read
    - Repository metadata: Read
    - Webhooks: Read & Write
3. **Configure webhook URL:** `https://yourdomain.com/api/github-app/callback`
4. **Install the app** on your repositories
5. **Add credentials** to your `.env.local` file

### Features

- **Automatic Repository Detection:** No manual repo entry required
- **Secure OAuth Flow:** Proper permission management
- **Real-time Updates:** Portfolio updates on GitHub pushes
- **Framework Analysis:** AI detects tech stack and generates content

---

## 📄 Word Template Guide

Enzo supports custom `.docx` templates. To create one:

1.  Open Word.
2.  Use the following tags (curly braces):
    - `{name}`, `{title}`, `{email}`, `{phone}`, `{location}`
    - `{summary}`
    - `{skills}`
    - **Experience Loop:**
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

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** PostgreSQL (raw SQL via `pg` with connection pooling)
- **Authentication:** NextAuth.js v5 (GitHub, Google, LinkedIn OAuth)
- **AI:** Google Gemini 2.5 Flash with real token usage tracking
- **Payments:** Dodo Payments SDK with webhook verification
- **Styling:** Tailwind CSS
- **PDF Generation:** React-PDF with custom components
- **Word Export:** docxtemplater
- **GitHub Integration:** @octokit/rest with GitHub Apps
- **State Management:** React hooks with optimistic updates
- **Error Handling:** Comprehensive error boundaries and fallbacks

---

## 📊 Database Schema

Key tables:

- `UserProfile`: User accounts, settings, and GitHub installations
- `UserWins`: GitHub activity, commits, and achievements
- `CreditTransactions`: Payment and usage tracking
- `SavedContent`: User-generated content library
- `GitHubInstallations`: GitHub App installations and permissions

### Database Features

- **Connection Pooling:** Efficient PostgreSQL connection management
- **Prepared Statements:** SQL injection prevention
- **Transaction Support:** Atomic operations for credit management
- **Migration Scripts:** Automated database setup and updates

---

## 🤝 Contributing

This project is in **Open Beta**. Issues and PRs are welcome!

### Development Guidelines

- Use TypeScript for all new code
- Follow Next.js App Router conventions
- Add proper error handling and loading states
- Test database operations thoroughly
- Use the established credit system for AI features

## 📝 License

MIT

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database
- GitHub OAuth App credentials
- GitHub App credentials (for portfolio automation)
- Google Gemini API Key
- Dodo Payments API Key (for credit purchases)

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

    # GitHub App (for portfolio automation)
    GITHUB_APP_ID=your_github_app_id
    GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nyour_private_key_here\n-----END RSA PRIVATE KEY-----"

    # Database
    DATABASE_URL=postgresql://user:password@host:5432/database

    # AI
    GEMINI_API_KEY=your_gemini_api_key

    # Payments (Dodo Payments)
    DODO_PAYMENTS_API_KEY=your_dodo_api_key
    DODO_PAYMENTS_WEBHOOK_KEY=your_dodo_webhook_key
    DODO_PAYMENTS_PRODUCT_ID=your_payg_product_id

    # Optional: Additional OAuth providers
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    LINKEDIN_CLIENT_ID=your_linkedin_client_id
    LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
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

## 💰 Credit System

Enzo uses a token-based credit system for AI features:

| Feature                  | Token Usage                           |
| ------------------------ | ------------------------------------- |
| GitHub Sync              | ~100 credits per sync                 |
| Portfolio Update         | ~500-2000 credits per update          |
| AI Highlight Enhancement | Varies by content length              |
| Bio Generation           | ~500-2000 credits                     |
| Content Generator        | Depends on input size + output length |

### Token Estimation (Content Generator)

- **Input Tokens:** ~1 token per 3 characters
- **Output Tokens:** 500-2500 based on length setting
- **Thinking Tokens:** ~60% of input tokens (Gemini reasoning)
- **Buffer:** +10% safety margin

### Pricing

- **$2 = 1,000,000 credits**
- New users start with 10,000 free credits
- **Minimum purchase: $10** (5M credits)

### Credit Packages

| Package      | Credits | Price | Best For                          |
| ------------ | ------- | ----- | --------------------------------- |
| Starter      | 5M      | $10   | Light AI usage, resume building   |
| Professional | 12.5M   | $25   | Regular content generation        |
| Enterprise   | 25M     | $50   | Heavy AI usage, portfolio updates |

Transparent billing based on actual API usage.

### Payment Features

- **Robust Error Handling:** Failed payments show proper error messages without breaking the UI
- **Timeout Protection:** Automatic fallbacks prevent infinite loading states
- **URL Cleaning:** Payment redirects clean up URL parameters immediately
- **Webhook Verification:** Secure payment confirmation via webhooks

---

## �📄 Word Template Guide

Enzo supports custom `.docx` templates. To create one:

1.  Open Word.
2.  Use the following tags (curly braces):
    - `{name}`, `{title}`, `{email}`, `{phone}`, `{location}`
    - `{summary}`
    - `{skills}`
    - **Experience Loop:**
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
    - `payment.failed` - Logged for debugging with user notification
    - `refund.succeeded` / `refund.failed` - Credit adjustments

### Payment Flow

- **Secure Redirects:** Payment processing with proper error handling
- **URL Cleanup:** Automatic parameter removal after payment completion
- **Balance Updates:** Real-time credit balance updates via webhooks
- **Error Recovery:** Graceful handling of failed payments

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** PostgreSQL (raw SQL via `pg` with connection pooling)
- **Authentication:** NextAuth.js v5 (GitHub, Google, LinkedIn OAuth)
- **AI:** Google Gemini 2.5 Flash with real token usage tracking
- **Payments:** Dodo Payments SDK with webhook verification
- **Styling:** Tailwind CSS
- **PDF Generation:** React-PDF with custom components
- **Word Export:** docxtemplater
- **GitHub Integration:** @octokit/rest with GitHub Apps
- **PDF Parsing:** pdf-parse for resume import
- **State Management:** React hooks with optimistic updates
- **Error Handling:** Comprehensive error boundaries and fallbacks
- **SEO:** Next.js metadata API with Open Graph and JSON-LD

---

## 🤝 Contributing

This project is in **Open Beta**. Issues and PRs are welcome!

### Development Guidelines

- Use TypeScript for all new code
- Follow Next.js App Router conventions
- Add proper error handling and loading states
- Test database operations thoroughly
- Use the established credit system for AI features
- Implement proper authentication checks
- Add comprehensive logging for debugging
- Follow the existing code patterns and architecture

### Code Quality

- **TypeScript Strict Mode:** Enabled for type safety
- **ESLint:** Configured for code consistency
- **Prettier:** Code formatting standards
- **Error Boundaries:** Comprehensive error handling
- **Loading States:** Proper UX for async operations

## 📝 License

MIT
