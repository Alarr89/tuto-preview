/**
 * Block tuto/faq — progressive enhancement only.
 * The accordion itself is native <details name="faq">; this module:
 *  - opens the question a link points to (#id on a .tuto-faq__item, on load and on hashchange);
 *  - keeps the accordion exclusive in browsers without support for <details name>.
 */
const ITEM = '.tuto-faq__item';

function openFromHash() {
	const id = decodeURIComponent( window.location.hash.slice( 1 ) );
	if ( ! id ) {
		return;
	}
	const target = document.getElementById( id );
	const item = target?.closest( ITEM );
	if ( item && ! item.open ) {
		item.open = true;
		item.scrollIntoView( { block: 'start' } );
	}
}

const supportsName = 'name' in HTMLDetailsElement.prototype;

if ( ! supportsName ) {
	document.addEventListener(
		'toggle',
		( event ) => {
			const item = event.target;
			if ( ! ( item instanceof HTMLDetailsElement ) || ! item.matches( ITEM ) || ! item.open ) {
				return;
			}
			const group = item.getAttribute( 'name' );
			if ( ! group ) {
				return;
			}
			document.querySelectorAll( `${ ITEM }[name="${ CSS.escape( group ) }"][open]` ).forEach( ( other ) => {
				if ( other !== item ) {
					other.open = false;
				}
			} );
		},
		true
	);
}

openFromHash();
window.addEventListener( 'hashchange', openFromHash );
