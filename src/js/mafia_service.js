import { getMafiaHTTPService } from './mafia_service_http.js'
import { getMafiaContract, initializeMafiaContract } from './mafia_service_contract.js'
import { getInMemoryGameStateProvider } from './game_state_in_memory.js'
import { getLocalStorageGameStateProvider } from './game_state_local_storage.js'
import { Hardhat } from './networks.js'
import { setGameStateProvider } from './game_state.js'
import { ethers } from 'ethers'

let mafiaServiceProvider

// getMafiaService gets the provided Mafia service, if set
export function getMafiaService() {
    if (!mafiaServiceProvider) {
        throw 'no Mafia service provider set'
    }

    return mafiaServiceProvider()
}

// setMafiaServiceProvider accepts a no-arg function that returns a Promise that resolves to the Mafia service (defined below)
export function setMafiaServiceProvider(provider) {
    mafiaServiceProvider = provider
}

export function initializeMafiaServiceProvider() {
    if (process.env.NODE_ENV === "development") {
        setMafiaServiceProvider(getMafiaHTTPService)

        setGameStateProvider(getInMemoryGameStateProvider)

        return new Promise(resolve => resolve())
    } else {
        ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
          const provider = new ethers.BrowserProvider(ethereum);
          const walletAddress = window.ethereum.selectedAddress;
          provider.getSigner(walletAddress).then(signer => {
            // TODO: read selected network and choose the correct contract address
            const contractAddress = Hardhat.ContractAddress;
  
            initializeMafiaContract(contractAddress, signer);

            setGameStateProvider(getLocalStorageGameStateProvider)

            setMafiaServiceProvider(getMafiaContract);
          }).catch(err => reportError("Failed to get signer", err));
        }).catch(err => reportError("Failed to get wallet address; please try again", err));
    }
}

/**
 * Mafia service is a set of methods on an object:
 * accuseAsMafia(hostAddress string, accusedAddress string) Promise
 * cancelGame() Promise
 * executePhase() Promise
 * getContractAddress() Promise(string)
 * getPlayerID() Promise(string)
 * getPlayerRole(hostAddress string) Promise(PlayerRole)
 * getPlayerNicknames(hostAddress string) Promise(Map<string, string>)
 * initializeGame() Promise
 * joinGame(hostAddress string, playerNickname string) Promise
 * startGame(expectedPlayerCount int) Promise
 * waitForPhaseExecution(hostAddress string) Promise([PhaseOutcome, TimeOfDay, playersKilled []string, playersConvicted []string])
 * waitForGameStart(hostAddress string) Promise
 */