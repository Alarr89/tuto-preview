/**
 * Every bear winks when you tap or click it (an easter egg, T-129).
 *
 * All bear drawings (.tuto-bear, assets/svg/bear-*.svg) have two eyes drawn as
 * <circle r="3.6">; the one further right gets .is-winking for one run of the
 * tuto-bear-wink animation (components.css). The bears stay decorative (aria-hidden),
 * so this is pointer-only on purpose. One delegated listener for the whole page.
 */
export function initBearWink() {
	document.addEventListener('click', (event) => {
		const bear = event.target instanceof Element ? event.target.closest('.tuto-bear') : null;
		if (!bear) return;
		const eyes = [...bear.querySelectorAll('circle[r="3.6"]')];
		if (!eyes.length) return;
		const eye = eyes.reduce((right, e) => (Number(e.getAttribute('cx')) > Number(right.getAttribute('cx')) ? e : right));
		if (eye.classList.contains('is-winking')) return;
		eye.classList.add('is-winking');
		eye.addEventListener('animationend', () => eye.classList.remove('is-winking'), { once: true });
	});
}
