const apillonIcon =
  '<svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: sub;"><path d="M10.5 8.15398L0.5 0.65625V15.6517L10.5 8.15398ZM10.5 8.15398L20.5 15.6517V0.65625L10.5 8.15398Z" fill="#141721"/></svg>';
const style = (node, styles) => Object.keys(styles).forEach(key => (node.style[key] = styles[key]));

(function (d) {
  var s = d.scripts[0];
  var p1 = d.createElement('link');
  p1.href = 'https://fonts.googleapis.com';
  p1.rel = 'preconnect';
  s.parentNode.insertBefore(p1, s);
  var p2 = d.createElement('link');
  p2.href = 'https://fonts.gstatic.com';
  p2.rel = 'preconnect';
  p2.crossorigin = true;
  s.parentNode.insertBefore(p2, s);

  var font = d.createElement('link');
  font.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@700&display=swap';
  font.rel = 'stylesheet';
  s.parentNode.insertBefore(font, s);
})(document);

function getSyncScriptParams() {
  // the script tag
  var scripts = document.getElementsByTagName('script');
  var script = Array.from(scripts).find(s => s.src.includes('auth.form.js'));

  return {
    oauthUrl: getOauthUrl(script.getAttribute('data-env')),
    token: script.getAttribute('data-token'),
    height: script.getAttribute('data-height') || 900,
    width: script.getAttribute('data-width') || 440,
  };
}

function getOauthUrl(env) {
  switch (env) {
    case 'development':
      return 'https://oauth-dev.apillon.io/';
    case 'staging':
      return 'https://oauth-staging.apillon.io/';
    default:
      return 'https://oauth.apillon.io/';
  }
}

window.addEventListener('load', event => {
  const clientParams = getSyncScriptParams();

  var button = document.createElement('button');
  button.innerHTML = apillonIcon;

  var buttonText = document.createElement('span');
  buttonText.innerText = 'Continue with Apillon';
  style(buttonText, {
    'margin-left': '12px',
    'vertical-align': 'middle',
  });

  button.append(buttonText);
  style(button, {
    width: '100%',
    background: '#F0F2DA',
    padding: '12px 24px',
    color: '#141721',
    'font-family': 'IBM Plex Mono',
    'font-weight': 700,
    'font-size': '14px',
    'line-height': '24px',
  });

  button.addEventListener('click', function () {
    openPopup(clientParams.oauthUrl);
  });
  document.getElementById('apillon').appendChild(button);

  function openPopup(oauthUrl) {
    const childWindow = window.open(
      `${oauthUrl}?embedded=1&token=${clientParams.token}`,
      'Apillon Auth Form',
      `height=${clientParams.height} width=${clientParams.width} resizable=no`
    );

    // VERIFICATION EVENT LISTENER
    window.addEventListener(
      'message',
      event => {
        // if (event.origin !== clientParams.oauthUrl) {
        //   return;
        // }
        const ev = new CustomEvent('identity-verification', { detail: event.data });
        // Dispatch the event.
        window.dispatchEvent(ev);
        childWindow.close();
      },
      false
    );
  }
});
