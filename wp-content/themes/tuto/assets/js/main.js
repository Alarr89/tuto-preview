// Theme entry ES module (every page). Block scripts are separate modules (blocks/<name>/script.js).
import { initSiteMenu } from './modules/site-menu.js';
import { initStickyCta } from './modules/sticky-cta.js';
import { initBookingSheet } from './modules/booking-sheet.js';
import { initImgRetry } from './modules/img-retry.js';
import { initBearWink } from './modules/bear-wink.js';

document.documentElement.classList.add('js');

initSiteMenu();
initStickyCta();
initBookingSheet();
initImgRetry();
initBearWink();
