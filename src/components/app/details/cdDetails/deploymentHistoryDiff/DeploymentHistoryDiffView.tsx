import React, { Fragment, useEffect, useRef, useState } from 'react'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { DeploymentHistoryParamsType, DeploymentHistorySingleValue, DeploymentTemplateHistoryType } from '../cd.type'
import YAML from 'yaml'
import { ReactComponent as Info } from '../../../../../assets/icons/ic-info-filled.svg'
import { useParams } from 'react-router'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP } from '../../../../../config'

export default function DeploymentHistoryDiffView({
    currentConfiguration,
    baseTemplateConfiguration,
    codeEditorLoading,
    previousConfigAvailable,
}: DeploymentTemplateHistoryType) {
    const { historyComponent, historyComponentName } = useParams<DeploymentHistoryParamsType>()
    const ref = useRef(null)
    const [height, setHeight] = useState('')

    useEffect(() => {
        let dynamicHeight = ref.current?.clientHeight + 255 + (!previousConfigAvailable ? 55 : 0)
        setHeight(`calc(100vh - ${dynamicHeight}px)`)
        console.log('height', height)
    }, [ref])

    const renderDeploymentDiffViaCodeEditor = () => {
        return (
            baseTemplateConfiguration?.codeEditorValue?.value && (
                <CodeEditor
                    value={YAML.stringify(JSON.parse(baseTemplateConfiguration.codeEditorValue.value))}
                    defaultValue={currentConfiguration?.codeEditorValue?.value}
                    height={height}
                    mode="yaml"
                    diffView={previousConfigAvailable && true}
                    readOnly={true}
                    loading={codeEditorLoading}
                ></CodeEditor>
            )
        )
    }
    const renderDetailedValue = (parentClassName: string, singleValue: DeploymentHistorySingleValue) => {
        const titleStyle = 'cn-6 pt-8 pl-16 pr-16 lh-16'
        const descriptionStyle = 'cn-9 fs-13 pb-8 pl-16 pr-16 lh-20 mh-28 text-capitalize'
        return (
            <div className={parentClassName}>
                <div className={titleStyle}>{singleValue.displayName}</div>
                <div className={descriptionStyle}>{singleValue.value.toLowerCase()}</div>
            </div>
        )
    }

    return (
        <div>
            {!previousConfigAvailable && (
                <div className="bcb-1 eb-2 pt-8 pb-8 br-4 flexbox pl-4 cn-9 fs-13 mt-16 mb-16 mr-20 ml-20">
                    <Info className="mr-8 ml-14 icon-dim-20" />
                    <span className="lh-20">
                        {DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP[historyComponent.toUpperCase()]?.DISPLAY_NAME}
                        {historyComponentName ? ` “${historyComponentName}”` : ''} was added in this deployment. There
                        is no previous instance to compare with.
                    </span>
                </div>
            )}
            <div
                className={`en-2 bw-1 br-4 bcn-0 mt-16 mb-16 mr-20 ml-20 pt-2 pb-2 ${
                    previousConfigAvailable ? 'deployment-diff__upper' : ''
                }`}
                ref={ref}
            >
                {baseTemplateConfiguration &&
                    Object.keys({ ...currentConfiguration?.values, ...baseTemplateConfiguration?.values }).map(
                        (configKey, index) => {
                            const currentValue = currentConfiguration?.values?.[configKey]
                            const baseValue = baseTemplateConfiguration.values[configKey]
                            const changeBGColor = previousConfigAvailable && currentValue?.value !== baseValue?.value
                            return (
                                <Fragment key={`deployment-history-diff-view-${index}`}>
                                    {currentValue && currentValue.value ? (
                                        renderDetailedValue(changeBGColor ? 'code-editor-red-diff' : '', currentValue)
                                    ) : (
                                        <div></div>
                                    )}
                                    {baseValue && baseValue.value ? (
                                        renderDetailedValue(changeBGColor ? 'code-editor-green-diff' : '', baseValue)
                                    ) : (
                                        <div></div>
                                    )}
                                </Fragment>
                            )
                        },
                    )}
            </div>

            <div className="form__row--code-editor-container en-2 bw-1 br-4 mr-20 ml-20 mb-20">
                <div className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">
                    {baseTemplateConfiguration?.codeEditorValue?.['displayName']}
                </div>
                {renderDeploymentDiffViaCodeEditor()}
            </div>
        </div>
    )
}
