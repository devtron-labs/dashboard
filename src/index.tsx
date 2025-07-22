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
import {
    OverrideMergeStrategyType,
    ToastManagerContainer,
    UseRegisterShortcutProvider,
    UserEmailProvider,
    customEnv,
    ThemeProvider,
} from '@devtron-labs/devtron-fe-common-lib'
import App from './App'

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
        ...(window._env_.SENTRY_RELEASE_VERSION ? { release: window._env_.SENTRY_RELEASE_VERSION } : {}),
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
        GA_ENABLED: false,
        GTM_ENABLED: false,
        APPLICATION_METRICS_ENABLED: true,
        POSTHOG_ENABLED: false,
        POSTHOG_TOKEN: '',
        RECOMMEND_SECURITY_SCANNING: false,
        FORCE_SECURITY_SCANNING: false,
        ENABLE_CI_JOB: true,
        HIDE_DISCORD: true,
        DEVTRON_APP_DETAILS_POLLING_INTERVAL: 30000,
        HELM_APP_DETAILS_POLLING_INTERVAL: 30000,
        EA_APP_DETAILS_POLLING_INTERVAL: 30000,
        CENTRAL_API_ENDPOINT: 'https://api-stage.devtron.ai',
        HIDE_GITOPS_OR_HELM_OPTION: false,
        K8S_CLIENT: import.meta.env.VITE_K8S_CLIENT === 'true',
        CLUSTER_TERMINAL_CONNECTION_POLLING_INTERVAL: 7000,
        CLUSTER_TERMINAL_CONNECTION_RETRY_COUNT: 7,
        ENABLE_CHART_SEARCH_IN_HELM_DEPLOY: true,
        HIDE_EXCLUDE_INCLUDE_GIT_COMMITS: true,
        ENABLE_BUILD_CONTEXT: true,
        CLAIR_TOOL_VERSION: 'V4',
        ENABLE_RESTART_WORKLOAD: true,
        ENABLE_SCOPED_VARIABLES: true,
        DEFAULT_CI_TRIGGER_TYPE_MANUAL: false,
        ANNOUNCEMENT_BANNER_MSG: '',
        ANNOUNCEMENT_BANNER_TYPE: 'help',
        ANNOUNCEMENT_BANNER_BUTTON_TEXT: 'Learn more',
        ANNOUNCEMENT_BANNER_BUTTON_LINK: '',
        HIDE_DEFAULT_CLUSTER: false,
        GLOBAL_API_TIMEOUT: 60000,
        TRIGGER_API_TIMEOUT: 60000,
        SIDEBAR_DT_LOGO: '',
        ENABLE_EXTERNAL_ARGO_CD: true,
        API_BATCH_SIZE: 20,
        FEATURE_USER_DEFINED_GITOPS_REPO_ENABLE: true,
        FEATURE_INTERNET_CONNECTIVITY_ENABLE: true,
        SERVICE_WORKER_TIMEOUT: '3',
        HIDE_RELEASES: false,
        HIDE_RESOURCE_WATCHER: false,
        ORGANIZATION_NAME: '',
        FEATURE_EXTERNAL_FLUX_CD_ENABLE: true,
        FEATURE_SCOPED_VARIABLE_ENVIRONMENT_LIST_ENABLE: true,
        HIDE_NETWORK_STATUS_INTERFACE: true,
        SYSTEM_CONTROLLER_LISTING_TIMEOUT: 60000 * 5,
        FEATURE_IMAGE_PROMOTION_ENABLE: false,
        FEATURE_HIDE_USER_DIRECT_PERMISSIONS_FOR_NON_SUPER_ADMINS: false,
        FEATURE_CONFIG_DRIFT_ENABLE: true,
        FEATURE_PROMO_EMBEDDED_BUTTON_TEXT: '',
        FEATURE_PROMO_EMBEDDED_MODAL_TITLE: '',
        FEATURE_SWAP_TRAFFIC_ENABLE: true,
        FEATURE_BULK_RESTART_WORKLOADS_FROM_RB: 'deployment,rollout,daemonset,statefulset',
        FEATURE_RB_SYNC_CLUSTER_ENABLE: true,
        FEATURE_PROMO_EMBEDDED_IFRAME_URL: '',
        FEATURE_DEFAULT_MERGE_STRATEGY: OverrideMergeStrategyType.PATCH,
        FEATURE_DEFAULT_LANDING_RB_ENABLE: false,
        FEATURE_CLUSTER_MAP_ENABLE: true,
        FEATURE_ACTION_AUDIOS_ENABLE: true,
        FEATURE_APPLICATION_TEMPLATES_ENABLE: true,
        FEATURE_DEFAULT_AUTHENTICATED_VIEW_ENABLE: false,
        GATEKEEPER_URL: 'https://license.devtron.ai/dashboard',
        FEATURE_AI_INTEGRATION_ENABLE: true,
        LOGIN_PAGE_IMAGE: '',
        FEATURE_ASK_DEVTRON_EXPERT: false,
        FEATURE_MANAGE_TRAFFIC_ENABLE: true,
        FEATURE_REDFISH_NODE_ENABLE: false,
        FEATURE_INFRA_PROVISION_INFO_BLOCK_HIDE: false,
        FEATURE_GROUPED_APP_LIST_FILTERS_ENABLE: true,
        FEATURE_FLUX_DEPLOYMENTS_ENABLE: false,
        FEATURE_LINK_EXTERNAL_FLUX_ENABLE: false,
        FEATURE_CANARY_ROLLOUT_PROGRESS_ENABLE: true,
    }
}

ReactDOM.render(
    <React.StrictMode>
        {window.top === window.self ? (
            <ThemeProvider>
                <BrowserRouter basename={window.__BASE_URL__}>
                    <UseRegisterShortcutProvider>
                        <UserEmailProvider>
                            <App />
                        </UserEmailProvider>
                    </UseRegisterShortcutProvider>
                    <ToastManagerContainer />
                </BrowserRouter>
            </ThemeProvider>
        ) : null}
    </React.StrictMode>,
    root,
)
