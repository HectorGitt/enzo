"use client";

import { useState, useEffect, useMemo } from "react";
import { UserProfile, RawActivity } from "@/lib/schema";
import { fetchProfile } from "@/app/actions";
import { useSession } from "next-auth/react";
import { generateCustomContentAction } from "@/app/ai-actions";
import { GenerationConfig, GenerationType, ToneType } from "@/lib/gemini";
import { updateProfile } from "@/app/actions";
import { saveContentAction } from "@/app/content-actions";
import { checkCreditsAction } from "@/app/credits-actions";
import {
	Loader2,
	Sparkles,
	Copy,
	Check,
	ArrowLeft,
	RefreshCw,
	Save,
	ChevronDown,
	AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import React, { useRef } from "react";

export default function GeneratePage() {
	const { data: session } = useSession();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [result, setResult] = useState("");
	const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
	const [copied, setCopied] = useState(false);
	const [userCredits, setUserCredits] = useState<number | null>(null);

	// Filter Config
	const [dateRange, setDateRange] = useState<"all" | "1y" | "6m" | "custom">(
		"all"
	);
	const [customStart, setCustomStart] = useState("");
	const [customEnd, setCustomEnd] = useState("");

	// Generation Config
	const [genType, setGenType] = useState<GenerationType>("overview");
	const [config, setConfig] = useState<GenerationConfig>({
		length: "medium",
		tone: "professional",
		customPrompt: "",
	});

	useEffect(() => {
		if (session?.user?.email) {
			fetchProfile().then((p) => {
				setProfile(p);
				setLoading(false);
			});
			// Load user credits
			checkCreditsAction(0).then((res) => {
				if (typeof res.currentCredits === "number") {
					setUserCredits(res.currentCredits);
				}
			});
		}
	}, [session]);

	const activeContext = useMemo(() => {
		if (!profile || !profile.rawActivities) return "";

		let activities = [...profile.rawActivities];

		// Simple Date Filtering
		const now = new Date();
		if (dateRange === "1y") {
			const cutoff = new Date();
			cutoff.setFullYear(now.getFullYear() - 1);
			activities = activities.filter((a) => new Date(a.date) >= cutoff);
		} else if (dateRange === "6m") {
			const cutoff = new Date();
			cutoff.setMonth(now.getMonth() - 6);
			activities = activities.filter((a) => new Date(a.date) >= cutoff);
		} else if (dateRange === "custom" && customStart && customEnd) {
			const start = new Date(customStart);
			const end = new Date(customEnd);
			activities = activities.filter((a) => {
				const d = new Date(a.date);
				return d >= start && d <= end;
			});
		}

		// Format for AI
		return activities
			.map(
				(a) => `
            Date: ${a.date}
            Type: ${a.source}
            Title: ${a.title}
            Content: ${a.content}
        `
			)
			.join("\n---\n");
	}, [profile, dateRange, customStart, customEnd]);

	// Estimate input tokens (roughly 1 token per 3 characters for structured text)
	// Using 3 instead of 4 as structured data with labels uses more tokens
	const estimatedInputTokens = useMemo(() => {
		return Math.ceil(activeContext.length / 3);
	}, [activeContext]);

	// Estimate output tokens based on length setting
	const estimatedOutputTokens = useMemo(() => {
		// Rough estimates for output tokens based on length
		switch (config.length) {
			case "short":
				return 500; // ~300-700 tokens
			case "medium":
				return 1200; // ~800-1600 tokens
			case "long":
				return 2500; // ~2000-3000 tokens
			default:
				return 1200;
		}
	}, [config.length]);

	// Estimate thinking/reasoning tokens (Gemini 2.5 Flash uses internal reasoning)
	// For large context, thinking tokens can be 50-80% of input tokens
	// More input = more reasoning needed to process it
	const estimatedThinkingTokens = useMemo(() => {
		// Base thinking: scales with input size (more context = more reasoning)
		const contextBasedThinking = Math.ceil(estimatedInputTokens * 0.6);
		// Minimum thinking based on output complexity
		const outputBasedThinking = Math.ceil(estimatedOutputTokens * 2);
		// Take the higher of the two
		return Math.max(contextBasedThinking, outputBasedThinking);
	}, [estimatedInputTokens, estimatedOutputTokens]);

	// Total estimated tokens (input + output + thinking) with 10% buffer
	const estimatedTokens = Math.ceil(
		(estimatedInputTokens +
			estimatedOutputTokens +
			estimatedThinkingTokens) *
			1.1
	);

	// Check if user has enough credits
	const hasEnoughCredits =
		userCredits !== null && userCredits >= estimatedTokens;

	const handleGenerate = async () => {
		if (!activeContext) {
			toast.error("No activity data available to generate content.");
			return;
		}

		if (!hasEnoughCredits) {
			toast.error("Insufficient credits. Please buy more credits.");
			return;
		}

		setGenerating(true);
		setResult(""); // Clear previous

		try {
			const res = await generateCustomContentAction(
				activeContext,
				genType,
				config
			);
			if (res.success && res.content) {
				setResult(res.content);
				// Update credits after generation
				if (
					typeof res.tokensUsed === "number" &&
					userCredits !== null
				) {
					setUserCredits(userCredits - res.tokensUsed);
				}
				toast.success("Content generated successfully!");
			} else {
				toast.error(res.error || "Generation failed.");
			}
		} catch (e) {
			toast.error("An unexpected error occurred.");
		} finally {
			setGenerating(false);
		}
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(result);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
		toast.success("Copied to clipboard");
	};

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader2 className="animate-spin" />
			</div>
		);

	return (
		<div className="flex flex-col h-full bg-[#FAFAFA]">
			{/* Header */}
			<div className="h-16 border-b border-black/5 flex items-center justify-between px-6 bg-white shrink-0">
				<div className="flex items-center gap-4">
					<Link
						href="/dashboard"
						className="text-gray-500 hover:text-black transition-colors"
					>
						<ArrowLeft size={18} />
					</Link>
					<div>
						<h1 className="text-lg font-bold flex items-center gap-2">
							<span className="text-purple-600 bg-purple-100 p-1.5 rounded-lg">
								<Sparkles size={16} />
							</span>
							Content Generator
						</h1>
					</div>
				</div>
			</div>

			<div className="flex flex-1 min-h-0 overflow-hidden">
				{/* SETTINGS SIDEBAR */}
				<div className="w-80 border-r border-black/5 bg-white flex flex-col shrink-0">
					<div className="flex-1 p-6 flex flex-col gap-8">
						{/* 1. Context Selection */}
						<section>
							<h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
								1. Data Source
							</h3>
							<div className="bg-gray-50 rounded-lg p-3 border border-black/5">
								<select
									value={dateRange}
									onChange={(e) =>
										setDateRange(e.target.value as any)
									}
									className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 font-medium"
								>
									<option value="all">
										All Available History
									</option>
									<option value="1y">Last Year</option>
									<option value="6m">Last 6 Months</option>
									<option value="custom">Custom Range</option>
								</select>

								{dateRange === "custom" && (
									<div className="mt-3 grid grid-cols-2 gap-2 animate-in slide-in-from-top-1">
										<div>
											<label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
												Start
											</label>
											<input
												type="date"
												value={customStart}
												onChange={(e) =>
													setCustomStart(
														e.target.value
													)
												}
												className="w-full text-xs border border-gray-200 rounded p-1"
											/>
										</div>
										<div>
											<label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
												End
											</label>
											<input
												type="date"
												value={customEnd}
												onChange={(e) =>
													setCustomEnd(e.target.value)
												}
												className="w-full text-xs border border-gray-200 rounded p-1"
											/>
										</div>
									</div>
								)}

								<div className="mt-2 text-[10px] text-gray-500 space-y-1">
									<div className="flex justify-between">
										<span>
											{profile?.rawActivities?.length ||
												0}{" "}
											total items
										</span>
										<span>
											Input: ~
											{estimatedInputTokens.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Output ({config.length}):</span>
										<span>
											~
											{estimatedOutputTokens.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Thinking/Reasoning:</span>
										<span>
											~
											{estimatedThinkingTokens.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between font-medium text-gray-700 border-t border-gray-200 pt-1">
										<span>
											Total estimate (+10% buffer):
										</span>
										<span>
											~{estimatedTokens.toLocaleString()}{" "}
											tokens
										</span>
									</div>
									<div className="text-[9px] text-gray-400 italic">
										Actual usage may vary. Billed on real
										tokens used.
									</div>
								</div>
								{userCredits !== null && (
									<div
										className={`mt-2 text-[10px] flex justify-between ${
											hasEnoughCredits
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										<span>Your credits:</span>
										<span className="font-medium">
											{userCredits.toLocaleString()}
										</span>
									</div>
								)}
								{!hasEnoughCredits && userCredits !== null && (
									<div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg animate-in fade-in">
										<div className="flex items-center gap-2 text-red-700">
											<AlertTriangle size={14} />
											<span className="text-xs font-medium">
												Insufficient credits
											</span>
										</div>
										<p className="text-[10px] text-red-600 mt-1">
											You need ~
											{estimatedTokens.toLocaleString()}{" "}
											credits but only have{" "}
											{userCredits.toLocaleString()}.
										</p>
										<Link
											href="/dashboard/credits"
											className="mt-2 block w-full text-center py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200 transition-colors"
										>
											Buy Credits
										</Link>
									</div>
								)}
							</div>
						</section>

						{/* 2. Generation Type */}
						<section>
							<h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
								2. What to build?
							</h3>
							<div className="grid grid-cols-1 gap-2">
								{(
									[
										"overview",
										"strengths",
										"recommendations",
										"highlights",
										"custom",
									] as GenerationType[]
								).map((type) => (
									<button
										key={type}
										onClick={() => setGenType(type)}
										className={`px-4 py-3 rounded-lg text-sm text-left font-medium transition-all border
                                        ${
											genType === type
												? "bg-purple-50 border-purple-200 text-purple-700 shadow-sm"
												: "bg-white border-transparent hover:bg-gray-50 text-gray-600"
										}
                                    `}
									>
										<span className="capitalize">
											{type}
										</span>
										{type === "custom" && (
											<span className="text-[10px] text-gray-400 block font-normal">
												Write your own prompt
											</span>
										)}
									</button>
								))}
							</div>
						</section>

						{/* 3. Configuration */}
						<section>
							<h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
								3. Fine Tuning
							</h3>

							<div className="space-y-4">
								<div>
									<label className="text-xs font-medium text-gray-700 mb-1.5 block">
										Tone
									</label>
									<div className="grid grid-cols-2 gap-2">
										{(
											[
												"professional",
												"casual",
												"enthusiastic",
												"executive",
												"bold",
											] as ToneType[]
										).map((t) => (
											<button
												key={t}
												onClick={() =>
													setConfig({
														...config,
														tone: t,
													})
												}
												className={`text-xs py-1.5 px-2 rounded border capitalize transition-colors
                                                ${
													config.tone === t
														? "bg-black text-white border-black"
														: "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
												}
                                            `}
											>
												{t}
											</button>
										))}
									</div>
								</div>

								<div>
									<label className="text-xs font-medium text-gray-700 mb-1.5 block">
										Length
									</label>
									<div className="flex bg-gray-100 p-1 rounded-lg">
										{(
											["short", "medium", "long"] as const
										).map((l) => (
											<button
												key={l}
												onClick={() =>
													setConfig({
														...config,
														length: l,
													})
												}
												className={`flex-1 text-xs py-1 rounded-md capitalize transition-all
                                                ${
													config.length === l
														? "bg-white shadow-sm text-black font-medium"
														: "text-gray-500 hover:text-gray-700"
												}
                                            `}
											>
												{l}
											</button>
										))}
									</div>
								</div>

								{genType === "custom" && (
									<div className="animate-in slide-in-from-top-2">
										<label className="text-xs font-medium text-gray-700 mb-1.5 block">
											Custom Instructions
										</label>
										<textarea
											value={config.customPrompt}
											onChange={(e) =>
												setConfig({
													...config,
													customPrompt:
														e.target.value,
												})
											}
											placeholder="e.g., Analyze my work for leadership qualities..."
											className="w-full text-xs border-gray-200 rounded-lg p-3 min-h-[100px] resize-y focus:ring-purple-500 focus:border-purple-500"
										/>
									</div>
								)}
							</div>
						</section>
					</div>

					<div className="p-6 pt-0 border-t border-black/5 bg-white">
						<button
							onClick={handleGenerate}
							disabled={generating || !hasEnoughCredits}
							className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                            ${
								!hasEnoughCredits
									? "bg-gray-300 text-gray-500 cursor-not-allowed"
									: "bg-[#6E2CF4] text-white hover:bg-[#5b24cc] shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
							}
                        `}
						>
							{generating ? (
								<Loader2 className="animate-spin" size={18} />
							) : (
								<Sparkles size={18} />
							)}
							{generating
								? "Cultivating..."
								: !hasEnoughCredits
								? "Insufficient Credits"
								: "Generate Content"}
						</button>
					</div>
				</div>

				{/* RESULTS AREA */}
				<div className="flex-1 bg-gray-50 p-8 flex flex-col overflow-hidden relative">
					{result ? (
						<div className="flex-1 bg-white rounded-2xl border border-black/5 shadow-sm flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
							{/* Toolbar */}
							<div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
								<span className="text-xs font-bold text-gray-400 uppercase">
									Result
								</span>
								<div className="flex gap-2">
									<div className="flex bg-gray-100 rounded-lg p-0.5 mr-2">
										<button
											onClick={() =>
												setViewMode("preview")
											}
											className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
												viewMode === "preview"
													? "bg-white text-black shadow-sm"
													: "text-gray-500 hover:text-gray-700"
											}`}
										>
											Preview
										</button>
										<button
											onClick={() => setViewMode("raw")}
											className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
												viewMode === "raw"
													? "bg-white text-black shadow-sm"
													: "text-gray-500 hover:text-gray-700"
											}`}
										>
											Raw
										</button>
									</div>

									<SaveMenu
										onSaveSummary={async () => {
											if (!profile) return;
											const oldBios =
												profile.bioVariations || [];
											if (
												profile.bio &&
												!oldBios.includes(profile.bio)
											) {
												oldBios.unshift(profile.bio);
											}

											await updateProfile({
												...profile,
												bio: result,
												bioVariations: oldBios,
											});

											setProfile({
												...profile,
												bio: result,
												bioVariations: oldBios,
											});
											toast.success(
												"Saved as Professional Summary"
											);
										}}
										onSaveHighlight={async () => {
											if (!profile) return;
											const newWin = {
												id: crypto.randomUUID(),
												title: `AI Generated ${genType}`,
												source: "manual" as const,
												rawContent: result,
												summary:
													result.slice(0, 200) +
													"...",
												date: new Date().toISOString(),
												tags: ["ai-generated", genType],
												status: "approved" as const,
												showOnResume: true,
											};

											const updatedWins = [
												...(profile.wins || []),
												newWin,
											];
											setProfile({
												...profile,
												wins: updatedWins,
											});

											await updateProfile({
												...profile,
												wins: updatedWins,
											});
											toast.success(
												"Saved to Data Studio as Highlight"
											);
										}}
										onSaveLibrary={async () => {
											try {
												await saveContentAction({
													type: "raw",
													content: result,
													title: `${genType} - ${new Date().toLocaleDateString()}`,
													tags: [
														genType,
														config.tone,
													],
												});
												toast.success(
													"Saved to Library"
												);
											} catch (e) {
												toast.error(
													"Failed to save to library"
												);
											}
										}}
									/>

									<button
										onClick={handleGenerate}
										className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors"
										title="Regenerate"
									>
										<RefreshCw size={14} />
									</button>
									<button
										onClick={handleCopy}
										className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors
                                            ${
												copied
													? "bg-green-100 text-green-700"
													: "bg-black text-white hover:bg-gray-800"
											}
                                        `}
									>
										{copied ? (
											<Check size={14} />
										) : (
											<Copy size={14} />
										)}
										{copied ? "Copied" : "Copy"}
									</button>
								</div>
							</div>

							{/* Content Area */}
							<div className="flex-1 overflow-y-auto p-8 text-gray-800">
								{viewMode === "preview" ? (
									<article className="prose prose-sm md:prose-base lg:prose-lg max-w-none prose-headings:font-sans prose-headings:font-bold prose-h1:text-purple-900 prose-h2:text-gray-800 prose-a:text-purple-600 hover:prose-a:text-purple-500 prose-strong:text-purple-700 font-serif leading-relaxed">
										<ReactMarkdown>{result}</ReactMarkdown>
									</article>
								) : (
									<pre className="font-mono text-xs md:text-sm whitespace-pre-wrap text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
										{result}
									</pre>
								)}
							</div>
						</div>
					) : (
						<div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
							<div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center">
								<Sparkles size={24} className="text-gray-300" />
							</div>
							<p className="text-sm font-medium">
								Ready to create.
							</p>
							<p className="text-xs max-w-md text-center text-gray-400/80">
								Select a content type and configure your
								preferences on the left to generate professional
								assets from your work history.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ... (existing imports, no changes)

// Inside GeneratePage component:
// No changes needed to GeneratePage logic, passing onSaveLibrary down

// Inside SaveMenu component:

function SaveMenu({
	onSaveSummary,
	onSaveHighlight,
	onSaveLibrary,
}: {
	onSaveSummary: () => void;
	onSaveHighlight: () => void;
	onSaveLibrary: () => void;
}) {
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
			>
				<Save size={14} />
				Save as...
				<ChevronDown
					size={12}
					className={`transition-transform ${
						open ? "rotate-180" : ""
					}`}
				/>
			</button>

			{open && (
				<div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
					<button
						onClick={() => {
							onSaveSummary();
							setOpen(false);
						}}
						className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
					>
						<strong>Professional Summary</strong>
						<div className="text-[10px] text-gray-400 font-normal">
							Update main profile bio
						</div>
					</button>
					<div className="h-px bg-gray-100 my-1" />
					<button
						onClick={() => {
							onSaveHighlight();
							setOpen(false);
						}}
						className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
					>
						<strong>New Highlight</strong>
						<div className="text-[10px] text-gray-400 font-normal">
							Add to data studio wins
						</div>
					</button>
					<div className="h-px bg-gray-100 my-1" />
					<button
						onClick={() => {
							onSaveLibrary();
							setOpen(false);
						}}
						className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
					>
						<strong>Save to Library</strong>
						<div className="text-[10px] text-gray-400 font-normal">
							Save purely as content
						</div>
					</button>
				</div>
			)}
		</div>
	);
}

// Inside GeneratePage render return:
// <SaveMenu
//      onSaveSummary={...}
//      onSaveHighlight={...}
//      onSaveLibrary={async () => {
//          try {
//              await saveContentAction({
//                  type: 'raw', // or based on generation type
//                  content: result,
//                  title: `${genType} - ${new Date().toLocaleDateString()}`,
//                  tags: [genType, config.tone]
//              });
//              toast.success("Saved to Library");
//          } catch (e) { toast.error("Failed to save"); }
//      }}
// />
