/**
 * Block «Програми» (tuto/programs-grid): age filter over the programme cards.
 *
 * Markup: the filter is rendered [hidden] (without JS every card stays visible);
 * buttons <button data-age="all|0-1|1-2|2-4|4-6" aria-pressed>, cards <li data-ages="1-2 2-4">.
 * A card with an empty data-ages (age not known yet) is shown only under «Усі».
 * A hash like #vik-2-4 preselects that age (links from the home age picker).
 */
const ALL = 'all';

for (const block of document.querySelectorAll('.tuto-programs-grid')) {
	const filter = block.querySelector('[data-programs-filter]');
	const list = block.querySelector('[data-programs-list]');
	if (!filter || !list) continue;

	const buttons = [...filter.querySelectorAll('button[data-age]')];
	const items = [...list.querySelectorAll(':scope > [data-ages]')];
	const status = block.querySelector('[data-programs-status]');
	const empty = block.querySelector('[data-programs-empty]');
	if (!buttons.length || !items.length) continue;

	const labelOf = (age) => buttons.find((b) => b.dataset.age === age)?.textContent.replace(/\s+/g, ' ').trim() ?? '';

	// announce = false on the initial «Усі»: the status region stays empty until the user picks an age.
	const apply = (age, { announce = true } = {}) => {
		if (!buttons.some((b) => b.dataset.age === age)) return false;
		let shown = 0;
		for (const item of items) {
			const ages = item.dataset.ages.split(/\s+/).filter(Boolean);
			const visible = age === ALL || ages.includes(age);
			item.hidden = !visible;
			if (visible) shown += 1;
		}
		for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.age === age));
		list.classList.toggle('is-filtered', age !== ALL);
		if (empty) empty.hidden = shown > 0;
		if (status && announce) {
			status.textContent = age === ALL ? `Усі програми: ${items.length}` : `Вік ${labelOf(age)}: ${shown} з ${items.length} програм`;
		}
		return true;
	};

	filter.hidden = false;
	filter.addEventListener('click', (event) => {
		const button = event.target.closest('button[data-age]');
		if (button) apply(button.dataset.age);
	});

	const fromHash = () => {
		const match = /^#vik-(\d-\d)$/.exec(location.hash);
		return match && apply(match[1]);
	};
	if (!fromHash()) apply(ALL, { announce: false });
	window.addEventListener('hashchange', fromHash);
}
