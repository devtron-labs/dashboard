import React, { Fragment } from 'react'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { DeploymentHistorySingleValue, DeploymentTemplateHistoryType } from '../cd.type'
import YAML from 'yaml'

export default function DeploymentHistoryDiffView({
    currentConfiguration,
    baseTemplateConfiguration,
    codeEditorLoading,
}: DeploymentTemplateHistoryType) {
    const renderDeploymentDiffViaCodeEditor = () => {
        return (
            baseTemplateConfiguration?.codeEditorValue?.value &&
            currentConfiguration?.codeEditorValue?.value && (
                <CodeEditor
                    value={YAML.stringify(JSON.parse(baseTemplateConfiguration.codeEditorValue.value))}
                    defaultValue={currentConfiguration.codeEditorValue.value}
                    height={600}
                    mode="yaml"
                    diffView={true}
                    readOnly={true}
                    loading={codeEditorLoading}
                ></CodeEditor>
            )
        )
    }
    const renderValue = (parentClassName: string, value: DeploymentHistorySingleValue) => {
        const titleStyle = 'cn-6 pt-8 pl-16 pr-16 lh-16'
        const descriptionStyle = 'cn-9 fs-13 pb-8 pl-16 pr-16 lh-20 mh-28'
        return (
            <div className={parentClassName}>
                <div className={titleStyle}>{value.displayName}</div>
                <div className={descriptionStyle}>{value.value}</div>
            </div>
        )
    }

    return (
        <div>
            <div className="en-2 bw-1 br-4 bcn-0 mt-20 mb-16 mr-20 ml-20 pt-2 pb-2 deployment-diff__upper">
                {currentConfiguration &&
                    baseTemplateConfiguration &&
                    Object.keys({ ...currentConfiguration?.values, ...baseTemplateConfiguration?.values }).map(
                        (configKey, index) => {
                            const currentValue = currentConfiguration.values[configKey]
                            const baseValue = baseTemplateConfiguration.values[configKey]
                            const changeBGColor = currentValue?.value !== baseValue?.value
                            return (
                                <Fragment key={`deployment-history-diff-view-${index}`}>
                                    {currentValue && currentValue.value ? (
                                        renderValue(changeBGColor ? ' bcr-1' : '', currentValue)
                                    ) : (
                                        <div></div>
                                    )}
                                    {baseValue && baseValue.value ? (
                                        renderValue(changeBGColor ? ' bcg-1' : '', baseValue)
                                    ) : (
                                        <div></div>
                                    )}
                                </Fragment>
                            )
                        },
                    )}
            </div>

            <div className=" form__row form__row--code-editor-container en-2 bw-1 br-4 mb-20 mr-20 ml-20">
                <div className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">
                    {currentConfiguration?.codeEditorValue?.['displayName']}
                </div>
                {renderDeploymentDiffViaCodeEditor()}
            </div>
        </div>
    )
}
