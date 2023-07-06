import { Contract } from 'ethers';

let mafiaContract;

export function getMafiaContract() {
  if (!mafiaContract) {
    throw 'Mafia contract has not been initialized';
  }
  return mafiaContract;
}

// initializeMafiaContract sets the Mafia contract instancce to be used by the application
export function initializeMafiaContract(contractAddress, signer) {
    mafiaContract = new Contract(contractAddress, mafiaABI, signer);
}

const mafiaABI = [
  "function initializeGame() public",
  "function startGame(uint expectedPlayerCount) public",
];