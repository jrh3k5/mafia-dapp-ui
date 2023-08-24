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

The following builds into the `dist/` folder a distributable version of the website:

```sh
npm run build
```

#### Run Production Locally

Run the following to build the production distribution and run it locally (useful for testing the Base Goerli Testnet integration):

```
npm run build && npx serve dist
```

# Attributions

Favicon sourced from [icons8.com](https://icons8.com/icons/set/mafia)