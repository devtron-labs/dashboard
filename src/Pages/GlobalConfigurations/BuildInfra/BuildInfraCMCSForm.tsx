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

import { BuildInfraCMCSFormProps, noop } from '@devtron-labs/devtron-fe-common-lib'

import { ConfigMapSecretForm } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecretForm'

const BuildInfraCMCSForm = ({ parsedData, useFormProps, componentType }: BuildInfraCMCSFormProps) => (
    <ConfigMapSecretForm
        isCreateView={!parsedData.canOverride && parsedData.isOverridden}
        configMapSecretData={parsedData.initialResponse}
        inheritedConfigMapSecretData={parsedData.initialResponse}
        cmSecretStateLabel={null}
        isJob
        appChartRef={null}
        isApprovalPolicyConfigured={false}
        areScopeVariablesResolving={false}
        disableDataTypeChange={false}
        componentType={componentType}
        useFormProps={useFormProps}
        isExternalSubmit
        noContainerPadding
        draftData={null}
        handleMergeStrategyChange={noop}
        isExpressEditComparisonView={null}
        isExpressEditView={null}
        publishedConfigMapSecretData={null}
    />
)

export default BuildInfraCMCSForm
