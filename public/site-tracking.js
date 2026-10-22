// Personal portfolio measurement. No form values, query strings or fragments.
(function () {
  if (location.hostname !== 'portfolio.hossainconsulting.com') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-HS1897RD72', {
    page_location: location.origin + location.pathname,
    page_referrer: document.referrer ? new URL(document.referrer).origin : '',
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-HS1897RD72';
  document.head.appendChild(ga);
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  var gtm = document.createElement('script');
  gtm.async = true;
  gtm.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-PML7PHT5';
  document.head.appendChild(gtm);
})();
