# w3ndi

This repository contains code for Apillon's web3name registry project - code name: w3ndi.

w3ndi generates a JSON file, stored on [IPFS](https://ipfs.tech/) and pinned via [Crust Network](https://crust.network/), that contains identifiers for different wallet addresses a user pins to their [web3name](https://docs.kilt.io/docs/concepts/web3names/) via [KILT](https://www.kilt.io/) parachain.

## Supported wallets

Here is a list of wallets that support retrieving wallet addresses via web3names:

- [Nova Wallet](https://novawallet.io/)

## Supported wallet chains

A list of the supported chains is available at [`/src/lib/data/chain.json`](src/lib/data/chain.json).

To add a chain, open a PR adding it to this file. The file needs to be structured correctly. Each entry has three values: `chainType`, `name`, and `caip19`. Polkadot-based chains also have a parameter: `ss58Prefix`.

### Chain types

w3ndi supports different chain types since the same address can be used or derived on multiple chains. This is specifically valid for EVM- and Polkadot-based chains.

| Indicator | Description           |
| --------- | --------------------- |
| 1         | EVM-based chains      |
| 2         | Polkadot-based chains |
| 0         | Other chains          |

### Name

Indicates the name of the chain.

### CAIP-19

Each asset needs to be identified by its [CAIP-19 indicator](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-19.md).

### SS58Prefix

Each Polkadot-based chain can derive its address from the same mnemonic using a unique [SS58 prefix](https://wiki.polkadot.network/docs/build-ss58-registry).

### Examples

```json
{
  "chainType": 2,
  "name": "Polkadot",
  "caip19": "polkadot:91b171bb158e2d3848fa23a9f1c25182/slip44:354",
  "ss58Prefix": 0
}
```

```json
{
  "chainType": 1,
  "name": "Ethereum",
  "caip19": "eip155:1/slip44:60"
}
```

## Stack

- Vite
- Vue 3 w/ TypeScript
- TailwindCSS
- PostCSS
