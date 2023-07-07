export function reportError(msg, err) {
    if(err) {
        console.error(err);
    }
    alert(msg);
}

export function reportGetContractError(err) {
    reportError("failed to retrieve the Mafia contract information", err);
}

// GameAlreadyInitialized describes when a game has been initialized (but not yet started)
export const GameAlreadyInitialized = {};
// GameStarted describes when a game has started
export const GameStarted = {};