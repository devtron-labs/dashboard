import React, { Fragment, useRef, useState } from 'react'
import { DeploymentHistoryDetail, DeploymentHistorySingleValue } from '../../cdDetails/cd.type'
import YAML from 'yaml'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { MODES } from '../../../../../config'
import './TriggerViewConfigDiff.scss'
import { DEPLOYMENT_CONFIGURATION_NAV_MAP } from '../TriggerView.utils'

interface TriggerViewDeploymentConfigType {
    configMap: DeploymentHistoryDetail
    deploymentTemplate: DeploymentHistoryDetail
    pipelineStrategy: DeploymentHistoryDetail
    secret: DeploymentHistoryDetail
}

interface TriggerViewConfigDiffProps {
    currentConfiguration: TriggerViewDeploymentConfigType
    baseTemplateConfiguration: TriggerViewDeploymentConfigType
}

export default function TriggerViewConfigDiff({
    currentConfiguration,
    baseTemplateConfiguration,
}: TriggerViewConfigDiffProps) {
    const [activeSideNavOption, setActiveSideNavOption] = useState(
        DEPLOYMENT_CONFIGURATION_NAV_MAP.DEPLOYMENT_TEMPLATE.key,
    )
    const [editorValues, setEditorValues] = useState<{
        displayName: string
        value: string
        defaultValue: string
    }>({
        displayName: baseTemplateConfiguration?.[activeSideNavOption]?.codeEditorValue?.displayName,
        value:
            (baseTemplateConfiguration?.[activeSideNavOption]?.codeEditorValue.value &&
                YAML.stringify(JSON.parse(baseTemplateConfiguration[activeSideNavOption].codeEditorValue.value))) ||
            '',
        defaultValue:
            (currentConfiguration?.[activeSideNavOption]?.codeEditorValue?.value &&
                YAML.stringify(JSON.parse(currentConfiguration[activeSideNavOption].codeEditorValue.value))) ||
            '',
    })

    const renderDeploymentDiffViaCodeEditor = () => {
        return (
            <CodeEditor
                value={editorValues.value}
                defaultValue={editorValues.defaultValue}
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
        const dataValue = e?.target?.dataset?.value
        if (dataValue) {
            setActiveSideNavOption(dataValue)

            let _value, _defaultValue
            if (dataValue.includes('/')) {
                const navParentChildKeys = dataValue.split('/')
                _value = baseTemplateConfiguration?.[navParentChildKeys[0]]?.find(
                    (_config) => _config.componentName === navParentChildKeys[1],
                )?.codeEditorValue
                _defaultValue = currentConfiguration?.[navParentChildKeys[0]]?.find(
                    (_config) => _config.componentName === navParentChildKeys[1],
                )?.codeEditorValue
            } else {
                _value = baseTemplateConfiguration?.[dataValue]?.codeEditorValue
                _defaultValue = currentConfiguration?.[dataValue]?.codeEditorValue
            }

            setEditorValues({
                displayName: _value?.displayName || _defaultValue?.displayName,
                value: _value?.value ? YAML.stringify(JSON.parse(_value?.value)) : '',
                defaultValue: _defaultValue?.value ? YAML.stringify(JSON.parse(_defaultValue?.value)) : '',
            })
        }
    }

    const getNavOptions = (navKey: string): string[] => {
        const navOptions = []

        if (baseTemplateConfiguration?.[navKey]) {
            Object.values(baseTemplateConfiguration[navKey]).forEach((navOption) => {
                navOptions.push(navOption['componentName'])
            })
        }

        if (currentConfiguration?.[navKey]) {
            Object.values(currentConfiguration[navKey]).forEach((navOption) => {
                if (!navOptions.includes(navOption['componentName'])) {
                    navOptions.push(navOption['componentName'])
                }
            })
        }

        return navOptions
    }

    const renderAvailableDiffColumn = () => {
        return (
            <div className="trigger-view-config-diff__side-nav pt-8 pb-8 bcn-0 dc__border-right h-100">
                {Object.values(DEPLOYMENT_CONFIGURATION_NAV_MAP).map((navOption) => {
                    if (navOption.isMulti) {
                        const options = getNavOptions(navOption.key)
                        return (
                            options.length > 0 && (
                                <>
                                    <h3 className="cn-7 bcn-1 fs-12 fw-6 lh-20 m-0 pt-6 pb-6 pl-16 pr-16">
                                        {navOption.displayName}
                                    </h3>
                                    {options.map((_option) => {
                                        const navKey = `${navOption.key}/${_option}`
                                        return (
                                            <div
                                                className={`pointer pt-8 pb-8 pl-16 pr-16 fs-13 lh-20 ${
                                                    navKey === activeSideNavOption ? 'fw-6 cb-5 bcb-1' : 'fw-4 cn-9'
                                                }`}
                                                data-value={navKey}
                                                onClick={handleNavOptionSelection}
                                                key={navKey}
                                            >
                                                {_option}
                                            </div>
                                        )
                                    })}
                                </>
                            )
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

    const getValuesOptions = () => {
        let _currentValues, _baseValues
        if (activeSideNavOption.includes('/')) {
            const navParentChildKeys = activeSideNavOption.split('/')
            _currentValues = currentConfiguration[navParentChildKeys[0]]?.find(
                (_config) => _config.componentName === navParentChildKeys[1],
            )?.values
            _baseValues = baseTemplateConfiguration?.[navParentChildKeys[0]]?.find(
                (_config) => _config.componentName === navParentChildKeys[1],
            )?.values
        } else {
            _currentValues = currentConfiguration[activeSideNavOption]?.values
            _baseValues = baseTemplateConfiguration?.[activeSideNavOption]?.values
        }

        return {
            keys:
                (_currentValues &&
                    _baseValues &&
                    Object.keys({
                        ..._currentValues,
                        ..._baseValues,
                    })) ||
                [],
            currentValues: _currentValues,
            baseValues: _baseValues,
        }
    }

    const renderConfigValuesDiff = () => {
        const configValuesOptions = getValuesOptions()

        if (configValuesOptions.keys.length < 1) {
            return null
        }

        return (
            <div className="trigger-view-config-diff__values en-2 bw-1 br-4 bcn-0 mt-16 mb-16 mr-20 ml-20 pt-2 pb-2">
                {configValuesOptions.keys.map((configKey, index) => {
                    const currentValue = configValuesOptions.currentValues[configKey]
                    const baseValue = configValuesOptions.baseValues[configKey]
                    const changeBGColor = currentValue?.value !== baseValue?.value
                    return (
                        <Fragment key={`deployment-history-diff-view-${index}`}>
                            {currentValue?.value ? (
                                renderDetailedValue(changeBGColor ? 'code-editor-red-diff' : '', currentValue)
                            ) : (
                                <div />
                            )}
                            {baseValue?.value ? (
                                renderDetailedValue(changeBGColor ? 'code-editor-green-diff' : '', baseValue)
                            ) : (
                                <div />
                            )}
                        </Fragment>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="trigger-view-config-diff__container">
            {renderAvailableDiffColumn()}
            <div>
                {renderConfigValuesDiff()}
                <div className="en-2 bw-1 br-4 mr-20 ml-20 mb-20">
                    <div className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">
                        {editorValues.displayName}
                    </div>
                    {editorValues.defaultValue && renderDeploymentDiffViaCodeEditor()}
                </div>
            </div>
        </div>
    )
}
