/**
 * Accessible tabs (WAI-ARIA Tabs pattern, automatic activation).
 *
 * Progressive enhancement: without JS the "tabs" are plain links to the panels
 * (href="#panel-id") and every panel is visible as a list. initTabs() adds the
 * roles, aria-selected / aria-controls / aria-labelledby, roving tabindex and
 * hides the inactive panels.
 *
 * Keys: ← → (and ↑ ↓ for vertical lists), Home, End.
 *
 * Markup:
 *   <div data-tablist data-tablist-label="…">  (becomes aria-label with role=tablist)
 *     <a href="#p1" data-tab>…</a> <a href="#p2" data-tab>…</a>
 *   </div>
 *   <div id="p1" data-tabpanel>…</div> <div id="p2" data-tabpanel>…</div>
 *
 * @param {HTMLElement} root     Element that contains the tablist and the panels.
 * @param {object}      options  { onChange(index, tab, panel) }
 * @returns {{ select: Function, selectById: Function } | null}
 */
export function initTabs(root, { onChange } = {}) {
	const list = root?.querySelector('[data-tablist]');
	if (!list) return null;

	const tabs = [...list.querySelectorAll('[data-tab]')];
	const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls') || tab.hash?.slice(1) || ''));
	if (!tabs.length || panels.some((panel) => !panel)) return null;

	const vertical = list.getAttribute('aria-orientation') === 'vertical';
	let current = -1;

	list.setAttribute('role', 'tablist');
	// The label belongs to the tablist role: set it only together with the role.
	if (list.dataset.tablistLabel) list.setAttribute('aria-label', list.dataset.tablistLabel);
	tabs.forEach((tab, i) => {
		const panel = panels[i];
		tab.id ||= `${panel.id}-tab`;
		tab.setAttribute('role', 'tab');
		tab.setAttribute('aria-controls', panel.id);
		panel.setAttribute('role', 'tabpanel');
		panel.setAttribute('aria-labelledby', tab.id);
		panel.tabIndex = 0;
	});

	function select(index, { focus = false } = {}) {
		const next = (index + tabs.length) % tabs.length;
		tabs.forEach((tab, i) => {
			const active = i === next;
			tab.setAttribute('aria-selected', String(active));
			tab.tabIndex = active ? 0 : -1;
			panels[i].hidden = !active;
		});
		if (focus) tabs[next].focus();
		if (next !== current) {
			current = next;
			onChange?.(next, tabs[next], panels[next]);
		}
	}

	function selectById(panelId, opts) {
		const index = panels.findIndex((panel) => panel.id === panelId);
		if (index === -1) return false;
		select(index, opts);
		return true;
	}

	list.addEventListener('click', (event) => {
		const tab = event.target.closest('[data-tab]');
		if (!tab) return;
		event.preventDefault();
		select(tabs.indexOf(tab));
	});

	list.addEventListener('keydown', (event) => {
		const i = tabs.indexOf(event.target.closest('[data-tab]'));
		if (i === -1) return;
		const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
		const next = vertical ? 'ArrowDown' : 'ArrowRight';
		const map = { [prev]: i - 1, [next]: i + 1, Home: 0, End: tabs.length - 1 };
		if (!(event.key in map)) return;
		event.preventDefault();
		select(map[event.key], { focus: true });
	});

	const initial = Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'));
	select(initial);
	root.classList.add('is-enhanced');

	return { select, selectById };
}
