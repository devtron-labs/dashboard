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

import {
    Button,
    ButtonVariantType,
    CMSecretComponentType,
    ComponentSizeType,
    GenericEmptyState,
    ImageType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import cmCsEmptyState from '@Images/cm-cs-empty-state.png'

import { NoOverrideEmptyStateProps } from './types'

import './NoOverrideEmptyState.scss'

const getNoOverrideEmptyStateTitle = ({
    componentType,
    environmentName,
    configName,
}: Pick<NoOverrideEmptyStateProps, 'componentType' | 'environmentName' | 'configName'>): string => {
    if (componentType === CMSecretComponentType.ConfigMap) {
        return `ConfigMap '${configName}': Not overridden for '${environmentName}'`
    }

    if (componentType === CMSecretComponentType.Secret) {
        return `Secret '${configName}': Not overridden for '${environmentName}'`
    }

    return `Deployment template: Not overridden for '${environmentName}'`
}

const renderCreateOverrideButton =
    ({ handleCreateOverride }: Pick<NoOverrideEmptyStateProps, 'handleCreateOverride'>) =>
    () => (
        <Button
            onClick={handleCreateOverride}
            startIcon={<ICAdd />}
            size={ComponentSizeType.large}
            dataTestId="create-override-button"
            text="Create Override"
        />
    )

const NoOverrideEmptyState = ({
    componentType,
    configName,
    environmentName,
    hideOverrideButton,
    handleCreateOverride,
    handleViewInheritedConfig,
}: NoOverrideEmptyStateProps) => (
    <div className="no-override-empty-state-container flexbox-col flex-grow-1 dc__overflow-auto">
        <GenericEmptyState
            image={cmCsEmptyState}
            title={getNoOverrideEmptyStateTitle({ componentType, environmentName, configName })}
            subTitle="Override configurations for this environment and set a merge strategy. The merge strategy determines how overrides are combined with inherited configurations."
            imageType={ImageType.Large}
            isButtonAvailable={!hideOverrideButton}
            renderButton={renderCreateOverrideButton({ handleCreateOverride })}
        >
            <Button
                onClick={handleViewInheritedConfig}
                size={ComponentSizeType.medium}
                text="View inherited"
                variant={ButtonVariantType.text}
                dataTestId="view-inherited-config-button"
            />
        </GenericEmptyState>
    </div>
)

export default NoOverrideEmptyState
