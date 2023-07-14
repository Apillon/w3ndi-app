import { $api } from './api';
import * as file from 'file-saver';

export function getHeadMeta(title: string, description?: string, url?: string) {
  const descriptions = !description
    ? []
    : [
        { name: 'description', content: description },
        { name: 'og:description', content: description },
        { name: 'twitter:description', content: description },
      ];

  const urls = !url
    ? []
    : [
        { name: 'og:url', content: url },
        { name: 'twitter:url', content: url },
      ];

  return {
    title,
    meta: [
      { name: 'og:title', content: title },
      { name: 'twitter:title', content: title },
      ...descriptions,
      ...urls,
    ],
  };
}

export function scrollToOffset(offsetY: number, duration = 150, scrollingElementSelector = '') {
  if (!document) {
    return;
  }

  const scrollingElement = !scrollingElementSelector
    ? document.documentElement
    : document.querySelector(scrollingElementSelector);

  if (!scrollingElement) {
    return;
  }

  const startingY = scrollingElement.scrollTop;
  const diff = offsetY - startingY;
  let start = 0;

  window.requestAnimationFrame(function step(timestamp) {
    if (!start) start = timestamp;

    // Elapsed milliseconds since start of scrolling.
    const time = timestamp - start;

    // Get percent of completion in range [0, 1].
    const percent = Math.min(time / duration, 1);

    scrollingElement.scrollTo(0, startingY + diff * percent);

    // Proceed with animation as long as we wanted it to.
    if (time < duration) {
      window.requestAnimationFrame(step);
    }
  });
}

export async function sendEmail(email: string, type: string, captcha: any) {
  let success = false;
  let response: any = {};

  try {
    const { data, error } = await $api.post('/identity/verification/email', {
      email: email,
      type: type,
      captcha: captcha,
    });

    if (data) {
      success = true;
      response = data;
    } else {
      success = false;
      response = error;
    }
  } catch (err) {
    success = false;
    response = err;
  }

  return { success, response };
}

export async function saveIdentity(didDocument: any, credential: any) {
  if (didDocument !== '') {
    var blob = new Blob([didDocument], { type: 'text/plain;charset=utf-8' });
    // Save as is apparently now natively supported
    file.saveAs(blob, 'did.json');
  }

  if (credential !== '') {
    var blob = new Blob([credential], { type: 'text/plain;charset=utf-8' });
    // Save as is apparently now natively supported
    file.saveAs(blob, 'credential.json');
  }
}

export const copyToClipboard = (content: string, el?: HTMLElement, e?: MouseEvent) => {
  if (window.isSecureContext && navigator.clipboard) {
    navigator.clipboard.writeText(content);
  } else {
    unsecuredCopyToClipboard(content);
  }
  if (el) {
    el?.setAttribute('tooltip', 'Copied to clipboard');
    setTimeout(() => {
      el?.removeAttribute('tooltip');
    }, 1000);

    if (el.tagName.toLocaleLowerCase() === 'span' && !el.innerText) {
      el.style.position = 'fixed';
      el.style.top = e?.y ? `${e.y}px` : '0px';
      el.style.left = e?.x ? `${e.x}px` : '0px';
    }
  }
};
const unsecuredCopyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Unable to copy to clipboard', err);
  }
  document.body.removeChild(textArea);
};

/** Browser, device */
export function getBrowserName(): string {
  if (navigator.userAgent.includes('Firefox')) {
    return 'firefox';
  } else if (navigator.userAgent.includes('MSIE')) {
    return 'ie';
  } else if (navigator.userAgent.includes('Edge')) {
    return 'edge';
  } else if (navigator.userAgent.includes('Safari')) {
    return 'safari';
  } else if (navigator.userAgent.includes('Opera')) {
    return 'opera';
  }
  return 'chrome';
}
export function getDeviceName() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator?.userAgentData?.platform || window.navigator.platform;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

  if (macosPlatforms.includes(platform)) {
    return 'mac';
  } else if (iosPlatforms.includes(platform)) {
    return 'ios';
  } else if (windowsPlatforms.includes(platform)) {
    return 'windows';
  } else if (/Android/.test(userAgent)) {
    return 'android';
  } else if (/Linux/.test(platform)) {
    return 'linux';
  }
  return '';
}

export function truncateWallet(source: string, partLength: number = 4): string {
  return source.length > 9
    ? source.slice(0, partLength) + '…' + source.slice(source.length - partLength, source.length)
    : source;
}
