import React, { useContext } from 'react'
import { DEPLOYMENT, ROLLOUT_DEPLOYMENT } from '../../../config'
import { RadioGroup } from '../../common'
import { BASIC_VIEW_TIPPY_CONTENT } from '../constants'
import { DeploymentChartVersionType, DeploymentConfigContextType, DeploymentConfigStateActionTypes } from '../types'
import { ChartTypeVersionOptions } from './DeploymentTemplateView.component'
import { ReactComponent as Locked } from '../../../assets/icons/ic-locked.svg'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as RestoreIcon } from '../../../assets/icons/ic-arrow-anticlockwise.svg'
import { DeploymentConfigContext } from '../DeploymentConfig'
import { ConditionalWrap, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'

interface DeploymentTemplateOptionsTabProps {
    isEnvOverride?: boolean
    codeEditorValue: string
    disableVersionSelect?: boolean
    isValues?:boolean
}

export default function DeploymentTemplateOptionsTab({
    isEnvOverride,
    codeEditorValue,
    disableVersionSelect,
    isValues
}: DeploymentTemplateOptionsTabProps) {
    const { isUnSet, state, dispatch, isConfigProtectionEnabled, changeEditorMode } =
        useContext<DeploymentConfigContextType>(DeploymentConfigContext)
    const currentStateValues =
        state.selectedTabIndex === 1 && isConfigProtectionEnabled && !!state.latestDraft ? state.publishedState : state 

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

    const onChangeEditorMode = (e) => {
        if ((e.target.value === 'yaml' && state.yamlMode) || (e.target.value === 'gui' && !state.yamlMode)) {
            return
        } else {
            changeEditorMode()
        }
    }

    const restoreLastSaved = () => {
        if (isEnvOverride) {
            const overriddenValues = !!state.latestDraft
                ? state.draftValues
                : YAML.stringify(state.duplicate, { indent: 2 })
            const _envValues =
                state.data.IsOverride || state.duplicate
                    ? overriddenValues
                    : YAML.stringify(state.data.globalConfig, { indent: 2 })
            if(isValues){     
                dispatch({
                    type: DeploymentConfigStateActionTypes.tempFormData,
                    payload: _envValues,
                })
            }
        } else {
            if(isValues){
                dispatch({
                    type: DeploymentConfigStateActionTypes.tempFormData,
                    payload: !!state.latestDraft ? state.draftValues : YAML.stringify(state.template, { indent: 2 }),
                })
            }
        }
    }

    const getRestoreLastSavedCTA = () => {
        return (
            <div
                className="flex left fs-13 fw-6 cb-5 pb-12 pl-12 pr-12 cursor dc_width-max-content"
                onClick={restoreLastSaved}
            >
                <RestoreIcon className="icon-dim-14 mr-4 scb-5" /> Restore last saved YAML
            </div>
        )
    }

    const invalidYamlTippyWrapper = (children) => {
        return (
            <TippyCustomized
                theme={TippyTheme.white}
                className="w-250"
                placement="bottom"
                Icon={ErrorIcon}
                heading="Invalid YAML"
                infoText="The provided YAML is invalid. Basic (GUI) view can only be generated for a valid YAML."
                additionalContent={getRestoreLastSavedCTA()}
                trigger="mouseenter click"
                interactive={true}
                showCloseButton={true}
            >
                <span>{children}</span>
            </TippyCustomized>
        )
    }

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
                {(currentStateValues.selectedChart?.name === ROLLOUT_DEPLOYMENT ||
                    currentStateValues.selectedChart?.name === DEPLOYMENT) && (
                    <ConditionalWrap condition={_unableToParseYaml} wrap={invalidYamlTippyWrapper}>
                        <RadioGroup
                            className="gui-yaml-switch"
                            name="yaml-mode"
                            initialTab={state.yamlMode ? 'yaml' : 'gui'}
                            disabled={currentStateValues.isBasicLocked || _unableToParseYaml}
                            onChange={onChangeEditorMode}
                        >
                            <RadioGroup.Radio
                                dataTestid="base-deployment-template-basic-button"
                                value="gui"
                                canSelect={
                                    !state.chartConfigLoading && !currentStateValues.isBasicLocked && codeEditorValue
                                }
                                isDisabled={currentStateValues.isBasicLocked}
                                showTippy={!_unableToParseYaml && currentStateValues.isBasicLocked}
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
                                {currentStateValues.isBasicLocked && <Locked className="icon-dim-12 mr-6" />}
                                Basic
                            </RadioGroup.Radio>
                            <RadioGroup.Radio
                                value="yaml"
                                canSelect={
                                    disableVersionSelect &&
                                    state.chartConfigLoading &&
                                    codeEditorValue &&
                                    currentStateValues.basicFieldValuesErrorObj?.isValid
                                }
                                dataTestId="base-deployment-template-advanced-button"
                            >
                                {_unableToParseYaml && <ErrorIcon className="icon-dim-12 dc__no-svg-stroke mr-6" />}
                                Advanced (YAML)
                            </RadioGroup.Radio>
                        </RadioGroup>
                    </ConditionalWrap>
                )}
            </div>
        </div>
    )
}
