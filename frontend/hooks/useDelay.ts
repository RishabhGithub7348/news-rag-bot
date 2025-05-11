import { useCallback } from "react";

export const useDelay = () => {
	const delay = useCallback((ms: number) => {
		return new Promise<void>((resolve) => {
			const start = performance.now();
			const step = (timestamp: number) => {
				if (timestamp - start >= ms) {
					resolve();
				} else {
					requestAnimationFrame(step);
				}
			};
			requestAnimationFrame(step);
		});
	}, []);

	return delay;
};
