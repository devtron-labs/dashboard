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
    ComponentSizeType,
    CONFIGURATION_TYPE_OPTIONS,
    ConfigurationType,
    InvalidYAMLTippyWrapper,
    SegmentedControl,
    SegmentedControlProps,
} from '@devtron-labs/devtron-fe-common-lib'

import DTChartSelector from './DTChartSelector'
import { DeploymentTemplateOptionsHeaderProps } from './types'

const DeploymentTemplateOptionsHeader = ({
    disableVersionSelect,
    editMode,
    showReadMe,
    isUnSet,
    handleChangeToGUIMode,
    handleChangeToYAMLMode,
    parsingError,
    restoreLastSavedTemplate,
    handleChartChange,
    chartDetails,
    selectedChart,
    isCompareView,
    isGuiSupported,
    areChartsLoading,
    showDeleteOverrideDraftEmptyState,
    migratedFrom,
}: DeploymentTemplateOptionsHeaderProps) => {
    if (isCompareView || showReadMe || showDeleteOverrideDraftEmptyState) {
        return null
    }

    const handleToggleEditMode: SegmentedControlProps['onChange'] = (selectedSegment) => {
        if (selectedSegment.value === ConfigurationType.YAML) {
            handleChangeToYAMLMode()
            return
        }

        handleChangeToGUIMode()
    }

    return (
        <div className="flexbox dc__align-items-center dc__content-space bg__primary dc__gap-8">
            {isGuiSupported && (
                <>
                    <InvalidYAMLTippyWrapper
                        parsingError={parsingError}
                        restoreLastSavedYAML={restoreLastSavedTemplate}
                    >
                        <div>
                            <SegmentedControl
                                segments={CONFIGURATION_TYPE_OPTIONS}
                                value={editMode}
                                onChange={handleToggleEditMode}
                                disabled={!!parsingError}
                                size={ComponentSizeType.xs}
                                name="dt-yaml-gui-segmented-control"
                            />
                        </div>
                    </InvalidYAMLTippyWrapper>

                    <div className="dc__border-right-n1 h-16" />
                </>
            )}

            <DTChartSelector
                isUnSet={isUnSet}
                charts={chartDetails.charts}
                chartsMetadata={chartDetails.chartsMetadata}
                selectedChart={selectedChart}
                selectedChartRefId={selectedChart?.chartRefId}
                selectChart={handleChartChange}
                disableVersionSelect={disableVersionSelect}
                areChartsLoading={areChartsLoading}
                parsingError={parsingError}
                restoreLastSavedTemplate={restoreLastSavedTemplate}
                migratedFrom={migratedFrom}
            />
        </div>
    )
}

export default DeploymentTemplateOptionsHeader
