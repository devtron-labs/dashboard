import React from 'react'
import { DEPLOYMENT, ROLLOUT_DEPLOYMENT } from '../../../config'
import { RadioGroup } from '../../common'
import { BASIC_VIEW_TIPPY_CONTENT, COMPARE_VALUES_TIPPY_CONTENT, README_TIPPY_CONTENT } from '../constants'
import { DeploymentTemplateOptionsTabProps } from '../types'
import { ChartTypeVersionOptions, CompareOptions } from './DeploymentTemplateView.component'
import { ReactComponent as Locked } from '../../../assets/icons/ic-locked.svg'

export default function DeploymentTemplateOptionsTab({
    isComparisonAvailable,
    environmentName,
    isEnvOverride,
    openComparison,
    handleComparisonClick,
    chartConfigLoading,
    openReadMe,
    isReadMeAvailable,
    handleReadMeClick,
    isUnSet,
    charts,
    chartsMetadata,
    selectedChart,
    selectChart,
    selectedChartRefId,
    disableVersionSelect,
    yamlMode,
    isBasicViewLocked,
    codeEditorValue,
    basicFieldValuesErrorObj,
    changeEditorMode,
}: DeploymentTemplateOptionsTabProps) {
    return (
        <div className="dt-options-tab-container flex dc__content-space pl-16 pr-16">
            {!openComparison && !openReadMe ? (
                <div className="flex">
                    <ChartTypeVersionOptions
                        isUnSet={isUnSet}
                        charts={charts}
                        chartsMetadata={chartsMetadata}
                        selectedChart={selectedChart}
                        selectChart={selectChart}
                        selectedChartRefId={selectedChartRefId}
                        disableVersionSelect={disableVersionSelect}
                    />
                    {(selectedChart?.name === ROLLOUT_DEPLOYMENT || selectedChart?.name === DEPLOYMENT) && (
                        <RadioGroup
                            className="gui-yaml-switch pl-16"
                            name="yaml-mode"
                            initialTab={yamlMode ? 'yaml' : 'gui'}
                            disabled={isBasicViewLocked}
                            onChange={changeEditorMode}
                        >
                            <RadioGroup.Radio
                                dataTestid="base-deployment-template-basic-button"
                                value="gui"
                                canSelect={!chartConfigLoading && !isBasicViewLocked && codeEditorValue}
                                isDisabled={isBasicViewLocked}
                                showTippy={isBasicViewLocked}
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
                                {isBasicViewLocked && <Locked className="icon-dim-12 mr-6" />}
                                Basic
                            </RadioGroup.Radio>
                            <RadioGroup.Radio
                                value="yaml"
                                canSelect={
                                    disableVersionSelect &&
                                    chartConfigLoading &&
                                    codeEditorValue &&
                                    basicFieldValuesErrorObj?.isValid
                                }
                                dataTestId="base-deployment-template-advanced-button"
                            >
                                Advanced (YAML)
                            </RadioGroup.Radio>
                        </RadioGroup>
                    )}
                </div>
            ) : (
                <span
                    className="flex fs-13 fw-6 cn-9 h-32"
                    data-testid={`${
                        openComparison ? 'compare-deployment-template-heading' : 'readme-deployment-template-heading'
                    }`}
                >
                    {openComparison ? COMPARE_VALUES_TIPPY_CONTENT.comparing : README_TIPPY_CONTENT.showing}
                </span>
            )}
            {yamlMode && (
                <CompareOptions
                    isComparisonAvailable={isComparisonAvailable}
                    isEnvOverride={isEnvOverride}
                    openComparison={openComparison}
                    handleComparisonClick={handleComparisonClick}
                    chartConfigLoading={chartConfigLoading}
                    openReadMe={openReadMe}
                    isReadMeAvailable={isReadMeAvailable}
                    handleReadMeClick={handleReadMeClick}
                />
            )}
        </div>
    )
}
