"use client";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";


const Error = () => {
	return (
		<>
			<div className="h-full pt-52 flex flex-col items-center justify-center space-y-4">
				<Image src="/error.png" height="400" width="400" alt="Error" className="block dark:hidden" />

				<Image src="/error-dark.png" height="400" width="400" className="hidden dark:block" alt="Error" />
				<h2 className="text-xl font-medium">Something went wrong!</h2>
				<Button asChild>
					<Link href="/">Go back</Link>
				</Button>
			</div>
		</>
	);
};

export default Error;
