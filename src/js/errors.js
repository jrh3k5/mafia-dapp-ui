export function reportError(msg, err) {
    if(err) {
        console.error(err);
    }
    alert(msg);
}

export function reportGetContractError(err) {
    reportError("failed to retrieve the Mafia contract information", err);
}

export const GameAlreadyInitialized = {};