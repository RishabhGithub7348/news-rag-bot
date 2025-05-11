import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers";

export const metadata: Metadata = {
	title: "News Chatbot",
	description: "A RAG-powered chatbot for news queries",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (

		<html lang="en">
			<body className="bg-gray-100">
				<Providers>
					{children}
				</Providers>
			</body>
		</html>

	);
}