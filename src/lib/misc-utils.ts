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
