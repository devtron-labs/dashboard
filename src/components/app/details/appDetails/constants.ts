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

import ReactGA from 'react-ga4'

export const APP_METRICS_CALENDAR_INPUT_DATE_FORMAT = 'DD-MM-YYYY hh:mm:ss'

export const DA_APP_DETAILS_GA_EVENTS: Record<string, Parameters<typeof ReactGA.event>[0]> = {
    DeployButtonClicked: {
        category: 'App Details',
        action: 'DA_APP_DETAIL_DEPLOY',
    },
    GoToEnvironmentConfiguration: {
        category: 'App Details',
        action: 'DA_APP_DETAIL_GO_TO_ENV_CONFIG',
    },
    MetricsApplyTimeChange: {
        category: 'App Metrics',
        action: 'DA_APP_DETAIL_METRICS_APPLY_TIME_RANGE',
    },
    MetricsPresetTimeRange: {
        category: 'App Metrics',
        action: 'DA_APP_DETAIL_METRICS_PRESET_TIME_RANGE',
    },
}

export const AG_APP_DETAILS_GA_EVENTS: Record<string, Parameters<typeof ReactGA.event>[0]> = {
    DeployButtonClicked: {
        category: 'App Details',
        action: 'AG_APP_DETAIL_DEPLOY',
    },
    GoToEnvironmentConfiguration: {
        category: 'App Details',
        action: 'AG_APP_DETAIL_GO_TO_ENV_CONFIG',
    },
}
