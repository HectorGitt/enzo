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

import Script from "next/script";
import { Providers } from "./providers";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<Script id="google-tag-manager" strategy="afterInteractive">
					{`
					(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
					new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
					j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
					'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
					})(window,document,'script','dataLayer','GTM-WFG87KQB');
					`}
				</Script>
				<Script
					src="https://www.googletagmanager.com/gtag/js?id=G-573XER5P4G"
					strategy="afterInteractive"
				/>
				<Script id="google-analytics" strategy="afterInteractive">
					{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());

					gtag('config', 'G-573XER5P4G');
					`}
				</Script>
			</head>
			<body>
				<noscript>
					<iframe
						src="https://www.googletagmanager.com/ns.html?id=GTM-WFG87KQB"
						height="0"
						width="0"
						style={{ display: "none", visibility: "hidden" }}
					></iframe>
				</noscript>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
