// Ported from reach-of-surrentum.jsx (lines 1574-1585).

export function createPrefersReducedMotion() {
	let reduce = $state(false);

	$effect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return;
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => {
			reduce = mq.matches;
		};
		update();
		mq.addEventListener?.("change", update);
		return () => mq.removeEventListener?.("change", update);
	});

	return {
		get value() {
			return reduce;
		},
	};
}
