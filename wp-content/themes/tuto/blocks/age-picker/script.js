/**
 * Block «Вибір за віком» (tuto/age-picker): age tabs → matching programmes.
 * Without JS the tabs are anchor links and all panels are visible one after another.
 * Links anywhere on the page to a panel (#vik-2-4: the age chips in the hero, the
 * «Малюку вже рік?» card) select that tab, scroll to the block and focus the panel —
 * also on a repeated click on the same link (no hashchange then).
 */
import { initTabs } from '../../assets/js/modules/tabs.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

for (const block of document.querySelectorAll('.tuto-age-picker')) {
	const tabs = initTabs(block);
	if (!tabs) continue;

	const open = (id, { focusPanel = false } = {}) => {
		if (!id || !tabs.selectById(id)) return false;
		block.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
		if (focusPanel) document.getElementById(id)?.focus({ preventScroll: true });
		return true;
	};

	open(decodeURIComponent(location.hash.slice(1)));
	window.addEventListener('hashchange', () => open(decodeURIComponent(location.hash.slice(1))));

	document.addEventListener('click', (event) => {
		const link = event.target.closest('a[href^="#vik-"]');
		if (!link || link.closest('[data-tablist]')) return; // the tabs handle their own clicks
		const id = decodeURIComponent(link.hash.slice(1));
		if (!open(id, { focusPanel: true })) return;
		event.preventDefault();
		history.replaceState(null, '', `#${id}`);
	});
}
