import moment from "moment";

// Format Date object to string for datetime-local input
export function formatDateForInput(date: Date): string {
	return date.toISOString().slice(0, 16);
}

// Format seconds to "X hours Y minutes Z seconds"
export function formatSecondsToHMS(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = Math.floor(seconds % 60);

	const hoursLabel = hours === 1 ? "hour" : "hours";
	const minutesLabel = minutes === 1 ? "minute" : "minutes";
	const secondsLabel = remainingSeconds === 1 ? "second" : "seconds";

	return `${hours} ${hoursLabel} ${minutes} ${minutesLabel} ${remainingSeconds} ${secondsLabel}`;
}

export function formatDate(date: string) {
	return moment(date).format("MMMM D, YYYY");
}
