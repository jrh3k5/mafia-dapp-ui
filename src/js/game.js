export * from "./game_state"

export function setUserWalletAddress(gameState, walletAddress) {
    gameState.userWalletAddress = walletAddress;
}

export function setMafiaContract(mafiaContract) {
    gameState.mafiaContract = mafiaContract;
}

// initializeGame is used to initialize a game. It returns a Promise that either returns the error or resolves to no-arg completion.
export function initializeGame() {
    return new Promise((resolve, reject) => {
        gameState.mafiaContract.methods.initializeGame(gameState.userWalletAddress).call((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}