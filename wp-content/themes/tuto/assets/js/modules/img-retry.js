/**
 * Retry a photo that failed to load (flaky mobile network, CDN hiccup right after a deploy).
 *
 * One retry per image, after a short pause, with a cache-busting query so the browser does not
 * reuse the failed response. srcset is retried too: the browser picks its candidate again.
 * Images that already failed before this module ran (it is deferred) are caught by
 * `complete && naturalWidth === 0`; later failures by an `error` listener in the capture phase
 * (error events do not bubble).
 */
const RETRY_DELAY = 1200;

function bust(url) {
	if (!url || url.startsWith('data:')) return url;
	return url + (url.includes('?') ? '&' : '?') + 'retry=' + Date.now();
}

function retry(img) {
	if (img.dataset.retried) return;
	img.dataset.retried = '1';
	setTimeout(() => {
		if (img.srcset) {
			img.srcset = img.srcset
				.split(',')
				.map((part) => {
					const [url, ...descriptor] = part.trim().split(/\s+/);
					return [bust(url), ...descriptor].join(' ');
				})
				.join(', ');
		}
		img.src = bust(img.getAttribute('src'));
	}, RETRY_DELAY);
}

export function initImgRetry() {
	document.addEventListener(
		'error',
		(event) => {
			if (event.target instanceof HTMLImageElement) retry(event.target);
		},
		true
	);

	document.querySelectorAll('img').forEach((img) => {
		// lazy images that have not started yet also report complete=false, so they are left alone
		if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) retry(img);
	});
}
