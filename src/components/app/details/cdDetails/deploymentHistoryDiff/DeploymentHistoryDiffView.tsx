import React, { Fragment, useEffect, useRef, useState } from 'react'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { DeploymentHistorySingleValue } from '../cd.type'
import { DeploymentHistoryParamsType, DeploymentTemplateHistoryType } from './types'
import YAML from 'yaml'
import { ReactComponent as Info } from '../../../../../assets/icons/ic-info-filled.svg'
import { useParams } from 'react-router'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP, MODES } from '../../../../../config'

export default function DeploymentHistoryDiffView({
    currentConfiguration,
    baseTemplateConfiguration,
    previousConfigAvailable,
}: DeploymentTemplateHistoryType) {
    const { historyComponent, historyComponentName } = useParams<DeploymentHistoryParamsType>()
    const ref = useRef(null)
    const [codeEditorHeight, setCodeEditorHeight] = useState('')
    const { innerHeight } = window

    useEffect(() => {
        if (ref.current) {
            const dynamicHeight = ref.current?.clientHeight + 255 + (!previousConfigAvailable ? 55 : 0)
            setCodeEditorHeight((innerHeight - dynamicHeight < 400 ? 400 : innerHeight - dynamicHeight) + 'px')
        }
    }, [ref.current?.clientHeight])

    const renderDeploymentDiffViaCodeEditor = () => {
        return (
            <CodeEditor
                value={YAML.stringify(JSON.parse(baseTemplateConfiguration.codeEditorValue.value))}
                defaultValue={
                    currentConfiguration?.codeEditorValue?.value &&
                    YAML.stringify(JSON.parse(currentConfiguration.codeEditorValue.value))
                }
                height={codeEditorHeight}
                diffView={previousConfigAvailable && true}
                readOnly={true}
                noParsing
                mode={MODES.YAML}
            />
        )
    }
    const renderDetailedValue = (parentClassName: string, singleValue: DeploymentHistorySingleValue , dataTestId: string) => {
        return (
            <div className={parentClassName}>
                <div className="cn-6 pt-8 pl-16 pr-16 lh-16" data-testid={dataTestId}>
                    {singleValue.displayName}
                </div>
                <div className="cn-9 fs-13 pb-8 pl-16 pr-16 lh-20 mh-28">{singleValue.value}</div>
            </div>
        )
    }

    return (
        <div>
            {!previousConfigAvailable && (
                <div className="bcb-1 eb-2 pt-8 pb-8 br-4 flexbox pl-4 cn-9 fs-13 mt-16 mb-16 mr-20 ml-20">
                    <Info className="mr-8 ml-14 icon-dim-20" />
                    <span className="lh-20">
                        {
                            DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP[historyComponent.replace('-', '_').toUpperCase()]
                                ?.DISPLAY_NAME
                        }
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
                data-testid={`configuration-link-${
                    previousConfigAvailable ? 'previous-deployment' : 'no-previous-deployment'
                }`}
            >
                {baseTemplateConfiguration &&
                    Object.keys({ ...currentConfiguration?.values, ...baseTemplateConfiguration.values }).map(
                        (configKey, index) => {
                            const currentValue = currentConfiguration?.values?.[configKey]
                            const baseValue = baseTemplateConfiguration.values[configKey]
                            const changeBGColor = previousConfigAvailable && currentValue?.value !== baseValue?.value
                            return (
                                <Fragment key={`deployment-history-diff-view-${index}`}>
                                    {currentValue && currentValue.value ? (
                                        renderDetailedValue(
                                            changeBGColor ? 'code-editor-red-diff' : '',
                                            currentValue,
                                            `configuration-deployment-template-heading-${index}`,
                                        )
                                    ) : (
                                        <div></div>
                                    )}
                                    {baseValue && baseValue.value ? (
                                        renderDetailedValue(
                                            changeBGColor ? 'code-editor-green-diff' : '',
                                            baseValue,
                                            `configuration-deployment-template-heading-${index}`,
                                        )
                                    ) : (
                                        <div></div>
                                    )}
                                </Fragment>
                            )
                        },
                    )}
            </div>

            <div className="en-2 bw-1 br-4 mr-20 ml-20 mb-20">
                <div
                    className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0"
                    data-testid="configuration-link-comparison-body-heading"
                >
                    {baseTemplateConfiguration?.codeEditorValue?.['displayName']}
                </div>
                {baseTemplateConfiguration?.codeEditorValue?.value && renderDeploymentDiffViaCodeEditor()}
            </div>
        </div>
    )
}
