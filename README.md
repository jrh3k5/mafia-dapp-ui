# Mafia Dapp UI

This is a UI for interacting with the [Mafia Dapp](https://github.com/jrh3k5/mafia-dapp).

For development purposes, it also supports running against the [Mafia Dapp HTTP backend](https://github.com/jrh3k5/mafia-dapp-http).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

The following will run this locally to be used against an instance of Hardhat:

```sh
npm run dev
```

To run against the HTTP backend, do the following:

```sh
export MAFIA_BACKEND=http && npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
