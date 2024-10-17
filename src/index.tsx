/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from '@sentry/browser'
import { CaptureConsole } from '@sentry/integrations'
import { BrowserRouter } from 'react-router-dom'
import { BrowserTracing } from '@sentry/tracing'
import { ShortcutProvider } from 'react-keybind'
import App from './App'
import { ToastManagerContainer, UserEmailProvider, customEnv } from '@devtron-labs/devtron-fe-common-lib'

declare global {
    interface Window {
        _env_: customEnv
        hj: any
        _hjSettings: any
        Worker: any
        __BASE_URL__: string
        __ORCHESTRATOR_ROOT__: string
        __GRAFANA_ORG_ID__: number
    }
}

if (!window.__BASE_URL__ || !window.__ORCHESTRATOR_ROOT__) {
    window.__BASE_URL__ = import.meta.env.BASE_URL || '/dashboard'
    window.__ORCHESTRATOR_ROOT__ = import.meta.env.VITE_ORCHESTRATOR_ROOT || 'orchestrator'
    window.__GRAFANA_ORG_ID__ = import.meta.env.VITE_GRAFANA_ORG_ID || 2
}

const root = document.getElementById('root')
if (import.meta.env.VITE_NODE_ENV === 'production' && window._env_ && window._env_.SENTRY_ERROR_ENABLED) {
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
        ...(window._env_.NODE_REACT_APP_GIT_SHA ? { release: `dashboard@${window._env_.REACT_APP_GIT_SHA}` } : {}),
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
        GTM_ENABLED: false,
        APPLICATION_METRICS_ENABLED: false,
        POSTHOG_ENABLED: false,
        POSTHOG_TOKEN: '',
        RECOMMEND_SECURITY_SCANNING: false,
        FORCE_SECURITY_SCANNING: false,
        ENABLE_CI_JOB: false,
        HIDE_DISCORD: true,
        DEVTRON_APP_DETAILS_POLLING_INTERVAL: 30000,
        HELM_APP_DETAILS_POLLING_INTERVAL: 30000,
        EA_APP_DETAILS_POLLING_INTERVAL: 30000,
        CENTRAL_API_ENDPOINT: 'https://api-stage.devtron.ai',
        // Remove this in next sprint, have'nt removed yet for backward compatibility
        HIDE_GITOPS_OR_HELM_OPTION: false,
        HIDE_APPLICATION_GROUPS: false,
        K8S_CLIENT: import.meta.env.VITE_K8S_CLIENT === 'true',
        CLUSTER_TERMINAL_CONNECTION_POLLING_INTERVAL: 7000,
        CLUSTER_TERMINAL_CONNECTION_RETRY_COUNT: 7,
        ENABLE_CHART_SEARCH_IN_HELM_DEPLOY: false,
        HIDE_EXCLUDE_INCLUDE_GIT_COMMITS: true,
        ENABLE_BUILD_CONTEXT: false,
        CLAIR_TOOL_VERSION: 'V4',
        ENABLE_RESTART_WORKLOAD: false,
        ENABLE_SCOPED_VARIABLES: false,
        DEFAULT_CI_TRIGGER_TYPE_MANUAL: false,
        ANNOUNCEMENT_BANNER_MSG: '',
        LOGIN_PAGE_IMAGE: '',
        LOGIN_PAGE_IMAGE_BG: '',
        HIDE_DEFAULT_CLUSTER: false,
        GLOBAL_API_TIMEOUT: 60000,
        TRIGGER_API_TIMEOUT: 60000,
        LOGIN_DT_LOGO: '',
        SIDEBAR_DT_LOGO: '',
        ENABLE_EXTERNAL_ARGO_CD: false,
        API_BATCH_SIZE: 20,
        SERVICE_WORKER_TIMEOUT: '1',
        ENABLE_RESOURCE_SCAN: false,
        FEATURE_USER_DEFINED_GITOPS_REPO_ENABLE: false,
        ENABLE_RESOURCE_SCAN_V2: false,
        HIDE_RELEASES: true,
        HIDE_RESOURCE_WATCHER: true,
        ORGANIZATION_NAME: '',
        FEATURE_EXTERNAL_FLUX_CD_ENABLE: false,
        FEATURE_SCOPED_VARIABLE_ENVIRONMENT_LIST_ENABLE: false,
        HIDE_NETWORK_STATUS_INTERFACE: true,
        SYSTEM_CONTROLLER_LISTING_TIMEOUT: 60000 * 5,
        FEATURE_STEP_WISE_LOGS_ENABLE: true,
        FEATURE_IMAGE_PROMOTION_ENABLE: false,
    }
}

ReactDOM.render(
    <React.StrictMode>
        {window.top === window.self ? (
            <BrowserRouter basename={window.__BASE_URL__}>
                <ShortcutProvider>
                    <UserEmailProvider>
                        <App />
                    </UserEmailProvider>
                </ShortcutProvider>
                <ToastManagerContainer />
            </BrowserRouter>
        ) : null}
    </React.StrictMode>,
    root,
)
