let errorHandlers = [];

// addErrorHandler adds the given handler function to the error handlers used when an error is reported.
// The function accepts a string and an optional error object as its parameters and returns true 
// if the error has been handled.
export function addErrorHandler(handlerFn) {
    errorHandlers.push(handlerFn)
}

// reportError is used to report an error; the first parameter is the human-readable
// message to show, and the second is an optional error object.
export function reportError(msg, err) {
    for (let i = 0; i < errorHandlers.length; i++) {
        if (errorHandlers[i](msg, err) === true) {
            // there's a registered handler that handled the issue; don't do the fallback
            return
        }
    }

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