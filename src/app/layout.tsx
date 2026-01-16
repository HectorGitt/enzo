import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Enzo | End Career Amnesia - The Live Resume for Developers",
	description:
		"Stop forgetting your achievements. Enzo automatically syncs your GitHub commits and PRs into a living resume. Generate PDFs, build your public portfolio, and never scramble before a performance review again.",
	keywords: [
		"resume builder",
		"developer portfolio",
		"GitHub integration",
		"career tracking",
		"professional resume",
		"developer resume",
		"automated resume",
		"performance review",
		"career amnesia",
		"live resume",
	],
	authors: [{ name: "Enzo" }],
	creator: "Enzo",
	publisher: "Enzo",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: "/enzo.png",
		apple: "/enzo.png",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://enzo.dev",
		siteName: "Enzo",
		title: "Enzo | End Career Amnesia - The Live Resume for Developers",
		description:
			"Stop forgetting your achievements. Enzo automatically syncs your GitHub commits and PRs into a living resume. Generate PDFs and build your public portfolio.",
		images: [
			{
				url: "/enzo.png",
				width: 512,
				height: 512,
				alt: "Enzo - The Live Resume",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Enzo | End Career Amnesia - The Live Resume for Developers",
		description:
			"Stop forgetting your achievements. Enzo automatically syncs your GitHub commits and PRs into a living resume.",
		images: ["/enzo.png"],
		creator: "@enzo",
	},
	alternates: {
		canonical: "https://enzo.dev",
	},
	category: "technology",
};

import { Providers } from "./providers";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
