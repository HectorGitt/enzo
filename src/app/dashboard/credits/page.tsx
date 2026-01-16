"use strict";
"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import {
	Loader2,
	CheckCircle,
	Zap,
	Shield,
	FileText,
	Check,
	CreditCard,
} from "lucide-react";
import {
	createCheckoutSessionAction,
	checkCreditsAction,
} from "@/app/credits-actions";
import { toast } from "sonner";

// Rate: $2 per 1,000,000 credits (1 token = 1 credit)
const CREDITS_PER_DOLLAR = 500000; // $1 = 500K credits ($2 per million)
const MIN_PURCHASE_DOLLARS = 1; // Minimum $1 purchase

const CREDIT_OPTIONS = [
	{ credits: 500000, price: 1, label: "500K Credits" },
	{ credits: 5000000, price: 10, label: "5M Credits", popular: true },
	{ credits: 25000000, price: 50, label: "25M Credits" },
];

// Wrapper component with Suspense boundary for useSearchParams
export default function CreditsPage() {
	return (
		<Suspense fallback={<CreditsPageLoading />}>
			<CreditsPageContent />
		</Suspense>
	);
}

function CreditsPageLoading() {
	return (
		<div className="container mx-auto p-8 max-w-5xl flex items-center justify-center min-h-[50vh]">
			<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
		</div>
	);
}

function CreditsPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const success = searchParams.get("success");
	const status = searchParams.get("status");

	const [balance, setBalance] = useState<number | null>(null);
	const [balanceLoading, setBalanceLoading] = useState(true);
	const [loading, setLoading] = useState<string | null>(null);
	const [customAmount, setCustomAmount] = useState<string>("");
	const [urlCleaned, setUrlCleaned] = useState(false);
	const balanceLoadedRef = useRef(false);

	useEffect(() => {
		// Handle payment status and clean up URL
		if (success === "true" && status === "success") {
			toast.success(
				"Payment successful! Credits have been added to your account."
			);
			// Clean URL using history API
			window.history.replaceState({}, '', '/dashboard/credits');
			setUrlCleaned(true);
		} else if (success === "true" && status === "failed") {
			toast.error("Payment failed. No credits were added.");
			// Clean URL using history API
			window.history.replaceState({}, '', '/dashboard/credits');
			setUrlCleaned(true);
		} else {
			// No payment params, URL is already clean
			setUrlCleaned(true);
		}
	}, [success, status]);

	useEffect(() => {
		// Load balance only after URL is cleaned up
		if (urlCleaned && !balanceLoadedRef.current) {
			balanceLoadedRef.current = true;
			loadBalance();
		}
	}, [urlCleaned]);

	useEffect(() => {
		// Safety fallback: clear loading state after 15 seconds
		const fallbackTimer = setTimeout(() => {
			setBalanceLoading(false);
			if (balance === null) {
				setBalance(0);
			}
		}, 15000);
		
		return () => clearTimeout(fallbackTimer);
	}, [balance]);

	const loadBalance = async () => {
		try {
			setBalanceLoading(true);
			
			// Add timeout to prevent infinite loading
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => reject(new Error('Balance load timeout')), 10000); // 10 second timeout
			});
			
			const balancePromise = checkCreditsAction(0);
			const res = await Promise.race([balancePromise, timeoutPromise]) as any;
			
			// Always set balance even if not allowed (e.g. 0 or insufficient)
			// checkCreditsAction now returns currentCredits even on error/fail usually
			if (typeof res.currentCredits === "number") {
				setBalance(res.currentCredits);
			} else {
				setBalance(0); // Fallback
			}
		} catch (e) {
			console.error('Balance load failed:', e);
			setBalance(0);
		} finally {
			setBalanceLoading(false);
		}
	};

	const handlePurchase = async (credits: number, price: number) => {
		setLoading(String(credits));
		try {
			const { url } = await createCheckoutSessionAction(credits, price);
			if (url) {
				window.location.href = url;
			}
		} catch (err: any) {
			toast.error(err.message || "Failed to start checkout");
		} finally {
			setLoading(null);
		}
	};

	const handleCustomPurchase = async () => {
		const dollars = parseFloat(customAmount);
		if (isNaN(dollars) || dollars < MIN_PURCHASE_DOLLARS) {
			toast.error(`Minimum purchase is $${MIN_PURCHASE_DOLLARS}`);
			return;
		}
		const credits = Math.floor(dollars * CREDITS_PER_DOLLAR);
		await handlePurchase(credits, dollars);
	};

	return (
		<div className="container mx-auto p-8 max-w-5xl space-y-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						AI Credits
					</h1>
					<p className="text-muted-foreground mt-1">
						Pay-as-you-go credits for smart ingestion, resume
						parsing, and AI rewrites.
					</p>
				</div>

				<div className="flex flex-col items-start md:items-end">
					<span className="text-sm font-medium text-muted-foreground">
						Current Balance
					</span>
					<div className="text-3xl font-bold text-foreground flex items-center gap-2 mt-1">
						<Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
						{balanceLoading ? (
							<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
						) : (
							balance !== null ? (
								balance.toLocaleString()
							) : (
								<span className="text-muted-foreground">0</span>
							)
						)}
					</div>
				</div>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				{CREDIT_OPTIONS.map((option) => (
					<Card
						key={option.credits}
						className={`relative flex flex-col ${
							option.popular
								? "border-indigo-500 shadow-lg shadow-indigo-500/10"
								: ""
						}`}
					>
						{option.popular && (
							<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
								MOST POPULAR
							</div>
						)}
						<CardHeader>
							<CardTitle>{option.label}</CardTitle>
							<CardDescription>
								{option.credits.toLocaleString()} Credits
							</CardDescription>
						</CardHeader>
						<CardContent className="flex-1">
							<div className="text-3xl font-bold mb-6">
								${option.price}
							</div>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex items-center gap-2">
									<Check className="w-4 h-4 text-green-500" />
									No expiration date
								</li>
								<li className="flex items-center gap-2">
									<Check className="w-4 h-4 text-green-500" />
									Use for all AI features
								</li>
							</ul>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								variant={option.popular ? "default" : "outline"}
								onClick={() =>
									handlePurchase(option.credits, option.price)
								}
								disabled={loading !== null}
							>
								{loading === String(option.credits) ? (
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<Zap className="w-4 h-4 mr-2" />
								)}
								Buy Now
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>

			{/* Custom Amount */}
			<Card className="mt-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="w-5 h-5" />
						Custom Amount
					</CardTitle>
					<CardDescription>
						Buy any amount of credits ($1 ={" "}
						{CREDITS_PER_DOLLAR.toLocaleString()} credits, minimum $
						{MIN_PURCHASE_DOLLARS})
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4 items-end">
						<div className="flex-1">
							<label className="text-sm font-medium mb-2 block">
								Amount (USD)
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
									$
								</span>
								<input
									type="number"
									min={MIN_PURCHASE_DOLLARS}
									step="1"
									placeholder="10"
									value={customAmount}
									onChange={(e) =>
										setCustomAmount(e.target.value)
									}
									className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
								/>
							</div>
						</div>
						<div className="text-center px-4">
							<div className="text-sm text-muted-foreground">
								You get
							</div>
							<div className="text-xl font-bold text-indigo-600">
								{customAmount &&
								!isNaN(parseFloat(customAmount))
									? Math.floor(
											parseFloat(customAmount) *
												CREDITS_PER_DOLLAR
									  ).toLocaleString()
									: "0"}{" "}
								credits
							</div>
						</div>
						<Button
							onClick={handleCustomPurchase}
							disabled={
								loading !== null ||
								!customAmount ||
								parseFloat(customAmount) < MIN_PURCHASE_DOLLARS
							}
							className="min-w-[120px]"
						>
							{loading === "custom" ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Zap className="w-4 h-4 mr-2" />
							)}
							Buy
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Credit Usage */}
			<Card className="mt-8">
				<CardHeader>
					<CardTitle>Credit Usage</CardTitle>
					<CardDescription>
						How credits are consumed across features
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="divide-y">
						<div className="flex items-center justify-between py-4 first:pt-0">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
									<Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<p className="font-medium">
										Smart Ingestion
									</p>
									<p className="text-sm text-muted-foreground">
										Auto-extract wins from GitHub, LinkedIn
										& more
									</p>
								</div>
							</div>
							<div className="text-right">
								<span className="font-semibold text-lg">
									50
								</span>
								<span className="text-muted-foreground text-sm ml-1">
									/ item
								</span>
							</div>
						</div>

						<div className="flex items-center justify-between py-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
									<FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
								</div>
								<div>
									<p className="font-medium">
										Resume Parsing
									</p>
									<p className="text-sm text-muted-foreground">
										Extract experience & skills from
										uploaded resumes
									</p>
								</div>
							</div>
							<div className="text-right">
								<span className="font-semibold text-lg">
									500
								</span>
								<span className="text-muted-foreground text-sm ml-1">
									/ parse
								</span>
							</div>
						</div>

						<div className="flex items-center justify-between py-4 last:pb-0">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
									<Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
								</div>
								<div>
									<p className="font-medium">AI Rewrite</p>
									<p className="text-sm text-muted-foreground">
										Enhance and refine your content with AI
									</p>
								</div>
							</div>
							<div className="text-right">
								<span className="font-semibold text-lg">
									10
								</span>
								<span className="text-muted-foreground text-sm ml-1">
									/ rewrite
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
