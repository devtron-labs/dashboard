import React from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from '@sentry/browser'
import { CaptureConsole } from '@sentry/integrations'
import { BrowserRouter } from 'react-router-dom'
import { BrowserTracing } from '@sentry/tracing'
import App from './App'

interface customEnv {
    VITE_SENTRY_ENV?: string
    VITE_SENTRY_ERROR_ENABLED?: boolean
    VITE_SENTRY_PERFORMANCE_ENABLED?: boolean
    VITE_SENTRY_DSN?: string
    VITE_SENTRY_TRACES_SAMPLE_RATE?: number
    VITE_HOTJAR_ENABLED?: boolean
    CLUSTER_NAME?: boolean
    VITE_APPLICATION_METRICS_ENABLED?: boolean
    VITE_GA_ENABLED?: boolean
    VITE_GA_TRACKING_ID?: string
    VITE_GTM_ENABLED?: boolean
    VITE_GTM_ID?: string
    VITE_RECOMMEND_SECURITY_SCANNING?: boolean
    VITE_FORCE_SECURITY_SCANNING?: boolean
    VITE_ENABLE_CI_JOB?: boolean
    VITE_HIDE_DISCORD?: boolean
    VITE_POSTHOG_ENABLED?: boolean
    VITE_POSTHOG_TOKEN?: string
    VITE_DEVTRON_APP_DETAILS_POLLING_INTERVAL?: number
    VITE_HELM_APP_DETAILS_POLLING_INTERVAL?: number
    VITE_EA_APP_DETAILS_POLLING_INTERVAL?: number
    VITE_CENTRAL_API_ENDPOINT?: string
    VITE_HIDE_DEPLOYMENT_GROUPS?: boolean
    VITE_HIDE_GITOPS_OR_HELM_OPTION?: boolean
    VITE_CONFIGURABLE_TIMEOUT?: string
    VITE_HIDE_APPLICATION_GROUPS?: boolean
    K8S_CLIENT?: boolean
    VITE_USE_V2?: boolean
    VITE_CLUSTER_TERMINAL_CONNECTION_POLLING_INTERVAL?: number
    VITE_CLUSTER_TERMINAL_CONNECTION_RETRY_COUNT?: number
    VITE_ENABLE_CHART_SEARCH_IN_HELM_DEPLOY?: boolean
    VITE_HIDE_EXCLUDE_INCLUDE_GIT_COMMITS?: boolean
    VITE_ENABLE_BUILD_CONTEXT?: boolean
    VITE_CLAIR_TOOL_VERSION?: string
    VITE_ENABLE_RESTART_WORKLOAD?: boolean
    VITE_ENABLE_SCOPED_VARIABLES?: boolean
    VITE_DEFAULT_CI_TRIGGER_TYPE_MANUAL: boolean
    VITE_ANNOUNCEMENT_BANNER_MSG?: string
    VITE_LOGIN_PAGE_IMAGE?: string
    VITE_LOGIN_PAGE_IMAGE_BG?: string
    VITE_HIDE_DEFAULT_CLUSTER?: boolean
    VITE_GLOBAL_API_TIMEOUT?: number
    VITE_TRIGGER_API_TIMEOUT?: number
    NODE_REACT_APP_GIT_SHA?: string
    REACT_APP_GIT_SHA?: string
    NODE_ENV?: string
    VITE_LOGIN_DT_LOGO?: string
    VITE_SIDEBAR_DT_LOGO?: string
}
declare global {
    interface Window {
        _env_: customEnv
        hj: any
        _hjSettings: any
        Worker: any,
        __BASE_URL__: string
        __REACT_APP_ORCHESTRATOR_ROOT__: string
    }
}

