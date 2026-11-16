/**
 * Block «Розклад» (tuto/schedule): location switch + programme filter.
 *
 * All the data is already in the markup: every slot has
 *   data-program="<programme slug>"
 *   data-location="<location slug> [<location slug>…]" or "unknown"
 * This module only shows the controls (hidden without JS), toggles [hidden] on
 * the slots, marks empty days (.is-empty), today (.is-today) and announces the
 * result. Slots with an unknown location stay visible under every location.
 * The day strip (phones/tablets) gets today highlighted and its empty days disabled.
 *
 * State is mirrored in the URL (?lokatsiia=…&prohrama=…), so a programme page
 * can link straight to its own schedule: /rozklad/?prohrama=anglito
 */
const PARAM_LOCATION = 'lokatsiia';
const PARAM_PROGRAM = 'prohrama';
const ALL = 'all';

/** Ukrainian plural: 1 заняття · 2–4 заняття · 5+ занять (11–14 → занять). */
function lessons(n) {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 >= 1 && mod10 <= 4 && !(mod100 >= 11 && mod100 <= 14)) return `${n} заняття`;
	return `${n} занять`;
}

function initSchedule(block) {
	const controls = block.querySelector('[data-schedule-controls]');
	const slots = [...block.querySelectorAll('[data-schedule-slot]')];
	if (!controls || !slots.length) return;

	const days = [...block.querySelectorAll('[data-schedule-day]')];
	const dayLinks = [...block.querySelectorAll('[data-day-link]')];
	const locationButtons = [...controls.querySelectorAll('[data-filter-location]')];
	const programButtons = [...controls.querySelectorAll('[data-filter-program]')];
	const none = block.querySelector('[data-schedule-none]');
	const status = block.querySelector('[data-schedule-status]');

	const locations = locationButtons.map((b) => b.dataset.filterLocation);
	const programs = programButtons.map((b) => b.dataset.filterProgram);

	const params = new URLSearchParams(window.location.search);
	const state = {
		location: locations.includes(params.get(PARAM_LOCATION)) ? params.get(PARAM_LOCATION) : ALL,
		program: programs.includes(params.get(PARAM_PROGRAM)) ? params.get(PARAM_PROGRAM) : ALL,
	};

	function syncUrl() {
		const url = new URL(window.location.href);
		for (const [key, value] of [[PARAM_LOCATION, state.location], [PARAM_PROGRAM, state.program]]) {
			if (value === ALL) url.searchParams.delete(key);
			else url.searchParams.set(key, value);
		}
		history.replaceState(history.state, '', url);
	}

	function apply({ announce = false } = {}) {
		locationButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filterLocation === state.location)));
		programButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filterProgram === state.program)));

		let total = 0;
		for (const slot of slots) {
			const where = (slot.dataset.location || 'unknown').split(/\s+/);
			const okLocation = state.location === ALL || where.includes('unknown') || where.includes(state.location);
			const okProgram = state.program === ALL || slot.dataset.program === state.program;
			const visible = okLocation && okProgram;
			slot.hidden = !visible;
			if (visible) total += 1;
		}

		for (const day of days) {
			const empty = !day.querySelector('[data-schedule-slot]:not([hidden])');
			day.classList.toggle('is-empty', empty);
			const link = dayLinks.find((l) => l.dataset.dayLink === day.dataset.scheduleDay);
			if (link) {
				if (empty) {
					link.setAttribute('aria-disabled', 'true');
					link.tabIndex = -1;
				} else {
					link.removeAttribute('aria-disabled');
					link.removeAttribute('tabindex');
				}
			}
		}

		// Phones: the chips are a horizontal scroller - keep the active one in view (e.g. ?prohrama=… from a link).
		const active = programButtons.find((b) => b.dataset.filterProgram === state.program);
		const scroller = active?.closest('.tuto-schedule__chips');
		if (scroller && scroller.scrollWidth > scroller.clientWidth) {
			const a = active.getBoundingClientRect();
			const s = scroller.getBoundingClientRect();
			scroller.scrollLeft += a.left - s.left - (s.width - a.width) / 2;
		}

		block.classList.toggle('is-filtered', state.location !== ALL || state.program !== ALL);
		if (none) none.hidden = total > 0;

		if (announce && status) {
			status.textContent = total ? `Показано ${lessons(total)} на тиждень.` : 'За цим вибором занять у розкладі немає.';
		}
	}

	locationButtons.forEach((button) => {
		button.addEventListener('click', () => {
			state.location = button.dataset.filterLocation;
			apply({ announce: true });
			syncUrl();
		});
	});

	programButtons.forEach((button) => {
		button.addEventListener('click', () => {
			// A second click on the active programme turns the filter off.
			const value = button.dataset.filterProgram;
			state.program = value === state.program && value !== ALL ? ALL : value;
			apply({ announce: true });
			syncUrl();
		});
	});

	block.querySelector('[data-schedule-reset]')?.addEventListener('click', () => {
		state.location = ALL;
		state.program = ALL;
		apply({ announce: true });
		syncUrl();
		locationButtons.find((b) => b.dataset.filterLocation === ALL)?.focus();
	});

	// Today: ISO weekday 1 (Mon) … 7 (Sun), as in data-schedule-day.
	const today = ((new Date().getDay() + 6) % 7) + 1;
	const todayEl = days.find((day) => Number(day.dataset.scheduleDay) === today);
	if (todayEl) {
		todayEl.classList.add('is-today');
		todayEl.querySelector('.tuto-schedule__day-name')?.insertAdjacentHTML('beforeend', ' <span class="badge tuto-schedule__today">сьогодні</span>');
	}
	const todayLink = dayLinks.find((l) => Number(l.dataset.dayLink) === today);
	if (todayLink) {
		todayLink.classList.add('is-today');
		todayLink.setAttribute('aria-current', 'date');
		todayLink.querySelector('.visually-hidden')?.append(', сьогодні');
	}

	controls.hidden = false;
	apply();
}

document.querySelectorAll('.tuto-schedule').forEach(initSchedule);
