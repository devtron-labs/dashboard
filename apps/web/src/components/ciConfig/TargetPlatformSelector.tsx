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

import { SelectPicker, SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as WarningIcon } from '@Icons/ic-warning.svg'
import { ReactComponent as ICInfoOutlineGrey } from '@Icons/ic-info-outline-grey.svg'
import { DockerConfigOverrideKeys } from '../ciPipeline/types'
import { TARGET_PLATFORM_LIST } from './CIConfig.utils'
import { SelectorMessaging } from './ciConfigConstant'
import { TargetPlatformSelectorType } from './types'

const renderMenuListFooter = () => (
    <div className="cn-5 px-12 py-4 dc__italic-font-style flex left dc__gap-6">
        <ICInfoOutlineGrey className="icon-dim-16 icon-n6" />
        {SelectorMessaging.TARGET_SELECTOR_MENU}
    </div>
)

const TargetPlatformSelector = ({
    allowOverride,
    selectedTargetPlatforms,
    setSelectedTargetPlatforms,
    showCustomPlatformWarning,
    setShowCustomPlatformWarning,
    targetPlatformMap,
    targetPlatform,
    configOverrideView,
    updateDockerConfigOverride,
}: TargetPlatformSelectorType) => {
    const handlePlatformChange = (selectedValue): void => {
        setSelectedTargetPlatforms(selectedValue)

        if (configOverrideView) {
            updateDockerConfigOverride(DockerConfigOverrideKeys.targetPlatform, selectedValue)
        }
    }

    const handleCreateNewOption: SelectPickerProps<string, boolean>['onCreateOption'] = (
        inputValue,
    ): void => {
        const _selectedTargetPlatforms = [
            ...selectedTargetPlatforms,
            {
                label: inputValue,
                value: inputValue,
            },
        ]
        setSelectedTargetPlatforms(_selectedTargetPlatforms)
        setShowCustomPlatformWarning(!targetPlatformMap.get(inputValue))

        if (configOverrideView) {
            updateDockerConfigOverride(DockerConfigOverrideKeys.targetPlatform, _selectedTargetPlatforms)
        }
    }

    const handleCreatableBlur: SelectPickerProps['onBlur'] = () => {
        setShowCustomPlatformWarning(
            selectedTargetPlatforms.some((targetPlatform) => !targetPlatformMap.get(targetPlatform.value)),
        )
    }

    const getOverridenValue = () => {
        if (!targetPlatform) {
            return (
                <div className="bcn-1 br-4 flex cn-7 pt-8 pb-8">
                    {SelectorMessaging.PALTFORM_DESCRIPTION_WITH_NO_TARGET}
                </div>
            )
        }
        if (!targetPlatform.includes(',')) {
            return (
                <div
                    className="en-2 bw-1 br-4 dc__w-fit-content pl-8 pr-8 pt-2 pb-2 mr-8 dc__truncate-text "
                    style={{ maxWidth: '100px' }}
                >
                    {targetPlatform}
                </div>
            )
        }
        return (
            <div className="flex left ">
                {targetPlatform.split(',').map((val) => {
                    return (
                        <div
                            className="en-2 bw-1 br-4 dc__w-fit-content pl-8 pr-8 pt-2 pb-2 mr-8 dc__truncate-text "
                            style={{ maxWidth: '100px' }}
                        >
                            {val}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="mb-0">
            <div className="fs-13 fw-6">
                {!allowOverride && configOverrideView ? 'Target' : 'Set target'} platform for the build
            </div>
            <div className="fs-13 fw-4 cn-7 mb-12">{SelectorMessaging.PALTFORM_DESCRIPTION}</div>
            {!allowOverride && configOverrideView ? (
                getOverridenValue()
            ) : (
                <SelectPicker
                    value={selectedTargetPlatforms}
                    isMulti
                    isCreatable
                    onCreateOption={handleCreateNewOption}
                    name="targetPlatform"
                    placeholder="Type to select or create"
                    options={TARGET_PLATFORM_LIST}
                    inputId="target-platform__select"
                    onChange={handlePlatformChange}
                    hideSelectedOptions={false}
                    renderMenuListFooter={renderMenuListFooter}
                    onBlur={handleCreatableBlur}
                />
            )}
            {showCustomPlatformWarning && (
                <span className="flexbox cy-7 mt-2">
                    <WarningIcon className="warning-icon-y7 icon-dim-16 mr-5 mt-2" />
                    {allowOverride
                        ? SelectorMessaging.WARNING_WITH_NO_TARGET
                        : configOverrideView
                          ? SelectorMessaging.WARNING_WITH_USING_NO_TARGET
                          : SelectorMessaging.WARNING_WITH_NO_TARGET}
                </span>
            )}
        </div>
    )
}

export default TargetPlatformSelector
