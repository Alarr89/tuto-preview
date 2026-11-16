/**
 * Mobile menu of the site header (< 1024px).
 *
 * Without JS the header shows a link to the footer menu (#footer-nav).
 * With JS that link is swapped for a <button aria-expanded> that opens the
 * navigation as a dropdown panel: focus moves inside, Tab is trapped between the
 * button and the panel, Esc / backdrop click / link click close it and focus
 * returns to the button. While open the page does not scroll (scroll-lock.js) and
 * <html> has .is-menu-open (layout.css hides the sticky CTA).
 *
 * Markup: header.site-header [data-site-menu]
 *   a[data-site-menu-fallback] · button[data-site-menu-toggle][hidden]
 *   nav#site-nav.site-nav · div[data-site-menu-backdrop][hidden]
 */

import { lockScroll, unlockScroll } from './scroll-lock.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const DESKTOP = window.matchMedia('(min-width: 64em)');

export function initSiteMenu(root = document.querySelector('[data-site-menu]')) {
	if (!root) return;

	const toggle = root.querySelector('[data-site-menu-toggle]');
	const fallback = root.querySelector('[data-site-menu-fallback]');
	const panel = document.getElementById(toggle?.getAttribute('aria-controls') ?? '');
	const backdrop = root.querySelector('[data-site-menu-backdrop]');
	if (!toggle || !panel) return;

	if (fallback) fallback.hidden = true;
	toggle.hidden = false;

	const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

	function open() {
		if (isOpen()) return;
		toggle.setAttribute('aria-expanded', 'true');
		root.classList.add('is-open');
		document.documentElement.classList.add('is-menu-open');
		lockScroll();
		if (backdrop) backdrop.hidden = false;
		panel.querySelector(FOCUSABLE)?.focus();
		document.addEventListener('keydown', onKeydown);
	}

	function close({ returnFocus = true } = {}) {
		if (!isOpen()) return;
		toggle.setAttribute('aria-expanded', 'false');
		root.classList.remove('is-open');
		document.documentElement.classList.remove('is-menu-open');
		unlockScroll();
		if (backdrop) backdrop.hidden = true;
		document.removeEventListener('keydown', onKeydown);
		if (returnFocus) toggle.focus({ preventScroll: true }); /* no jump: scroll-padding would pull the page */
	}

	function onKeydown(event) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
			return;
		}
		if (event.key !== 'Tab') return;

		// Focus trap: cycle through the toggle button + every visible focusable element of the panel.
		const items = [toggle, ...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
		const index = items.indexOf(document.activeElement);
		const step = event.shiftKey ? -1 : 1;
		event.preventDefault();
		items[(index + step + items.length) % items.length].focus();
	}

	toggle.addEventListener('click', () => (isOpen() ? close() : open()));
	backdrop?.addEventListener('click', () => close());

	// Same-page links (#…) close the menu; focus follows the link, not the button.
	panel.addEventListener('click', (event) => {
		if (isOpen() && event.target.closest('a')) close({ returnFocus: false });
	});

	// Growing to desktop shows the inline menu — drop the mobile state.
	DESKTOP.addEventListener('change', (event) => {
		if (event.matches && isOpen()) close({ returnFocus: false });
	});
}
