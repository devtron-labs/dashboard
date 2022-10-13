import React, { Fragment, useEffect, useState } from 'react'
import { DeploymentHistorySingleValue } from '../../cdDetails/cd.type'
import YAML from 'yaml'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { MODES } from '../../../../../config'
import './TriggerViewConfigDiff.scss'
import { DEPLOYMENT_CONFIGURATION_NAV_MAP, getDeployConfigOptions } from '../TriggerView.utils'
import ReactSelect, { components } from 'react-select'
import { DropdownIndicator, Option } from '../../../../v2/common/ReactSelect.utils'
import { getCommonConfigSelectStyles } from '../config'
import Tippy from '@tippyjs/react'
import { ConditionalWrap } from '../../../../common'
import { TriggerViewConfigDiffProps } from '../types'

export default function TriggerViewConfigDiff({
    currentConfiguration,
    baseTemplateConfiguration,
    selectedConfigToDeploy,
    handleConfigSelection,
    isConfigAvailable,
    diffOptions,
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

    useEffect(() => {
        handleConfigToDeploySelection()
    }, [selectedConfigToDeploy])

    const handleConfigToDeploySelection = () => {
        if (activeSideNavOption.includes('/')) {
            const navParentChildKeys = activeSideNavOption.split('/')

            if (!getNavOptions(navParentChildKeys[0]).includes(navParentChildKeys[1])) {
                setActiveSideNavOption(DEPLOYMENT_CONFIGURATION_NAV_MAP.DEPLOYMENT_TEMPLATE.key)
                handleNavOptionSelection(null, DEPLOYMENT_CONFIGURATION_NAV_MAP.DEPLOYMENT_TEMPLATE.key)
                return
            }
        }

        handleNavOptionSelection(null, activeSideNavOption)
    }

    const renderDeploymentDiffViaCodeEditor = () => {
        return (
            <CodeEditor
                value={editorValues.value}
                defaultValue={editorValues.defaultValue}
                height="calc(100vh - 16px)"
                diffView={true}
                readOnly={true}
                mode={MODES.YAML}
                noParsing
            />
        )
    }

    const renderDetailedValue = (parentClassName: string, singleValue: DeploymentHistorySingleValue) => {
        return (
            <div className={parentClassName}>
                <div className="fs-12 fw-4 lh-16 cn-6 pt-8 pl-16 pr-16 lh-16">{singleValue.displayName}</div>
                <div className="fs-13 fw-4 lh-20 cn-9 fs-13 pb-8 pl-16 pr-16 mh-28">{singleValue.value}</div>
            </div>
        )
    }

    const handleNavOptionSelection = (e, navConfigKey?: string) => {
        const dataValue = navConfigKey || e?.target?.dataset?.value
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
            <div className="trigger-view-config-diff__side-nav pt-8 pb-8 bcn-0 dc__border-right h-100 dc__overflow-scroll">
                {Object.values(DEPLOYMENT_CONFIGURATION_NAV_MAP).map((navOption, idx) => {
                    if (navOption.isMulti) {
                        const options = getNavOptions(navOption.key)
                        return (
                            options.length > 0 && (
                                <Fragment key={`${navOption.key}-${idx}`}>
                                    <h3 className="cn-7 bcn-1 fs-12 fw-6 lh-20 m-0 pt-6 pb-6 pl-16 pr-16 dc__uppercase">
                                        {navOption.displayName}
                                    </h3>
                                    {options.map((_option) => {
                                        const navKey = `${navOption.key}/${_option}`
                                        return (
                                            <div
                                                className={`flex left pointer pt-8 pb-8 pl-16 pr-16 fs-13 lh-20 dc__overflow-hidden ${
                                                    navKey === activeSideNavOption ? 'fw-6 cb-5 bcb-1' : 'fw-4 cn-9'
                                                } ${diffOptions?.[_option] ? 'diff-dot' : ''}`}
                                                data-value={navKey}
                                                onClick={handleNavOptionSelection}
                                                key={navKey}
                                            >
                                                {_option}
                                            </div>
                                        )
                                    })}
                                </Fragment>
                            )
                        )
                    } else {
                        return (
                            <div
                                className={`flex left pointer pt-8 pb-8 pl-16 pr-16 fs-13 lh-20 dc__overflow-hidden ${
                                    navOption.key === activeSideNavOption ? 'fw-6 cb-5 bcb-1' : 'fw-4 cn-9'
                                } ${diffOptions?.[navOption.key] ? 'diff-dot' : ''}`}
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
            _currentValues = currentConfiguration?.[navParentChildKeys[0]]?.find(
                (_config) => _config.componentName === navParentChildKeys[1],
            )?.values
            _baseValues = baseTemplateConfiguration?.[navParentChildKeys[0]]?.find(
                (_config) => _config.componentName === navParentChildKeys[1],
            )?.values
        } else {
            _currentValues = currentConfiguration?.[activeSideNavOption]?.values
            _baseValues = baseTemplateConfiguration?.[activeSideNavOption]?.values
        }

        return {
            keys:
                ((_currentValues || _baseValues) &&
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
            <div className="trigger-view-config-diff__values en-2 bw-1 br-4 bcn-0 mb-16 pt-2 pb-2">
                {configValuesOptions.keys.map((configKey, index) => {
                    const currentValue = configValuesOptions.currentValues?.[configKey]
                    const baseValue = configValuesOptions.baseValues?.[configKey]
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

    const formatOptionLabel = (option) => {
        return (
            <ConditionalWrap
                condition={!isConfigAvailable(option.value)}
                wrap={(children) => (
                    <Tippy
                        className="default-tt w-200 mr-6"
                        arrow={false}
                        placement="left"
                        content={
                            <>
                                <h2 className="fs-12 fw-6 lh-18 m-0">Config not available!</h2>
                                <p className="fs-12 fw-4 lh-18 m-0">
                                    Please select a different image or configuration to deploy
                                </p>
                            </>
                        }
                    >
                        {children}
                    </Tippy>
                )}
            >
                <div className="flex left column w-100">
                    <span className="dc__ellipsis-right">{option.label}</span>
                    <small className="cn-6">{option.infoText}</small>
                    <div className="dc__border-bottom" />
                </div>
            </ConditionalWrap>
        )
    }

    const customValueContainer = (props) => {
        return (
            <components.ValueContainer {...props}>
                <div className="fs-13 fw-4 cn-9">
                    Deploy:&nbsp; <span className="cb-5 fw-6">{props.selectProps.value?.label}</span>
                </div>
                {React.cloneElement(props.children[1], {
                    style: { position: 'absolute' },
                })}
            </components.ValueContainer>
        )
    }

    const isOptionDisabled = (option) => {
        return !isConfigAvailable(option.value)
    }

    const renderConfigDiffViewHeader = () => {
        return (
            <div className="trigger-view-config-diff__tabs dc__border-bottom">
                <div className="fs-13 fw-6 lh-20 cn-9 bcn-0 m-0 pt-12 pb-12 pl-16 pr-16 dc__border-right">
                    Deployment Configuration
                </div>
                <div className="fs-13 fw-4 lh-20 pt-12 pb-12 pl-16 pr-16 cn-9 bcn-0 dc__border-right">
                    Last Deployed Configuration
                </div>
                <div className="flex left bcn-0">
                    <ReactSelect
                        options={getDeployConfigOptions()}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                            ValueContainer: customValueContainer,
                        }}
                        isOptionDisabled={isOptionDisabled}
                        isSearchable={false}
                        formatOptionLabel={formatOptionLabel}
                        classNamePrefix="deploy-config-select"
                        placeholder="Select Config"
                        menuPlacement="bottom"
                        value={selectedConfigToDeploy}
                        styles={getCommonConfigSelectStyles({
                            valueContainer: (base, state) => ({
                                ...base,
                                minWidth: '135px',
                                cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                            }),
                            control: (base) => ({
                                ...base,
                                backgroundColor: 'white',
                                border: 'none',
                                boxShadow: 'none',
                                minHeight: '32px',
                                cursor: 'pointer',
                                borderRadius: '0px',
                                padding: '7px 16px',
                            }),
                        })}
                        onChange={handleConfigSelection}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="trigger-view-config-diff__container dc__overflow-hidden">
            {renderConfigDiffViewHeader()}
            <div className="trigger-view-config-diff__wrapper">
                {renderAvailableDiffColumn()}
                <div className="p-16 dc__overflow-scroll">
                    {renderConfigValuesDiff()}
                    <div className="en-2 bw-1 br-4">
                        <div className="code-editor-header-value flex left pt-8 pb-8 pl-16 pr-16 fs-13 fw-6 lh-20 cn-9 bcn-0 dc__top-radius-4 dc__border-bottom">
                            {editorValues.displayName}
                        </div>
                        {renderDeploymentDiffViaCodeEditor()}
                    </div>
                </div>
            </div>
        </div>
    )
}
