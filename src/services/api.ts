import { ServerErrors } from '../modals/commonTypes'
import { RequestTimeout, URLS, Host } from '../config'
import { ResponseType, APIOptions } from './service.types'

const responseMessages = {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing(WebDAV)',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non - Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi - Status(WebDAV)',
    208: 'Already Reported(WebDAV)',
    226: 'IM Used',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect(experimental)',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request - URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Requested Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a teapot",
    420: 'Enhance Your Calm(Twitter)',
    422: 'Unprocessable Entity(WebDAV)',
    423: 'Locked(WebDAV)',
    424: 'Failed Dependency(WebDAV)',
    425: 'Reserved for WebDAV',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    444: 'No Response(Nginx)',
    449: 'Retry With(Microsoft)',
    450: 'Blocked by Windows Parental Controls(Microsoft)',
    451: 'Unavailable For Legal Reasons',
    499: 'Client Closed Request(Nginx)',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates(Experimental)',
    507: 'Insufficient Storage(WebDAV)',
    508: 'Loop Detected(WebDAV)',
    509: 'Bandwidth Limit Exceeded(Apache)',
    510: 'Not Extended',
    511: 'Network Authentication Required',
    598: 'Network read timeout error',
    599: 'Network connect timeout error',
}

function handleLogout() {
    let cont = `${window.location.pathname.replace(process.env.PUBLIC_URL, '')}${window.location.search}`
    const loginUrl = URLS.LOGIN_SSO
    window.location.href = `${window.location.origin}${process.env.PUBLIC_URL}${loginUrl}?continue=${cont}`
}

async function handleServerError(contentType, response) {
    //Test for HTTP Status Code
    let code: number = response.status
    let status: string = response.statusText || responseMessages[code]
    let serverError = new ServerErrors({ code, errors: [] })
    if (contentType !== 'application/json') {
        //used for better debugging,
        status = `${responseMessages[code]}. Please try again.`
    } else {
        const responseBody = await response.json()
        if (responseBody.errors) {
            serverError.errors = responseBody.errors
        }
    }
    serverError.errors =
        serverError.errors.length > 0 ? serverError.errors : [{ code, internalMessage: status, userMessage: status }]
    throw serverError
}

async function fetchAPI(
    url: string,
    type: string,
    data: object,
    signal: AbortSignal,
    preventAutoLogout = false,
    isMultipartRequest?: boolean,
): Promise<ResponseType> {
    let options = {
        method: type,
        signal,
        body: data ? JSON.stringify(data) : undefined,
    }
    options['credentials'] = 'include' as RequestCredentials
    return fetch(
        `${Host}/${url}`,
        !isMultipartRequest
            ? options
            : ({
                  method: type,
                  body: data,
              } as RequestInit),
    ).then(
        async (response) => {
            let contentType = response.headers.get('Content-Type')
            if (response.status === 401) {
                if (preventAutoLogout) {
                    throw new ServerErrors({
                        code: 401,
                        errors: [
                            { code: 401, internalMessage: 'Please login again', userMessage: 'Please login again' },
                        ],
                    })
                } else {
                    handleLogout()
                    return { code: 401, status: 'Unauthorized', result: [] }
                }
            } else if (response.status >= 300 && response.status <= 599) {
                return await handleServerError(contentType, response)
            } else {
                if (contentType === 'application/json') {
                    return response.json().then((responseBody) => {
                        if (responseBody.code >= 300 && responseBody.code <= 599) {
                            //Test Code in Response Body, despite successful HTTP Response Code
                            throw new ServerErrors({ code: responseBody.code, errors: responseBody.errors })
                        } else {
                            //Successfull Response. Expected Response Type {code, result, status}
                            return responseBody
                        }
                    })
                } else if (contentType === 'octet-stream' || contentType === 'application/octet-stream') {
                    //used in getArtifact() API only
                    return response
                }
            }
        },
        (error) => {
            //Network call fails. Handle Failed to Fetch
            let err = {
                code: 0,
                userMessage: error.message,
                internalMessage: error.message,
                moreInfo: error.message,
            }
            throw new ServerErrors({ code: 0, errors: [err] })
        },
    )
}

function fetchInTime(
    url: string,
    type: string,
    data: object,
    options?: APIOptions,
    isMultipartRequest?: boolean,
): Promise<ResponseType> {
    const controller = new AbortController()
    const { signal } = controller
    const timeoutPromise: Promise<ResponseType> = new Promise((resolve, reject) => {
        let timeout = options?.timeout ? options.timeout : RequestTimeout
        setTimeout(() => {
            controller.abort()
            reject({
                code: 408,
                errors: [{ code: 408, internalMessage: 'Request cancelled', userMessage: 'Request Cancelled' }],
            })
        }, timeout)
    })
    return Promise.race([
        fetchAPI(url, type, data, options?.signal || signal, options?.preventAutoLogout || false, isMultipartRequest),
        timeoutPromise,
    ]).catch((err) => {
        if (err instanceof ServerErrors) {
            throw err
        } else {
            throw new ServerErrors({
                code: 408,
                errors: [
                    {
                        code: 408,
                        internalMessage: 'That took longer than expected.',
                        userMessage: 'That took longer than expected.',
                    },
                ],
            })
        }
    })
}

export const post = (
    url: string,
    data: object,
    options?: APIOptions,
    isMultipartRequest?: boolean,
): Promise<ResponseType> => {
    return fetchInTime(url, 'POST', data, options, isMultipartRequest)
}

export const put = (url: string, data: object, options?: APIOptions): Promise<ResponseType> => {
    return fetchInTime(url, 'PUT', data, options)
}

export const get = (url: string, options?: APIOptions): Promise<ResponseType> => {
    return fetchInTime(url, 'GET', null, options)
}

export const trash = (url: string, data?: object, options?: APIOptions): Promise<ResponseType> => {
    return fetchInTime(url, 'DELETE', data, options)
}
