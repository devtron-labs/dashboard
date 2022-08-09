import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as Sentry from '@sentry/browser'
import { CaptureConsole } from '@sentry/integrations'
import { BrowserRouter } from 'react-router-dom'
import { BrowserTracing } from '@sentry/tracing'

interface customEnv {
    SENTRY_ENV?: string
    SENTRY_ERROR_ENABLED?: boolean
    SENTRY_PERFORMANCE_ENABLED?: boolean
    SENTRY_DSN?: string
    SENTRY_TRACES_SAMPLE_RATE?: number
    HOTJAR_ENABLED?: boolean
    CLUSTER_NAME?: boolean
    APPLICATION_METRICS_ENABLED?: boolean
    GA_ENABLED?: boolean
    GA_TRACKING_ID?: string
    RECOMMEND_SECURITY_SCANNING?: boolean
    FORCE_SECURITY_SCANNING?: boolean
    HIDE_DISCORD?: boolean
    POSTHOG_ENABLED?: boolean
    POSTHOG_TOKEN?: string
}
declare global {
    interface Window {
        _env_: customEnv
        hj: any
        _hjSettings: any
        Worker: any
    }
}

const root = document.getElementById('root')
if (
    process.env.NODE_ENV === 'production' &&
    window._env_ &&
    (window._env_.SENTRY_ERROR_ENABLED)
) {
    const integrationArr = []
    integrationArr.push(new CaptureConsole({ levels: ['error'] }))
    if (window._env_.SENTRY_PERFORMANCE_ENABLED) {
        integrationArr.push(new BrowserTracing())
    }
    Sentry.init({
        beforeBreadcrumb(breadcrumb, hint) {
            if (breadcrumb.category === 'console') {
                if (breadcrumb.level === 'warning') {
                    return null
                }
            } else if (['xhr', 'fetch', 'post', 'put', 'delete'].includes(breadcrumb.category)) {
                if (breadcrumb.data && breadcrumb.data.status_code === 200) {
                    return null
                }
            }
            return breadcrumb
        },
        dsn: window._env_.SENTRY_DSN || '',
        integrations: integrationArr,
        tracesSampleRate: Number(window._env_.SENTRY_TRACES_SAMPLE_RATE) || 0.2,
        ...(process.env.REACT_APP_GIT_SHA ? { release: `dashboard@${process.env.REACT_APP_GIT_SHA}` } : {}),
        environment: window._env_ && window._env_.SENTRY_ENV ? window._env_.SENTRY_ENV : 'staging',
        beforeSend(event) {
            const errorList = event?.exception?.values || []
            for (let index = 0; index < errorList.length; index++) {
                const error = errorList[index]
                if (
                    error &&
                    ((error['type'] &&
                        (error['type'] === '[401]' ||
                            error['type'] === '[403]' ||
                            error['type'] === '[504]' ||
                            error['type'] === '[503]')) ||
                        (error['value'] &&
                            error['value'].indexOf('write data discarded, use flow control to avoid losing data') >=
                                0) ||
                        error['value'].indexOf('Failed to update a ServiceWorker') >= 0 ||
                        error['value'].indexOf('TypeError: ServiceWorker') >= 0 ||
                        error['value'].indexOf('Loading CSS chunk') >= 0 ||
                        error['value'].indexOf(`Unexpected token '<'`) >= 0)
                ) {
                    return null
                }
            }
            return event
        },
    })
}

if (!window || !window._env_) {
    window._env_ = {
        SENTRY_ENV: 'staging',
        SENTRY_ERROR_ENABLED: false,
        SENTRY_PERFORMANCE_ENABLED: false,
        SENTRY_DSN: '',
        SENTRY_TRACES_SAMPLE_RATE: 0.2,
        HOTJAR_ENABLED: false,
        GA_ENABLED: false,
        APPLICATION_METRICS_ENABLED: false,
        POSTHOG_ENABLED: false,
        POSTHOG_TOKEN: '',
        RECOMMEND_SECURITY_SCANNING: false,
        FORCE_SECURITY_SCANNING: false,
        HIDE_DISCORD: true,
    }
}

ReactDOM.render(
    <React.StrictMode>
        {window.top === window.self ? (
            <BrowserRouter basename={`${process.env.PUBLIC_URL}/`}>
                <App />
            </BrowserRouter>
        ) : null}
    </React.StrictMode>,
    root,
)

if (process.env.NODE_ENV === 'development') {
    (module as any).hot.accept()
}
