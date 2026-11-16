/**
 * Block «Локації» (tuto/locations): one Google map for both locations, loaded only on request (D-14).
 *
 * Used on «Контакти». Until a click there is no request to Google: the map frame holds a
 * static brand placeholder. «Показати на карті» in a card (or «Показати карту» on the
 * placeholder) inserts the embed iframe; the card buttons then switch it between locations.
 * Without JS the map and the card buttons stay hidden and the «Маршрут» links do the job.
 * On the home page the block has no map markup, so this module does nothing there.
 *
 * Markup:
 *   [data-locations-map]
 *     button[data-map-src][data-map-label][aria-pressed] hidden   (one per card)
 *     [data-map] hidden
 *       [data-map-frame] > placeholder … button[data-map-load]
 *       [data-map-status]                                        (aria-live)
 */
const MAP_URL = /^https:\/\/(www\.)?google\.[a-z.]+\/maps/;

function initMap(root) {
	const map = root.querySelector('[data-map]');
	const frame = root.querySelector('[data-map-frame]');
	const choices = [...root.querySelectorAll('[data-map-src]')].filter((c) => MAP_URL.test(c.dataset.mapSrc));
	const loadButton = root.querySelector('[data-map-load]');
	const status = root.querySelector('[data-map-status]');
	if (!map || !frame || !choices.length) return;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let iframe = null;

	function show(choice) {
		const src = choice.dataset.mapSrc;
		const label = choice.dataset.mapLabel || choice.textContent.trim();

		choices.forEach((c) => c.setAttribute('aria-pressed', String(c === choice)));

		if (!iframe) {
			iframe = document.createElement('iframe');
			iframe.referrerPolicy = 'strict-origin-when-cross-origin';
			iframe.allowFullscreen = true;
			frame.replaceChildren(iframe);
			root.classList.add('is-map-loaded');
		}
		iframe.title = `Карта: ${label}`;
		if (iframe.src !== src) iframe.src = src;

		if (status) status.textContent = `Показано на карті: ${label}.`;
	}

	choices.forEach((choice) => {
		choice.hidden = false;
		choice.addEventListener('click', () => {
			show(choice);
			// The map sits under the cards: bring it into view (on phones it is a screen below).
			map.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
		});
	});

	if (loadButton) {
		loadButton.addEventListener('click', () => {
			show(choices[0]);
			// The button disappears with the placeholder: keep focus on the map region.
			map.focus({ preventScroll: true });
		});
	}

	map.hidden = false;
}

document.querySelectorAll('[data-locations-map]').forEach(initMap);
