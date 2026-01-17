export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-6 py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-lg">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>
                    At Enzo, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information.
                </p>

                <h3>1. Information We Collect</h3>
                <p>
                    We collect information you provide directly to us, such as when you create an account, connect your GitHub repository, or communicate with us.
                    This includes your name, email address, and authentication tokens for connected services.
                </p>

                <h3>2. How We Use Your Information</h3>
                <p>
                    We use your information to provide, maintain, and improve our services, including:
                    <ul>
                        <li>Syncing your GitHub activity to build your portfolio.</li>
                        <li>Generating AI-powered summaries of your work.</li>
                        <li>Communicating with you about updates and security alerts.</li>
                    </ul>
                </p>

                <h3>3. Data Security</h3>
                <p>
                    We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h3>4. Contact Us</h3>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at support@enzo.stability.com.
                </p>
            </div>
        </div>
    );
}
