import React, { Fragment, useEffect, useState } from 'react'
import { DeploymentHistoryDetail, DeploymentHistorySingleValue } from '../../cdDetails/cd.type'
import YAML from 'yaml'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { MODES } from '../../../../../config'
import './TriggerViewConfigDiff.scss'
import { DEPLOYMENT_CONFIGURATION_NAV_MAP } from '../TriggerView.utils'

export default function TriggerViewConfigDiff({
    currentConfiguration,
    baseTemplateConfiguration,
}: {
    currentConfiguration: {
        configMap: DeploymentHistoryDetail
        deploymentTemplate: DeploymentHistoryDetail
        pipelineStrategy: DeploymentHistoryDetail
        secret: DeploymentHistoryDetail
    }
    baseTemplateConfiguration: DeploymentHistoryDetail
}) {
    const [activeSideNavOption, setActiveSideNavOption] = useState(
        DEPLOYMENT_CONFIGURATION_NAV_MAP.DEPLOYMENT_TEMPLATE.key,
    )

    const renderDeploymentDiffViaCodeEditor = () => {
        return (
            <CodeEditor
                value={
                    baseTemplateConfiguration?.[activeSideNavOption]?.codeEditorValue.value &&
                    YAML.stringify(JSON.parse(baseTemplateConfiguration[activeSideNavOption].codeEditorValue.value))
                }
                defaultValue={
                    currentConfiguration?.[activeSideNavOption]?.codeEditorValue?.value &&
                    YAML.stringify(JSON.parse(currentConfiguration[activeSideNavOption].codeEditorValue.value))
                }
                height="500px"
                diffView={true}
                readOnly={true}
                noParsing
                mode={MODES.YAML}
            />
        )
    }

    const renderDetailedValue = (parentClassName: string, singleValue: DeploymentHistorySingleValue) => {
        return (
            <div className={parentClassName}>
                <div className="cn-6 pt-8 pl-16 pr-16 lh-16">{singleValue.displayName}</div>
                <div className="cn-9 fs-13 pb-8 pl-16 pr-16 lh-20 mh-28">{singleValue.value}</div>
            </div>
        )
    }

    const handleNavOptionSelection = (e) => {
        if (e?.target?.dataset) {
            setActiveSideNavOption(e.target.dataset.value)
        }
    }

    const renderAvailableDiffColumn = () => {
        return (
            <div className="trigger-view-config-diff__side-nav pt-8 pb-8 bcn-0 dc__border-right h-100">
                {Object.values(DEPLOYMENT_CONFIGURATION_NAV_MAP).map((navOption) => {
                    if (navOption.isMulti) {
                        const options = [
                            ...Object.values(currentConfiguration?.[navOption.key] || {}),
                            ...Object.values(baseTemplateConfiguration?.[navOption.key] || {}),
                        ]
                        return (
                            <>
                                <h3 className="cn-7 bcn-1 fs-12 fw-6 lh-20 m-0 pt-6 pb-6 pl-16 pr-16">
                                    {navOption.displayName}
                                </h3>
                                {options.map((val) => {
                                    return (
                                        <div
                                            className={`pointer pt-8 pb-8 pl-16 pr-16 fs-13 lh-20 ${
                                                navOption.key === activeSideNavOption ? 'fw-6 cb-5 bcb-1' : 'fw-4 cn-9'
                                            }`}
                                            data-value={navOption.key}
                                            onClick={handleNavOptionSelection}
                                            key={navOption.key}
                                        >
                                            {navOption.displayName}
                                        </div>
                                    )
                                })}
                            </>
                        )
                    } else {
                        return (
                            <div
                                className={`pointer pt-8 pb-8 pl-16 pr-16 fs-13 lh-20 ${
                                    navOption.key === activeSideNavOption ? 'fw-6 cb-5 bcb-1' : 'fw-4 cn-9'
                                }`}
                                data-value={navOption.key}
                                onClick={handleNavOptionSelection}
                                key={navOption.key}
                            >
                                {navOption.displayName}
                            </div>
                        )
                    }
                })}
            </div>
        )
    }

    return (
        <div className="trigger-view-config-diff__container">
            {renderAvailableDiffColumn()}
            <div>
                <div className="trigger-view-config-diff__values en-2 bw-1 br-4 bcn-0 mt-16 mb-16 mr-20 ml-20 pt-2 pb-2">
                    {baseTemplateConfiguration &&
                        Object.keys({
                            ...currentConfiguration?.[activeSideNavOption]?.values,
                            ...baseTemplateConfiguration?.[activeSideNavOption]?.values,
                        }).map((configKey, index) => {
                            const currentValue = currentConfiguration?.[activeSideNavOption]?.values?.[configKey]
                            const baseValue = baseTemplateConfiguration?.[activeSideNavOption]?.values?.[configKey]
                            const changeBGColor = currentValue?.value !== baseValue?.value
                            return (
                                <Fragment key={`deployment-history-diff-view-${index}`}>
                                    {currentValue && currentValue.value ? (
                                        renderDetailedValue(changeBGColor ? 'code-editor-red-diff' : '', currentValue)
                                    ) : (
                                        <div />
                                    )}
                                    {baseValue && baseValue.value ? (
                                        renderDetailedValue(changeBGColor ? 'code-editor-green-diff' : '', baseValue)
                                    ) : (
                                        <div />
                                    )}
                                </Fragment>
                            )
                        })}
                </div>
                <div className="en-2 bw-1 br-4 mr-20 ml-20 mb-20">
                    <div className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">
                        {baseTemplateConfiguration?.[activeSideNavOption]?.codeEditorValue?.['displayName']}
                    </div>
                    {baseTemplateConfiguration?.[activeSideNavOption]?.codeEditorValue?.value &&
                        renderDeploymentDiffViaCodeEditor()}
                </div>
            </div>
        </div>
    )
}
