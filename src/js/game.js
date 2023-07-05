export * from "./game_state"

export function setUserWalletAddress(gameState, walletAddress) {
    gameState.userWalletAddress = walletAddress;
}

export function setMafiaContract(gameState, mafiaContract) {
    gameState.mafiaContract = mafiaContract;
}

// initializeGame is used to initialize a game. It returns a Promise that either returns the error or resolves to no-arg completion.
export function initializeGame(gameState) {
    return new Promise((resolve, reject) => {
        console.log("executing");
        gameState.mafiaContract.methods.initializeGame(gameState.userWalletAddress).send({ from: gameState.userWalletAddress }, (err, txHash) => {
            console.log("executed");
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}