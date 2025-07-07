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

import { DeploymentAppTypes, TriggerType } from '@devtron-labs/devtron-fe-common-lib'

import { sanitizeValidateMigrationSourceResponse } from './MigrateToDevtron/utils'
import { MigrateToDevtronFormState } from './cdPipeline.types'

// NOTE: Please don't add any react node in the default value of the form state since we are doing structuredClone
export const MIGRATE_TO_DEVTRON_FORM_STATE: MigrateToDevtronFormState = {
    deploymentAppType: DeploymentAppTypes.HELM,
    migrateFromArgoFormState: {
        appName: '',
        namespace: '',
        clusterId: null,
        clusterName: '',
        validationResponse: sanitizeValidateMigrationSourceResponse(null, DeploymentAppTypes.GITOPS),
        appIcon: null,
    },
    migrateFromHelmFormState: {
        appName: '',
        namespace: '',
        clusterId: null,
        clusterName: '',
        validationResponse: sanitizeValidateMigrationSourceResponse(null, DeploymentAppTypes.HELM),
        appIcon: null,
    },
    triggerType: TriggerType.Auto,
}
