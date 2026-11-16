/**
 * Block «Відгуки» (tuto/reviews-slider): accessible carousel on top of CSS scroll-snap.
 *
 * Without JS the track is a horizontally scrollable list with snap points.
 * With JS: prev/next buttons (disabled at the ends), ← → / Home / End on the
 * focused track, slides outside the viewport are hidden from AT (aria-hidden)
 * and their links leave the Tab order. No autoplay. Smooth scrolling only when
 * prefers-reduced-motion is not set.
 *
 * Markup: .tuto-reviews-slider [data-carousel] (role=region, aria-roledescription=carousel —
 *   the controls are inside the region)
 *   [data-carousel-track] > ul > li > figure[data-carousel-slide][role=group][aria-roledescription=slide]
 *   button[data-carousel-prev][hidden] · button[data-carousel-next][hidden]
 *   [data-carousel-status] (visually hidden live region)
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initCarousel(root) {
	const track = root.querySelector('[data-carousel-track]');
	const slides = [...root.querySelectorAll('[data-carousel-slide]')];
	const prev = root.querySelector('[data-carousel-prev]');
	const next = root.querySelector('[data-carousel-next]');
	const status = root.querySelector('[data-carousel-status]');
	if (!track || !slides.length || !prev || !next) return;

	prev.hidden = false;
	next.hidden = false;
	root.classList.add('is-enhanced');

	const behavior = () => (reduceMotion.matches ? 'auto' : 'smooth');

	// Slides whose box is (almost) fully inside the track viewport.
	function visibleIndexes() {
		const box = track.getBoundingClientRect();
		return slides
			.map((slide, i) => {
				const r = slide.getBoundingClientRect();
				const shown = Math.min(r.right, box.right) - Math.max(r.left, box.left);
				return shown / r.width > 0.6 ? i : -1;
			})
			.filter((i) => i !== -1);
	}

	function scrollToSlide(index) {
		const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
		const offset = target.offsetLeft - slides[0].offsetLeft;
		track.scrollTo({ left: offset, behavior: behavior() });
	}

	let lastAnnounced = '';
	let announce = false; // speak only after the user moved the carousel
	function update() {
		const shown = visibleIndexes();
		const first = shown[0] ?? 0;
		const last = shown[shown.length - 1] ?? first;
		const max = track.scrollWidth - track.clientWidth;

		prev.disabled = track.scrollLeft <= 2;
		next.disabled = track.scrollLeft >= max - 2;

		slides.forEach((slide, i) => {
			const hidden = !shown.includes(i);
			slide.setAttribute('aria-hidden', String(hidden));
			slide.inert = hidden;
		});

		if (status && announce) {
			const text = first === last
				? `Відгук ${first + 1} з ${slides.length}`
				: `Відгуки ${first + 1}–${last + 1} з ${slides.length}`;
			if (text !== lastAnnounced) {
				status.textContent = text;
				lastAnnounced = text;
			}
		}
	}

	prev.addEventListener('click', () => {
		announce = true;
		const shown = visibleIndexes();
		scrollToSlide((shown[0] ?? 0) - Math.max(1, shown.length));
	});

	next.addEventListener('click', () => {
		announce = true;
		const shown = visibleIndexes();
		scrollToSlide((shown[0] ?? 0) + Math.max(1, shown.length));
	});

	track.addEventListener('keydown', (event) => {
		if (event.target !== track) return;
		const first = visibleIndexes()[0] ?? 0;
		const map = { ArrowLeft: first - 1, ArrowRight: first + 1, Home: 0, End: slides.length - 1 };
		if (!(event.key in map)) return;
		event.preventDefault();
		announce = true;
		scrollToSlide(map[event.key]);
	});

	let frame = 0;
	const schedule = () => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(update);
	};
	track.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	update();
}

document.querySelectorAll('.tuto-reviews-slider [data-carousel]').forEach(initCarousel);
