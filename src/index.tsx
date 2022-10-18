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
    DEVTRON_APP_DETAILS_POLLING_INTERVAL?: number
    HELM_APP_DETAILS_POLLING_INTERVAL?: number
    EA_APP_DETAILS_POLLING_INTERVAL?: number
    CENTRAL_API_ENDPOINT?: string
    HIDE_DEPLOYMENT_GROUPS?: boolean
    ANNOUNCEMENT_BANNER_MSG?: string
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
                            error['type'] === '[503]' ||
                            error['type'] === 'ChunkLoadError')) ||
                        (error['value'] &&
                            (error['value'].includes('write data discarded, use flow control to avoid losing data') ||
                                error['value'].includes('Failed to update a ServiceWorker') ||
                                (error['value'].includes('ServiceWorker script at ') &&
                                    error['value'].includes('encountered an error during installation.')) ||
                                error['value'].includes('Loading CSS chunk') ||
                                error['value'].includes(`Unexpected token '<'`))))
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
        DEVTRON_APP_DETAILS_POLLING_INTERVAL: 30000,
        HELM_APP_DETAILS_POLLING_INTERVAL: 30000,
        EA_APP_DETAILS_POLLING_INTERVAL: 30000,
        CENTRAL_API_ENDPOINT: 'https://api-stage.devtron.ai',
        HIDE_DEPLOYMENT_GROUPS: true,
        ANNOUNCEMENT_BANNER_MSG: 'AVOID DEPLOYING non critical changes to production between 21st to 31st Oct 2022'
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
