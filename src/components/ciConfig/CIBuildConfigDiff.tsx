import React, { useEffect, useState } from 'react'
import { ReactComponent as CaretIcon } from '../../assets/icons/ic-chevron-down.svg'
import { MODES } from '../../config'
import CodeEditor from '../CodeEditor/CodeEditor'
import { getCIConfigDiffValues } from './CIConfig.utils'
import { CIConfigDiffType } from './types'

export function CIBuildConfigDiff({
    _configOverridenWorkflows,
    wfId,
    configOverridenPipelines,
    materials,
    globalCIConfig,
}) {
    const [showOverrides, setShowOverrides] = useState(false)
    const [ciConfigDiffValues, setCIConfigDiffValues] = useState<CIConfigDiffType[]>([])

    useEffect(() => {
        if (_configOverridenWorkflows && configOverridenPipelines) {
            const _currentWorkflow = _configOverridenWorkflows.find((_wf) => +wfId === _wf.id)
            const _currentPipelineOverride = configOverridenPipelines.find(
                (_ci) => _currentWorkflow.ciPipelineId === _ci.id,
            )?.dockerConfigOverride
            setCIConfigDiffValues(getCIConfigDiffValues(globalCIConfig, _currentPipelineOverride, materials))
        }
    }, [_configOverridenWorkflows, globalCIConfig])
    const renderDetailedValue = (parentClassName: string, value: string): JSX.Element => {
        return (
            <div className={`${parentClassName} cn-9 fs-13 fw-4 lh-20 pt-8 pb-8 pl-16 pr-16 dc__ellipsis-right`}>
                {value}
            </div>
        )
    }

    const renderValueDiff = (value: CIConfigDiffType, isLastItem?: boolean): JSX.Element => {
        const { baseValue, overridenValue, changeBGColor, configName, showInEditor } = value
        const borderClass = isLastItem ? 'dc__border-right' : 'dc__border-right dc__border-bottom'
        const lastColumnClass = isLastItem ? '' : 'dc__border-bottom'
        return (
            <>
                <div className={`fs-13 fw-4 lh-20 cn-7 pt-8 pb-8 pl-16 pr-16 dc__ellipsis-right ${borderClass}`}>
                    {configName}
                </div>
                {showInEditor ? (
                    <CodeEditor
                        value={overridenValue}
                        defaultValue={baseValue}
                        mode={MODES.DOCKERFILE}
                        height="300px"
                        readOnly={true}
                        diffView={true}
                    />
                ) : (
                    <>
                        {baseValue ? (
                            renderDetailedValue(
                                `${borderClass} ${changeBGColor ? 'code-editor-red-diff' : ''}`,
                                baseValue,
                            )
                        ) : (
                            <div className={borderClass} />
                        )}
                        {overridenValue ? (
                            renderDetailedValue(
                                `${lastColumnClass} ${changeBGColor ? 'code-editor-green-diff' : ''}`,
                                overridenValue,
                            )
                        ) : (
                            <div className={lastColumnClass} />
                        )}
                    </>
                )}
            </>
        )
    }

    const renderHeader = () => {
        return (
            <>
                <div className="fs-12 fw-6 lh-20 cn-7 pt-8 pb-8 pl-16 pr-16 dc__border-right dc__border-bottom dc__uppercase">
                    Build Configs
                </div>
                <div className="fs-12 fw-6 lh-20 cn-7 pt-8 pb-8 pl-16 pr-16 dc__border-right dc__border-bottom dc__uppercase">
                    Basic
                </div>
                <div className="fs-12 fw-6 lh-20 cn-7 pt-8 pb-8 pl-16 pr-16 dc__border-bottom dc__uppercase">
                    Overriden
                </div>
            </>
        )
    }

    const toggleOverridesVisibility = () => {
        setShowOverrides(!showOverrides)
    }

    const lastIndex = ciConfigDiffValues.length - 1
    return (
        <div className="dc__border dc__bottom-radius-4">
            {showOverrides && (
                <div className="config-override-diff__values">
                    {renderHeader()}
                    {ciConfigDiffValues.map((val, idx) => {
                        return renderValueDiff(val, lastIndex === idx)
                    })}
                </div>
            )}
            <div
                className={`flex right p-10 bcn-0 cursor dc__bottom-radius-4 fs-13 fw-4 lh-20 ${
                    showOverrides ? 'dc__border-top' : ''
                }`}
                onClick={toggleOverridesVisibility}
            >
                {showOverrides ? 'Hide' : 'Show'} overrides
                <CaretIcon
                    className="icon-dim-20 fcn-6 rotate ml-4"
                    style={{
                        ['--rotateBy' as any]: showOverrides ? '-180deg' : '0deg',
                    }}
                />
            </div>
        </div>
    )
}
