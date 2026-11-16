/**
 * Booking sheet: «Записатися» without the jump to the bottom of the page.
 *
 * Every link whose href ends with #zapys (header, sticky CTA, hero, plan cards…)
 * opens the native <dialog id="booking-sheet"> instead of scrolling to the CTA
 * banner: a bottom sheet on phones, a small centred modal from 768px (layout.css).
 * Without JS (or without <dialog> support) the links stay plain anchors to #zapys.
 *
 * - showModal(): focus goes inside, the rest of the page is inert, Esc closes
 *   (native «cancel»); a click on the backdrop and [data-booking-close] close too.
 * - Page scroll is locked while open (scroll-lock.js); focus returns to the link
 *   that opened it (or to the menu button when that link was in the closed menu).
 * - Optional context: data-booking-context="Місячний абонемент, 20 днів" on the
 *   link shows «Ви обрали: …» in the sheet.
 * - Modified clicks (Ctrl/Cmd/Shift, middle button) keep the browser default.
 *
 * Markup: dialog#booking-sheet.booking-sheet (design/*.html, footer.php in WP).
 */

import { lockScroll, unlockScroll } from './scroll-lock.js';

const TRIGGER = 'a[href$="#zapys"]';

export function initBookingSheet(dialog = document.getElementById('booking-sheet')) {
	if (!dialog || typeof dialog.showModal !== 'function') return;

	const choice = dialog.querySelector('[data-booking-choice]');
	const choiceText = dialog.querySelector('[data-booking-choice-text]');
	let opener = null;

	function open(link) {
		if (dialog.open) return;
		opener = link;

		const context = link.dataset.bookingContext?.trim();
		if (choice && choiceText) {
			choiceText.textContent = context ?? '';
			choice.hidden = !context;
		}

		lockScroll();
		dialog.showModal();
	}

	function restoreFocus() {
		const visible = (el) => el && el.isConnected && el.getClientRects().length > 0;
		const target = visible(opener) ? opener : document.querySelector('[data-site-menu-toggle]');
		if (visible(target)) target.focus({ preventScroll: true });
		opener = null;
	}

	document.addEventListener('click', (event) => {
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const link = event.target.closest(TRIGGER);
		if (!link || dialog.contains(link)) return;

		event.preventDefault();
		open(link);
	});

	dialog.addEventListener('close', () => {
		unlockScroll();
		restoreFocus();
	});

	dialog.addEventListener('click', (event) => {
		// The dialog box itself has no padding: a click that lands on it is a click on ::backdrop.
		if (event.target === dialog || event.target.closest('[data-booking-close]')) dialog.close();
	});
}
