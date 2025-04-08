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

import { useContext } from 'react'

import {
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICUpdateAnimated } from '@Icons/ic-update-animated.svg'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'

import { PluginVersionSelectOptionType, PluginVersionSelectProps } from '../types'
import { getPluginVersionSelectOption } from './utils'

// Here assumption is step type is always PLUGIN_REF
const PluginVersionSelect = ({ handlePluginVersionChange }: PluginVersionSelectProps) => {
    const { formData, activeStageName, selectedTaskIndex, pluginDataStore } = useContext(pipelineContext)

    const selectedPluginId = formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.pluginId
    const { parentPluginId, id, pluginVersion } = pluginDataStore.pluginVersionStore[selectedPluginId]
    const { pluginVersions: pluginVersionList, latestVersionId } = pluginDataStore.parentPluginStore[parentPluginId]
    const isLatest = latestVersionId === selectedPluginId
    const options: SelectPickerOptionType[] = pluginVersionList.map((plugin) =>
        getPluginVersionSelectOption(plugin.pluginVersion, plugin.id, plugin.isLatest),
    )

    const handleChange = (selectedOption: PluginVersionSelectOptionType) => {
        if (selectedOption.value === selectedPluginId) {
            return
        }

        // No need to await this change since either will call the API which would unmount this component else will update the plugin version
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handlePluginVersionChange(selectedOption.value)
    }

    const currentValue = getPluginVersionSelectOption(pluginVersion, id, isLatest)

    return (
        <>
            <div className="flexbox dc__mxw-280">
                <SelectPicker
                    options={options}
                    value={currentValue}
                    classNamePrefix="plugin-detail-header__version-select"
                    inputId="plugin-detail-header__version-select"
                    placeholder="Version"
                    variant={SelectPickerVariantType.COMPACT}
                    onChange={handleChange}
                    onKeyDown={stopPropagation}
                />
            </div>

            {!isLatest && (
                <>
                    <div className="dc__border-right--n1 h-16" />
                    <div className="flexbox dc__gap-6 dc__align-items-center">
                        <ICUpdateAnimated className="dc__no-shrink icon-dim-14" />
                        <span className="cg-5 fs-12 fw-5 lh-16">New version available</span>
                    </div>
                </>
            )}
        </>
    )
}

export default PluginVersionSelect
