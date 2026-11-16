/**
 * Mobile sticky CTA (.sticky-cta, components.css).
 * Hidden while any element marked [data-sticky-cta-hide] is on screen
 * (the hero buttons, the final CTA banner) — no point in two identical buttons.
 * Hidden state is also `inert`, so its links leave the Tab order.
 */

export function initStickyCta(bar = document.querySelector('.sticky-cta')) {
	if (!bar || !('IntersectionObserver' in window)) return;

	const targets = document.querySelectorAll('[data-sticky-cta-hide]');
	if (!targets.length) return;

	const visible = new Set();
	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) visible.add(entry.target);
			else visible.delete(entry.target);
		}
		const hide = visible.size > 0;
		bar.classList.toggle('is-hidden', hide);
		bar.inert = hide;
	});

	targets.forEach((target) => observer.observe(target));
}
