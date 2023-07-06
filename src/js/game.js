export * from "./game_state"

export function setUserWalletAddress(gameState, walletAddress) {
    gameState.userWalletAddress = walletAddress;
}

// initializeGame is used to initialize a game. It returns a Promise that either returns the error or resolves to no-arg completion.
export function initializeGame(mafiaContract) {
    return new Promise((resolve, reject) => {
        console.log("executing");
        return mafiaContract.initializeGame().then(tx => {
            tx.then(() => {
                resolve();
            })
            .catch(err => {
                reject(err);
            })
        })
        .catch(err => {
            reject(err);
        });
    })
}