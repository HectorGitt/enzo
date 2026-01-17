export default function TermsPage() {
    return (
        <div className="container mx-auto px-6 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <div className="prose prose-lg">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>
                    Please read these Terms of Service ("Terms") carefully before using Enzo.
                </p>

                <h3>1. Acceptance of Terms</h3>
                <p>
                    By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
                </p>

                <h3>2. Use of Service</h3>
                <p>
                    You are responsible for your use of the service and for any content you provide, including compliance with applicable laws, rules, and regulations.
                </p>

                <h3>3. GitHub Integration</h3>
                <p>
                    Enzo integrates with GitHub to sync your commit history. By using this feature, you grant us permission to access your public and private repositories as authorized by you.
                </p>

                <h3>4. Termination</h3>
                <p>
                    We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>

                <h3>5. Changes</h3>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                </p>
            </div>
        </div>
    );
}
