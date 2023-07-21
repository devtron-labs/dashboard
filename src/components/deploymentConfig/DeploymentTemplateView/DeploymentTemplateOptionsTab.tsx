import React, { useContext } from 'react'
import { DEPLOYMENT, ROLLOUT_DEPLOYMENT } from '../../../config'
import { RadioGroup } from '../../common'
import { BASIC_VIEW_TIPPY_CONTENT } from '../constants'
import { DeploymentChartVersionType, DeploymentConfigContextType, DeploymentConfigStateActionTypes } from '../types'
import { ChartTypeVersionOptions } from './DeploymentTemplateView.component'
import { ReactComponent as Locked } from '../../../assets/icons/ic-locked.svg'
import { DeploymentConfigContext } from '../DeploymentConfig'

interface DeploymentTemplateOptionsTabProps {
    disableVersionSelect?
    codeEditorValue
}

export default function DeploymentTemplateOptionsTab({
    disableVersionSelect,
    codeEditorValue,
}: DeploymentTemplateOptionsTabProps) {
    const { isUnSet, state, dispatch, changeEditorMode } =
        useContext<DeploymentConfigContextType>(DeploymentConfigContext)

    if (state.openComparison || state.showReadme) return null

    const selectChart = (selectedChart: DeploymentChartVersionType) => {
        dispatch({
            type: DeploymentConfigStateActionTypes.multipleOptions,
            payload: {
                selectedChart,
                selectedChartRefId: selectedChart.id,
            },
        })
    }

    return (
        <div className="dt-options-tab-container flex dc__content-space pl-16 pr-16">
            <div className="flex">
                <ChartTypeVersionOptions
                    isUnSet={isUnSet}
                    charts={state.charts}
                    chartsMetadata={state.chartsMetadata}
                    selectedChart={state.selectedChart}
                    selectChart={selectChart}
                    selectedChartRefId={state.selectedChartRefId}
                    disableVersionSelect={disableVersionSelect}
                />
                {(state.selectedChart?.name === ROLLOUT_DEPLOYMENT || state.selectedChart?.name === DEPLOYMENT) && (
                    <RadioGroup
                        className="gui-yaml-switch pl-16"
                        name="yaml-mode"
                        initialTab={state.yamlMode ? 'yaml' : 'gui'}
                        disabled={state.isBasicLocked}
                        onChange={changeEditorMode}
                    >
                        <RadioGroup.Radio
                            dataTestid="base-deployment-template-basic-button"
                            value="gui"
                            canSelect={!state.chartConfigLoading && !state.isBasicLocked && codeEditorValue}
                            isDisabled={state.isBasicLocked}
                            showTippy={state.isBasicLocked}
                            tippyClass="default-white no-content-padding tippy-shadow"
                            dataTestId="base-deployment-template-basic-button"
                            tippyContent={
                                <>
                                    <div className="flexbox fw-6 p-12 dc__border-bottom-n1">
                                        <Locked className="icon-dim-20 mr-6 fcy-7" />
                                        <span className="fs-14 fw-6 cn-9">{BASIC_VIEW_TIPPY_CONTENT.title}</span>
                                    </div>
                                    <div className="fs-13 fw-4 cn-9 p-12">{BASIC_VIEW_TIPPY_CONTENT.infoText}</div>
                                </>
                            }
                        >
                            {state.isBasicLocked && <Locked className="icon-dim-12 mr-6" />}
                            Basic
                        </RadioGroup.Radio>
                        <RadioGroup.Radio
                            value="yaml"
                            canSelect={
                                disableVersionSelect &&
                                state.chartConfigLoading &&
                                codeEditorValue &&
                                state.basicFieldValuesErrorObj?.isValid
                            }
                            dataTestId="base-deployment-template-advanced-button"
                        >
                            Advanced (YAML)
                        </RadioGroup.Radio>
                    </RadioGroup>
                )}
            </div>
        </div>
    )
}