const root = document.getElementById('root')
if (import.meta.env.VITE_NODE_ENV === 'production' && window._env_ && window._env_.VITE_SENTRY_ERROR_ENABLED) {
    const integrationArr = []
    integrationArr.push(new CaptureConsole({ levels: ['error'] }))
    if (window._env_.VITE_SENTRY_PERFORMANCE_ENABLED) {
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
        dsn: window._env_.VITE_SENTRY_DSN || '',
        integrations: integrationArr,
        tracesSampleRate: Number(window._env_.VITE_SENTRY_TRACES_SAMPLE_RATE) || 0.2,
        ...(window._env_.NODE_REACT_APP_GIT_SHA ? { release: `dashboard@${window._env_.REACT_APP_GIT_SHA}` } : {}),
        environment: window._env_ && window._env_.VITE_SENTRY_ENV ? window._env_.VITE_SENTRY_ENV : 'staging',
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
        VITE_SENTRY_ENV: 'staging',
        VITE_SENTRY_ERROR_ENABLED: false,
        VITE_SENTRY_PERFORMANCE_ENABLED: false,
        VITE_SENTRY_DSN: '',
        VITE_SENTRY_TRACES_SAMPLE_RATE: 0.2,
        VITE_HOTJAR_ENABLED: false,
        VITE_GA_ENABLED: false,
        VITE_GTM_ENABLED: false,
        VITE_APPLICATION_METRICS_ENABLED: false,
        VITE_POSTHOG_ENABLED: false,
        VITE_POSTHOG_TOKEN: '',
        VITE_RECOMMEND_SECURITY_SCANNING: false,
        VITE_FORCE_SECURITY_SCANNING: false,
        VITE_ENABLE_CI_JOB: false,
        VITE_HIDE_DISCORD: true,
        VITE_DEVTRON_APP_DETAILS_POLLING_INTERVAL: 30000,
        VITE_HELM_APP_DETAILS_POLLING_INTERVAL: 30000,
        VITE_EA_APP_DETAILS_POLLING_INTERVAL: 30000,
        VITE_CENTRAL_API_ENDPOINT: 'https://api-stage.devtron.ai',
        VITE_HIDE_DEPLOYMENT_GROUPS: true,
        VITE_HIDE_GITOPS_OR_HELM_OPTION: false,
        VITE_HIDE_APPLICATION_GROUPS: false,
        K8S_CLIENT: import.meta.env.VITE_REACT_APP_K8S_CLIENT === 'true',
        VITE_USE_V2: true,
        VITE_CLUSTER_TERMINAL_CONNECTION_POLLING_INTERVAL: 7000,
        VITE_CLUSTER_TERMINAL_CONNECTION_RETRY_COUNT: 7,
        VITE_ENABLE_CHART_SEARCH_IN_HELM_DEPLOY: false,
        VITE_HIDE_EXCLUDE_INCLUDE_GIT_COMMITS: true,
        VITE_ENABLE_BUILD_CONTEXT: false,
        VITE_CLAIR_TOOL_VERSION: 'V4',
        VITE_ENABLE_RESTART_WORKLOAD: false,
        VITE_ENABLE_SCOPED_VARIABLES: false,
        VITE_DEFAULT_CI_TRIGGER_TYPE_MANUAL: false,
        VITE_ANNOUNCEMENT_BANNER_MSG: '',
        VITE_LOGIN_PAGE_IMAGE: '',
        VITE_LOGIN_PAGE_IMAGE_BG: '',
        VITE_HIDE_DEFAULT_CLUSTER: false,
        VITE_GLOBAL_API_TIMEOUT: 60000,
        VITE_TRIGGER_API_TIMEOUT: 60000,
        VITE_LOGIN_DT_LOGO: '',
        VITE_SIDEBAR_DT_LOGO: '',
    }
}

ReactDOM.render(
    <React.StrictMode>
        {window.top === window.self ? (
            <BrowserRouter basename={window.__BASE_URL__}>
                <App />
            </BrowserRouter>
        ) : null}
    </React.StrictMode>,
    root,
)

// if (import.meta.env.VITE_NODE_ENV === 'development') {
//     (module as any).hot.accept()
// }
