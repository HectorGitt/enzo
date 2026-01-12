"use client";

import dynamic from "next/dynamic";
import { UserProfile } from "@/lib/schema";

// PDFDownloadLink must be imported dynamically to avoid SSR issues
const PDFDownloadLink = dynamic(
	() => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
	{
		ssr: false,
		loading: () => (
			<button className="btn-primary opacity-50">Loading PDF...</button>
		),
	}
);

import { ResumeDocument } from "./ResumeDocument";

export function DownloadResume({ profile }: { profile: UserProfile }) {
	return (
		<PDFDownloadLink
			document={<ResumeDocument profile={profile} />}
			fileName={`resume-${
				profile.name?.toLowerCase().replace(/\s+/g, "-") || "user"
			}.pdf`}
		>
			{({ blob, url, loading, error }) =>
				loading ? (
					<button className="px-4 py-2 rounded bg-white/10 text-white text-sm font-bold">
						Generating...
					</button>
				) : (
					<button className="px-4 py-2 rounded bg-black text-white text-sm font-bold hover:scale-105 transition-transform hover:bg-black/80">
						Download PDF
					</button>
				)
			}
		</PDFDownloadLink>
	);
}
