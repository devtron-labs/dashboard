export async function fetchWithFullRoute(
    fullRoute: string,
    type: string,
    data?: object,
    signal?: AbortSignal,
): Promise<any> {
    const options = {
        method: type,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true',
        },
        signal,
        body: data ? JSON.stringify(data) : undefined,
    }
    options['credentials'] = 'include' as RequestCredentials
    return fetch(fullRoute, options).then((response) => {
        return response.json()
    })
}
