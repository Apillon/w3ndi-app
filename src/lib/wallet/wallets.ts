import { SvgNames } from '~/components/Parts/SvgInclude.vue';
import { DotSamaWallet } from './DotSamaWallet';

const PREDEFINED_WALLETS: WalletInfo[] = [
  {
    type: 'desktop',
    extensionName: 'polkadot-js',
    title: 'Polkadot{.js}',
    installUrl: {
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/',
      default:
        'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd',
    },
    icon: SvgNames.WalletPolkadot,
  },
  {
    type: 'desktop',
    extensionName: 'subwallet-js',
    title: 'SubWallet',
    installUrl: {
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/subwallet/',
      default:
        'https://chrome.google.com/webstore/detail/subwallet/onhogfjeacnfoofkfgppdlbmlmnplgbn',
    },
    icon: SvgNames.WalletSubwallet,
  },
  {
    type: 'desktop',
    extensionName: 'talisman',
    title: 'Talisman',
    installUrl: {
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/talisman-wallet-extension/',
      default:
        'https://chrome.google.com/webstore/detail/talisman-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
    },
    icon: SvgNames.WalletTalisman,
  },
  {
    type: 'desktop',
    extensionName: 'Sporran',
    title: 'Sporran',
    installUrl: {
      default: 'https://chrome.google.com/webstore/detail/sporran/djdnajgjcbjhhbdblkegbcgodlkkfhcl',
    },
    icon: '',
  },
];

const walletList: Wallet[] = [];

// Add more wallet, please sure you call this method before any getWallets or getWalletBySource
export function addWallet(data: WalletInfo) {
  const wallet = new DotSamaWallet(data) as Wallet;

  walletList.push(wallet);
}

// Implement predefined wallets
PREDEFINED_WALLETS.forEach(walletInfo => {
  addWallet(walletInfo);
});

// Get all wallet
export function getWallets(): Wallet[] {
  return walletList.filter(item => item.extensionName !== 'Sporran');
}

export function getWalletBySource(source: string | unknown): Wallet | undefined {
  return walletList.find(wallet => {
    return wallet.extensionName === source;
  });
}

export function isWalletInstalled(source: string | unknown): boolean {
  const wallet = getWalletBySource(source);

  return wallet?.installed as boolean;
}
