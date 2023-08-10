// isDevelopment returns true if currently running in a development environment; false if not
export function isDevelopment() {
    return process.env.NODE_ENV === "development"
}