const loadingHandlers = [];

// addLoadingHandler adds a handler for when loading is turned on and off.
// The handler receives a boolean value; if true, then something is loading; if false, then something
// has stopped loading.
export function addLoadingHandler(loadingHandler) {
    loadingHandlers.push(loadingHandler);
}

// setLoading invokes the registered loading handlers with the given boolean.
// The boolean should be true if the application is loading something; false if not.
export function setLoading(isLoading) {
    loadingHandlers.forEach(loadingHandler => loadingHandler(!!isLoading));
}