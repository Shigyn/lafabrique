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
      /* Une seule boucle d'animation. Chaque element a une CIBLE (souris +
         defilement) et une position ACTUELLE qui s'en rapproche un peu a
         chaque image : le mouvement glisse au lieu de sauter, et la boucle
         s'arrete d'elle-meme quand tout est immobile. */
      var elements = [].slice.call(scene.querySelectorAll('.couche')).map(function (el) {
        return { el: el, p: parseFloat(el.getAttribute('data-profondeur')) || 0, x: 0, y: 0 };
      });
      var photo = scene.querySelector('.scene-photo');
      var titre = scene.querySelector('.scene-contenu');
      var fond = { x: 0, y: 0 }, texte = { x: 0, y: 0 };
      var sx = 0, sy = 0, actif = false, enRoute = false;

      var cible = function (p) {
        var defil = Math.min(window.scrollY, scene.offsetHeight);
        return { x: -sx * p * 34, y: defil * p * 0.12 - sy * p * 10 };
      };
      var approcher = function (o, c, k) {
        var dx = c.x - o.x, dy = c.y - o.y;
        o.x += dx * k; o.y += dy * k;
        return Math.abs(dx) + Math.abs(dy) > 0.05;
      };
      var image = function () {
        var bouge = false;
        elements.forEach(function (e) {
          if (approcher(e, cible(e.p), 0.075)) bouge = true;
          e.el.style.transform = 'translate3d(' + e.x.toFixed(2) + 'px,' + e.y.toFixed(2) + 'px,0)';
        });
        var defil = Math.min(window.scrollY, scene.offsetHeight);
        if (approcher(fond, { x: -sx * 14, y: defil * 0.28 - sy * 6 }, 0.06)) bouge = true;
        if (photo) photo.style.transform = 'translate3d(' + fond.x.toFixed(2) + 'px,' + fond.y.toFixed(2) + 'px,0) scale(1.06)';
        // le texte recule a peine, dans l'autre sens : l'oeil lit la profondeur
        if (approcher(texte, { x: sx * 8, y: -defil * 0.08 }, 0.07)) bouge = true;
        if (titre) titre.style.transform = 'translate3d(' + texte.x.toFixed(2) + 'px,' + texte.y.toFixed(2) + 'px,0)';
        enRoute = bouge && !document.hidden;
        if (enRoute) requestAnimationFrame(image);
      };
      var relancer = function () { if (actif && !enRoute) { enRoute = true; requestAnimationFrame(image); } };

      // la boucle ne prend la main qu'une fois les couches montees
      setTimeout(function () { scene.classList.add('bouge'); actif = true; relancer(); }, 2100);

      if (window.matchMedia('(hover: hover)').matches) {
        scene.addEventListener('pointermove', function (e) {
          var r = scene.getBoundingClientRect();
          sx = (e.clientX - r.left) / r.width - 0.5;
          sy = (e.clientY - r.top) / r.height - 0.5;
          relancer();
        });
        scene.addEventListener('pointerleave', function () { sx = 0; sy = 0; relancer(); });
      }
      window.addEventListener('scroll', relancer, { passive: true });
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
