/**
 * Block «Галерея» (tuto/gallery): photo viewer on a native <dialog>.
 *
 * Progressive enhancement: without JS the grid is just figures with captions.
 * With JS every photo is wrapped in a <button> that opens a full-screen viewer
 * (focus trap and Esc come from showModal(); focus goes back to the photo on close). ← → switch photos,
 * a click on the backdrop closes it. Uses img[data-full] when present.
 */
const ICONS = new URL('../../assets/svg/icons.svg', import.meta.url).href;

const icon = (name) =>
	`<svg class="btn__icon" aria-hidden="true" focusable="false"><use href="${ICONS}#${name}"/></svg>`;

function createViewer() {
	const dialog = document.createElement('dialog');
	dialog.className = 'tuto-gallery__dialog';
	dialog.setAttribute('aria-label', 'Перегляд фото');
	dialog.innerHTML = `
		<div class="tuto-gallery__bar">
			<p class="tuto-gallery__counter" aria-live="polite" data-gallery-counter></p>
			<button class="btn btn--icon" type="button" aria-label="Закрити перегляд" data-gallery-close>${icon('i-close')}</button>
		</div>
		<figure class="tuto-gallery__view">
			<img alt="" decoding="async" data-gallery-img>
			<figcaption data-gallery-caption></figcaption>
		</figure>
		<div class="tuto-gallery__nav">
			<button class="btn btn--icon" type="button" aria-label="Попереднє фото" data-gallery-prev>${icon('i-arrow-left')}</button>
			<button class="btn btn--icon" type="button" aria-label="Наступне фото" data-gallery-next>${icon('i-arrow-right')}</button>
		</div>`;
	document.body.append(dialog);
	return dialog;
}

for (const block of document.querySelectorAll('.tuto-gallery')) {
	const figures = [...block.querySelectorAll('.tuto-gallery__item figure')].filter((figure) => figure.querySelector('img'));
	if (!figures.length || typeof HTMLDialogElement !== 'function') continue;

	const photos = figures.map((figure) => {
		const img = figure.querySelector('img');
		return {
			img,
			src: img.dataset.full || img.currentSrc || img.src,
			alt: img.alt,
			caption: figure.querySelector('figcaption')?.textContent.trim() ?? '',
		};
	});

	let dialog = null;
	let opener = null;
	let current = 0;

	const show = (index) => {
		current = (index + photos.length) % photos.length;
		const photo = photos[current];
		const view = dialog.querySelector('[data-gallery-img]');
		view.src = photo.src;
		view.alt = photo.alt;
		const caption = dialog.querySelector('[data-gallery-caption]');
		caption.textContent = photo.caption;
		caption.hidden = !photo.caption;
		dialog.querySelector('[data-gallery-counter]').textContent = `Фото ${current + 1} з ${photos.length}`;
	};

	const open = (index, button) => {
		opener = button;
		if (!dialog) {
			dialog = createViewer();
			const single = photos.length < 2;
			dialog.querySelector('.tuto-gallery__nav').hidden = single;
			dialog.querySelector('[data-gallery-close]').addEventListener('click', () => dialog.close());
			dialog.querySelector('[data-gallery-prev]').addEventListener('click', () => show(current - 1));
			dialog.querySelector('[data-gallery-next]').addEventListener('click', () => show(current + 1));
			dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
			dialog.addEventListener('click', (event) => {
				if (event.target === dialog) dialog.close();
			});
			dialog.addEventListener('keydown', (event) => {
				if (single) return;
				if (event.key === 'ArrowLeft') show(current - 1);
				else if (event.key === 'ArrowRight') show(current + 1);
				else return;
				event.preventDefault();
			});
		}
		show(index);
		dialog.showModal();
	};

	photos.forEach(({ img, alt }, index) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'tuto-gallery__open';
		button.setAttribute('aria-haspopup', 'dialog');
		button.setAttribute('aria-label', alt ? `Відкрити фото: ${alt}` : `Відкрити фото ${index + 1}`);
		img.replaceWith(button);
		button.append(img);
		button.addEventListener('click', () => open(index, button));
	});
}
