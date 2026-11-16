/**
 * Block tuto/day-timeline — «Як проходить день» as a fold-out on phones only
 * (__day--toggle, native <details open>, T-129: a shorter home page on mobile).
 * The markup is open, so tablets, desktops and no-JS look exactly as before; below the
 * width in data-fold-below (e.g. "48em") this module folds it once on load.
 * From that width up the summary is a plain heading (no chevron, not clickable — CSS).
 */
document.querySelectorAll('.tuto-day-timeline__day--toggle[data-fold-below]').forEach((details) => {
	const wide = window.matchMedia(`(min-width: ${details.dataset.foldBelow})`);
	if (!wide.matches) {
		details.open = false;
	}
	// tablets and up: no folding by keyboard either (the mouse is already off via CSS)
	const summary = details.querySelector('summary');
	if (!summary) return;
	if (wide.matches) summary.tabIndex = -1;
	summary.addEventListener('click', (event) => {
		if (wide.matches) event.preventDefault();
	});
});
