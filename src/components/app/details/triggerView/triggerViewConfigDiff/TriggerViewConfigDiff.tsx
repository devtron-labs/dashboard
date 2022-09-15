import React, { Fragment, useEffect } from 'react'
import { DeploymentHistoryDetail, DeploymentHistorySingleValue } from '../../cdDetails/cd.type'
import YAML from 'yaml'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { MODES } from '../../../../../config'
import './TriggerViewConfigDiff.scss'

export default function TriggerViewConfigDiff({
    currentConfiguration,
    baseTemplateConfiguration,
}: {
    currentConfiguration: DeploymentHistoryDetail
    baseTemplateConfiguration: DeploymentHistoryDetail
}) {
    const renderDeploymentDiffViaCodeEditor = () => {
        return (
            <CodeEditor
                value={YAML.stringify(JSON.parse(baseTemplateConfiguration.codeEditorValue.value))}
                defaultValue={
                    currentConfiguration?.codeEditorValue?.value &&
                    YAML.stringify(JSON.parse(currentConfiguration.codeEditorValue.value))
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

    const renderAvailableDiffColumn = () => {
        return <div>
            
        </div>
    }

    return (
        <div className="trigger-view-config-diff-container">
            <div className="en-2 bw-1 br-4 bcn-0 mt-16 mb-16 mr-20 ml-20 pt-2 pb-2">
                {baseTemplateConfiguration &&
                    Object.keys({ ...currentConfiguration?.values, ...baseTemplateConfiguration.values }).map(
                        (configKey, index) => {
                            const currentValue = currentConfiguration?.values?.[configKey]
                            const baseValue = baseTemplateConfiguration?.values?.[configKey]
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
                        },
                    )}
            </div>
            <div className="en-2 bw-1 br-4 mr-20 ml-20 mb-20">
                <div className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">
                    {baseTemplateConfiguration?.codeEditorValue?.['displayName']}
                </div>
                {baseTemplateConfiguration?.codeEditorValue?.value && renderDeploymentDiffViaCodeEditor()}
            </div>
        </div>
    )
}
