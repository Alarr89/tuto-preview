/**
 * Block tuto/anchor-nav — progressive enhancement for the sticky row of anchor chips.
 *
 * Without JS the chips are plain in-page links. With JS:
 *  - the chip of the section crossing a reading line (25% from the top of the viewport)
 *    gets aria-current="location" (styled by .chip[aria-current] in components.css);
 *  - the active chip is scrolled into view inside the row (horizontal only, the page
 *    itself never jumps); smooth only without prefers-reduced-motion;
 *  - .is-stuck is toggled while the row is stuck under the header (soft shadow).
 */
const reduceMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' );

function initAnchorNav( nav ) {
	const list = nav.querySelector( '.tuto-anchor-nav__list' );
	const links = [ ...nav.querySelectorAll( 'a[href^="#"]' ) ];
	const pairs = links
		.map( ( link ) => {
			const id = decodeURIComponent( link.hash.slice( 1 ) );
			const section = id ? document.getElementById( id ) : null;
			return section ? { link, section } : null;
		} )
		.filter( Boolean );
	if ( ! list || ! pairs.length || ! ( 'IntersectionObserver' in window ) ) {
		return;
	}

	let current = null;
	function setActive( link ) {
		if ( link === current ) {
			return;
		}
		current?.removeAttribute( 'aria-current' );
		current = link;
		if ( ! link ) {
			return;
		}
		link.setAttribute( 'aria-current', 'location' );
		// Keep the active chip visible in the horizontally scrolling row (phones).
		if ( list.scrollWidth > list.clientWidth ) {
			const item = link.parentElement;
			const left = item.offsetLeft - ( list.clientWidth - item.offsetWidth ) / 2;
			list.scrollTo( { left: Math.max( 0, left ), behavior: reduceMotion.matches ? 'auto' : 'smooth' } );
		}
	}

	// Sections crossing a thin line at 25% of the viewport height.
	const crossing = new Set();
	const sectionObserver = new IntersectionObserver(
		( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting ) {
					crossing.add( entry.target );
				} else {
					crossing.delete( entry.target );
				}
			} );
			// Last one in document order wins (nested or adjacent sections).
			const active = pairs.filter( ( pair ) => crossing.has( pair.section ) ).pop();
			setActive( active ? active.link : null );
		},
		{ rootMargin: '-25% 0px -74% 0px' }
	);
	pairs.forEach( ( pair ) => sectionObserver.observe( pair.section ) );

	// Stuck state: the row's in-flow position (an empty sentinel right before it) has
	// scrolled above the sticky offset. A zero-height IntersectionObserver target proved
	// unreliable in mobile emulation, so this is a cheap rAF-throttled scroll check.
	const sentinel = document.createElement( 'div' );
	sentinel.setAttribute( 'aria-hidden', 'true' );
	nav.before( sentinel );
	const offset = () => parseFloat( getComputedStyle( nav ).marginTop ) || 0;
	let frame = 0;
	const checkStuck = () => {
		frame = 0;
		const top = parseFloat( getComputedStyle( nav ).top ) || 0;
		nav.classList.toggle( 'is-stuck', sentinel.getBoundingClientRect().top + offset() < top - 0.5 );
	};
	window.addEventListener(
		'scroll',
		() => {
			frame ||= requestAnimationFrame( checkStuck );
		},
		{ passive: true }
	);
	checkStuck();
}

document.querySelectorAll( '[data-anchor-nav]' ).forEach( initAnchorNav );
