let errorHandlers = [];

// addErrorHandler adds the given handler function to the error handlers used when an error is reported.
// The function accepts a string and an optional error object as its parameters and returns true 
// if the error has been handled. The function receives null if the error state should be cleared.
export function addErrorHandler(handlerFn) {
    errorHandlers.push(handlerFn)
}

// clearError instructs all handlers to clear their errors.
// This will invoke every single error handler, even if one returns true to indicate it has handled the error.
export function clearError() {
    errorHandlers.forEach(errorHandler => errorHandler(null));
}

// handleMountError provides common error handling for when an error occurs during the mounting of a component
export function handleMountError(err, component) {
    if (err == NoGameStateProviderSet) {
        // The user has come across this page through something other than the front door,
        // so send them back to it.
        component.$router.push({ name: "Root" });
        return;
    }

    reportError("An error occurred during initialization", err);
}

// handleMafiaServiceProviderError handles when retrieving the Mafia service provider fails
export function handleMafiaServiceProviderError(err, component) {
    if (err == NoMafiaServiceProviderSet) {
        // The user has somehow reached this page without initializing the Mafia service provider,
        // so just send them back to the front door
        component.$router.push({ name: "Root" })
        return;
    }

    reportError("An error occurred while trying to retrieve the Mafia service provider", err);
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

// GameAlreadyInitialized describes when a game has been initialized (but not yet started)
export const GameAlreadyInitialized = {};
// GameStarted describes when a game has started
export const GameStarted = {};
// GameAlreadyJoined describes when a player has already joined a game
export const GameAlreadyJoined = {};
// NoGameStateProviderSet describes an error where a game state provider is unavailable
export const NoGameStateProviderSet = {};
// NoMafiaServiceProviderSet indicates an error where a Mafia service provider is not set
export const NoMafiaServiceProviderSet = {};

// UnsupportedChain describes a situation where the in-context chain is unsupported
export class UnsupportedChain {
    // Creates an error. The supported chains should be an array of SupportedChain objects
    constructor(supportedChains) {
        this.supportedChains = supportedChains;
    }
}