type  MessageProps = {
	role: "user" | "bot";
	content: string;
}

export default function Message({ role, content }: MessageProps) {
	return (
		<div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-2`}>
			<div
				className={`max-w-xs p-3 rounded-lg ${
					role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
				}`}
			>
				<p className="text-sm">
					<strong>{role === "user" ? "You" : "Bot"}:</strong> {content}
				</p>
			</div>
		</div>
	);
}
