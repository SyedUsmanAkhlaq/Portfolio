/*
 * One icon family for the whole page: Lucide outlines (ISC licence) drawn at an
 * absolute stroke, so a 14px and a 22px icon share one line weight. Play and
 * pause are solids, because thin outlines go wiry inside a tinted button.
 * Usage in markup: <i data-icon="mail" data-size="16"></i>
 */
(function () {
  var STROKE = {
    'check-solid': ['M20 6 9 17l-5-5'],
    'arrow-up-right': ['M7 7h10v10', 'M7 17 17 7'],
    'arrow-up': ['m5 12 7-7 7 7', 'M12 19V5'],
    lock: ['M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z', 'M7 11V7a5 5 0 0 1 10 0v4'],
    bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
    speaker: ['M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z', 'M16 9a5 5 0 0 1 0 6', 'M19.364 18.364a9 9 0 0 0 0-12.728'],
    chat: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
    phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'],
    mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'],
    back: ['M19 20 9 12l10-8v16z', 'M5 19V5'],
    fwd: ['m5 4 10 8-10 8V4z', 'M19 5v14']
  };
  // Solids on a 16 box (from the Stageshow kit's filled set)
  var SOLID = {
    play: 'M4.5 2.6v10.8a.8.8 0 0 0 1.2.7l8.6-5.4a.8.8 0 0 0 0-1.4L5.7 1.9a.8.8 0 0 0-1.2.7Z',
    pause: 'M4 2.5h2.6a.6.6 0 0 1 .6.6v9.8a.6.6 0 0 1-.6.6H4a.6.6 0 0 1-.6-.6V3.1a.6.6 0 0 1 .6-.6Zm5.4 0H12a.6.6 0 0 1 .6.6v9.8a.6.6 0 0 1-.6.6H9.4a.6.6 0 0 1-.6-.6V3.1a.6.6 0 0 1 .6-.6Z'
  };
  var NS = 'http://www.w3.org/2000/svg';

  function build(name, size) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'icon');
    if (SOLID[name]) {
      svg.setAttribute('viewBox', '0 0 16 16');
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', SOLID[name]);
      p.setAttribute('fill', 'currentColor');
      svg.appendChild(p);
      return svg;
    }
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    // Absolute stroke: 1.6 screen px whatever the size
    svg.setAttribute('stroke-width', String((1.6 * 24) / size));
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    (STROKE[name] || []).forEach(function (d) {
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      svg.appendChild(path);
    });
    return svg;
  }

  document.querySelectorAll('i[data-icon]').forEach(function (el) {
    var size = Number(el.getAttribute('data-size') || 16);
    el.replaceWith(build(el.getAttribute('data-icon'), size));
  });

  // iOS status bar glyphs, from the Stageshow kit (Apple's iOS UI kit geometry)
  var STATUS =
    '<span class="phone__time">9:41</span><span class="phone__glyphs">' +
    '<svg viewBox="0 0 20.33 13.67" width="17" height="11.4" aria-hidden="true"><rect x="0" y="7.34" width="3.333" height="6.33" rx="1.667" fill="currentColor"/><rect x="5.667" y="5" width="3.333" height="8.67" rx="1.667" fill="currentColor"/><rect x="11.334" y="2.67" width="3.333" height="11" rx="1.667" fill="currentColor"/><rect x="17" y="0" width="3.333" height="13.67" rx="1.667" fill="currentColor"/></svg>' +
    '<svg viewBox="0 0 19.33 14.33" width="16" height="11.9" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M0.415933 5.54283C0.902185 6.04412 1.66017 5.95818 2.27513 5.41393C4.30595 3.58064 6.83731 2.63535 9.66901 2.63535C12.5007 2.63535 15.0464 3.60928 17.0629 5.41393C17.6636 5.97251 18.4215 6.0298 18.9221 5.54283C19.4226 5.02722 19.4942 4.2538 18.9793 3.70954C16.8341 1.51819 13.3302 0 9.66901 0C6.00783 0 2.48965 1.53251 0.358727 3.72387C-0.156127 4.2538 -0.0989213 5.02722 0.415933 5.55715L0.415933 5.54283ZM3.94841 9.13779C4.50617 9.68205 5.22124 9.62476 5.85051 9.10915C6.88022 8.29276 8.25316 7.73418 9.66901 7.7485C11.0706 7.7485 12.4435 8.29276 13.4875 9.12347C14.1168 9.63908 14.8605 9.66773 15.4039 9.12347C15.9331 8.57921 16.0189 7.7485 15.4611 7.23289C14.0739 5.98683 11.9859 5.11315 9.68332 5.11315C7.38077 5.11315 5.27845 5.98683 3.9055 7.23289C3.41925 7.69121 3.31914 8.47896 3.96271 9.13779L3.94841 9.13779ZM8.72511 13.8929C9.34008 14.4801 9.98365 14.4801 10.5986 13.8929L11.757 12.7757C12.372 12.1742 12.5007 11.4151 11.7999 10.8995C11.2136 10.4841 10.4699 10.212 9.66901 10.212C8.86813 10.212 8.11015 10.4841 7.53809 10.9138C6.83731 11.4151 6.98033 12.1885 7.59529 12.7757L8.73942 13.8929L8.72511 13.8929Z"/></svg>' +
    '<svg viewBox="0 0 29.33 13.67" width="24.4" height="11.4" aria-hidden="true"><path fill="currentColor" d="M0 6.4C0 4.16 0 3.04.44 2.18A3.5 3.5 0 0 1 2.18.44C3.04 0 4.16 0 6.4 0h13.53c2.24 0 3.36 0 4.22.44a3.5 3.5 0 0 1 1.75 1.74c.43.86.43 1.98.43 4.22v.87c0 2.24 0 3.36-.43 4.21a3.5 3.5 0 0 1-1.75 1.75c-.86.44-1.98.44-4.22.44H6.4c-2.24 0-3.36 0-4.22-.44A3.5 3.5 0 0 1 .44 11.48C0 10.63 0 9.5 0 7.27z"/><path fill="currentColor" transform="translate(27.33 4.33)" d="M0 0v5c.6-.14 2-1.25 2-2.5S.6.14 0 0Z"/></svg>' +
    '</span>';
  document.querySelectorAll('[data-status]').forEach(function (el) {
    el.innerHTML = STATUS;
  });

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());
})();
