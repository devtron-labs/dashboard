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

import React, { useContext } from 'react'
import {
    ConditionalWrap,
    TippyCustomized,
    TippyTheme,
    StyledRadioGroup as RadioGroup,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentChartVersionType, DeploymentConfigContextType, DeploymentConfigStateActionTypes } from '../types'
import { ChartTypeVersionOptions } from './DeploymentTemplateView.component'
import { DeploymentConfigContext } from '../DeploymentConfig'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as RestoreIcon } from '../../../assets/icons/ic-arrow-anticlockwise.svg'

interface DeploymentTemplateOptionsTabProps {
    isEnvOverride?: boolean
    codeEditorValue: string
    disableVersionSelect?: boolean
    isValues?: boolean
}

export default function DeploymentTemplateOptionsTab({
    isEnvOverride,
    codeEditorValue,
    disableVersionSelect,
    isValues,
}: DeploymentTemplateOptionsTabProps) {
    const { isUnSet, state, dispatch, isConfigProtectionEnabled, changeEditorMode } =
        useContext<DeploymentConfigContextType>(DeploymentConfigContext)
    const currentStateValues =
        state.selectedTabIndex === 1 && isConfigProtectionEnabled && !!state.latestDraft ? state.publishedState : state

    if (state.openComparison || state.showReadme) {
        return null
    }

    const selectChart = (selectedChart: DeploymentChartVersionType) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                selectedChart,
                selectedChartRefId: selectedChart.id,
            },
        })
    }

    const onChangeEditorMode = (e) => {
        if ((e.target.value === 'yaml' && state.yamlMode) || (e.target.value === 'gui' && !state.yamlMode)) {
        } else {
            changeEditorMode()
        }
    }

    const restoreLastSaved = () => {
        if (!isValues) {
            return
        }
        if (isEnvOverride) {
            const overriddenValues = state.latestDraft ? state.draftValues : YAMLStringify(state.duplicate)
            const _envValues =
                state.data.IsOverride || state.duplicate ? overriddenValues : YAMLStringify(state.data.globalConfig)

            dispatch({
                type: DeploymentConfigStateActionTypes.tempFormData,
                payload: _envValues,
            })
        } else {
            dispatch({
                type: DeploymentConfigStateActionTypes.tempFormData,
                // Explicitly setting getTrimmedManifestData(parsedManifest) as object to avoid type error from YAMLStringify.
                payload: state.latestDraft ? state.draftValues : YAMLStringify(state.template),
            })
        }
    }

    const getRestoreLastSavedCTA = () => (
        <div
            className="flex left fs-13 fw-6 cb-5 pb-12 pl-12 pr-12 cursor dc_width-max-content"
            onClick={restoreLastSaved}
        >
            <RestoreIcon className="icon-dim-14 mr-4 scb-5" /> Restore last saved YAML
        </div>
    )

    const invalidYamlTippyWrapper = (children) => (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-250"
            placement="bottom"
            Icon={ErrorIcon}
            heading="Invalid YAML"
            infoText="The provided YAML is invalid. GUI view can only be generated for a valid YAML."
            additionalContent={getRestoreLastSavedCTA()}
            trigger="mouseenter click"
            interactive
            showCloseButton
        >
            <span>{children}</span>
        </TippyCustomized>
    )

    const _unableToParseYaml = state.unableToParseYaml && (!state.latestDraft || state.selectedTabIndex === 3)

    return (
        <div className="dt-options-tab-container flex dc__content-space pl-16 pr-16">
            <div className="flex">
                <ChartTypeVersionOptions
                    isUnSet={isUnSet}
                    charts={currentStateValues.charts}
                    chartsMetadata={currentStateValues.chartsMetadata}
                    selectedChart={currentStateValues.selectedChart}
                    selectChart={selectChart}
                    selectedChartRefId={currentStateValues.selectedChartRefId}
                    disableVersionSelect={disableVersionSelect}
                />
                <ConditionalWrap condition={_unableToParseYaml} wrap={invalidYamlTippyWrapper}>
                    <RadioGroup
                        className="gui-yaml-switch"
                        name="yaml-mode"
                        initialTab={state.yamlMode ? 'yaml' : 'gui'}
                        disabled={_unableToParseYaml}
                        onChange={onChangeEditorMode}
                    >
                        <RadioGroup.Radio value="gui" canSelect={!state.chartConfigLoading && codeEditorValue}>
                            GUI
                        </RadioGroup.Radio>
                        <RadioGroup.Radio
                            value="yaml"
                            canSelect={disableVersionSelect && state.chartConfigLoading && codeEditorValue}
                            dataTestId="base-deployment-template-advanced-button"
                        >
                            {_unableToParseYaml && <ErrorIcon className="icon-dim-12 dc__no-svg-stroke mr-6" />}
                            YAML
                        </RadioGroup.Radio>
                    </RadioGroup>
                </ConditionalWrap>
            </div>
        </div>
    )
}
