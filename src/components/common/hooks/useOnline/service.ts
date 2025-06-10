export const getFallbackInternetConnectivity = (controller: AbortController): Promise<any> => {
    const timeoutId = setTimeout(() => {
        controller.abort()
    }, 10000)

    return fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
    }).finally(() => {
        clearTimeout(timeoutId)
    })
}
