/**
 * Page scroll lock for overlays (mobile menu, booking sheet).
 *
 * Counted, so two overlays can hand over to each other (the menu closes, the sheet
 * opens) without unlocking in between. While locked <html> gets .is-scroll-locked
 * (overflow: hidden, layout.css) and --scrollbar-w = the width of the classic
 * scrollbar that disappears, used as padding so the page does not jump sideways.
 * Overlay scrollbars (phones) have zero width — nothing to compensate.
 */

const root = document.documentElement;
let count = 0;

export function lockScroll() {
	if (count++ > 0) return;
	const scrollbar = window.innerWidth - root.clientWidth;
	root.style.setProperty('--scrollbar-w', `${Math.max(0, scrollbar)}px`);
	root.classList.add('is-scroll-locked');
}

export function unlockScroll() {
	if (count === 0 || --count > 0) return;
	root.classList.remove('is-scroll-locked');
	root.style.removeProperty('--scrollbar-w');
}
