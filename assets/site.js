// La Fabrique du Maquettiste : menu mobile, galerie des fiches,
// apparitions au defilement, formulaire de commande pre-rempli.
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* menu mobile */
  var bouton = document.querySelector('.menu-bouton');
  var menu = document.getElementById('menu');
  if (bouton && menu) {
    bouton.addEventListener('click', function () {
      var ouvert = menu.toggleAttribute('data-ouvert');
      bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
  }

  /* galerie d'une fiche : la vignette choisie passe en grand */
  document.querySelectorAll('[data-galerie]').forEach(function (g) {
    var grande = g.querySelector('.galerie-grande img');
    g.querySelectorAll('.vignette').forEach(function (v) {
      v.addEventListener('click', function () {
        grande.src = v.getAttribute('data-grande');
        g.querySelectorAll('.vignette').forEach(function (x) { x.removeAttribute('aria-current'); });
        v.setAttribute('aria-current', 'true');
      });
    });
  });

  /* apparitions : sans IntersectionObserver, tout reste visible */
  var aReveler = document.querySelectorAll('.reveler');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    aReveler.forEach(function (el) { obs.observe(el); });
  } else {
    aReveler.forEach(function (el) { el.classList.add('vu'); });
  }

  /* formulaire : la creation vient de la fiche (?creation=...), et l'envoi
     ouvre la messagerie avec un message deja redige */
  var form = document.querySelector('[data-formulaire]');
  if (form) {
    var creation = new URLSearchParams(location.search).get('creation');
    var champ = form.querySelector('[data-creation]');
    if (creation && champ) champ.value = creation;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var sujet = 'Demande' + (d.get('creation') ? ' : ' + d.get('creation') : '');
      var corps = d.get('message') + '\n\n' + d.get('nom') + '\n' + d.get('coordonnees');
      location.href = form.getAttribute('action') + '?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(corps);
    });
  }
})();
