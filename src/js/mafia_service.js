import { getMafiaHTTPService } from './mafia_service_http.js'
import { getMafiaContractProvider } from './mafia_service_contract.js'
import { getInMemoryGameStateProvider } from './game_state_in_memory.js'
import { getSupportedChains } from './networks.js'
import { setGameStateProvider } from './game_state.js'
import { ethers } from 'ethers'
import { isDevelopment } from './environment.js'
import { NoMafiaServiceProviderSet, UnsupportedChain } from './errors.js'

let mafiaServiceProvider

// getMafiaService gets the provided Mafia service, if set
export function getMafiaService() {
    return new Promise((resolve, reject) => {
        if (!mafiaServiceProvider) {
            reject(NoMafiaServiceProviderSet)
            return;
        }
    
        resolve(mafiaServiceProvider())
    })
}

// setMafiaServiceProvider accepts a no-arg function that returns a Promise that resolves to the Mafia service (defined below)
export function setMafiaServiceProvider(provider) {
    mafiaServiceProvider = provider
}

// initializeMafiaServiceProvider initializes the provider of the game service.
// It returns a promise that resolves on initialization of the provider or errors
// if an issue occurs with the initialization.
// The error can be UnsupportedChain if the current chain is not supported.
export function initializeMafiaServiceProvider() {
    if (isDevelopment() && process.env.MAFIA_BACKEND === "http") {
        setMafiaServiceProvider(getMafiaHTTPService);
        setGameStateProvider(getInMemoryGameStateProvider());
        return new Promise(resolve => resolve());
    } else {
        return new Promise((resolve, reject) => {
            ethereum.request({ method: 'eth_requestAccounts' }).then(() => {
              const provider = new ethers.BrowserProvider(ethereum);
              const walletAddress = window.ethereum.selectedAddress;

              provider.getNetwork().then(network => {
                getSupportedChains().then(supportedChains => {
                    let contractAddress;
                    supportedChains.forEach(supportedChain => {
                        if (network.chainId === supportedChain.chainID) {
                            contractAddress = supportedChain.contractAddress;
                        }
                    })

                    if (!contractAddress) {
                        reject(new UnsupportedChain(supportedChains))
                        return
                    }

                    setGameStateProvider(getInMemoryGameStateProvider());
        
                    setMafiaServiceProvider(getMafiaContractProvider(provider, walletAddress, contractAddress));
    
                    resolve();
                }).catch(reject);
              }).catch(reject);
            }).catch(reject);
        })
    }
}

/**
 * Mafia service is a set of methods on an object:
 * accuseAsMafia(hostAddress string, accusedAddress string) Promise
 * cancelGame() Promise
 * executePhase() Promise
 * finishGame() Promise
 * getContractAddress() Promise(string)
 * getPlayerID() Promise(string)
 * getPlayerRole(hostAddress string) Promise(PlayerRole)
 * getPlayerNicknames(hostAddress string) Promise(Map<string, string>)
 * initializeGame() Promise
 * joinGame(hostAddress string, playerNickname string) Promise
 * startGame(expectedPlayerCount int) Promise
 * voteToKill(hostAddress string, victimAddress string) Promise
 * waitForPhaseExecution(hostAddress string) Promise([PhaseOutcome, TimeOfDay, playersKilled []string, playersConvicted []string])
 * waitForGameStart(hostAddress string) Promise
 */