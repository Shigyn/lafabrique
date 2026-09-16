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

  /* scene d'accueil : le titre se decoupe et les couches montent, puis
     chaque couche suit la souris et le defilement a sa propre vitesse
     (data-profondeur). Rien ne bouge si l'utilisateur l'a demande. */
  var scene = document.querySelector('[data-scene]');
  if (scene) {
    var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(function () { requestAnimationFrame(function () { scene.classList.add('pret'); }); });

    if (!calme) {
      var couches = [].slice.call(scene.querySelectorAll('.couche'));
      var photo = scene.querySelector('.scene-photo');
      var sx = 0, sy = 0, prevu = false;
      setTimeout(function () { scene.classList.add('bouge'); }, 2200);

      var peindre = function () {
        prevu = false;
        var defil = Math.min(window.scrollY, scene.offsetHeight);
        couches.forEach(function (c) {
          var p = parseFloat(c.getAttribute('data-profondeur')) || 0;
          c.style.setProperty('--dx', (-sx * p * 26).toFixed(1) + 'px');
          c.style.setProperty('--dy', (defil * p * 0.12 + sy * p * 8).toFixed(1) + 'px');
        });
        if (photo) photo.style.transform = 'translate3d(' + (-sx * 10).toFixed(1) + 'px,' + (defil * 0.3).toFixed(1) + 'px,0) scale(1.04)';
      };
      var demander = function () { if (!prevu) { prevu = true; requestAnimationFrame(peindre); } };

      if (window.matchMedia('(hover: hover)').matches) {
        scene.addEventListener('pointermove', function (e) {
          var r = scene.getBoundingClientRect();
          sx = (e.clientX - r.left) / r.width - 0.5;
          sy = (e.clientY - r.top) / r.height - 0.5;
          demander();
        });
      }
      window.addEventListener('scroll', demander, { passive: true });
      peindre();
    }
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
