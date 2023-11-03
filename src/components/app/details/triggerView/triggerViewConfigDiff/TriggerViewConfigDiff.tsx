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
import { ReactComponent as ManifestIcon } from '../../../../../assets/icons/ic-file-code.svg'
import { ReactComponent as DownArrowFull } from '../../../../../assets/icons/ic-down-arrow-full.svg'
import { ReactComponent as ViewVariablesIcon } from '../../../../../assets/icons/ic-view-variable-toggle.svg'
import { Toggle } from '@devtron-labs/devtron-fe-common-lib'

export default function TriggerViewConfigDiff({
    currentConfiguration,
    baseTemplateConfiguration,
    selectedConfigToDeploy,
    handleConfigSelection,
    isConfigAvailable,
    diffOptions,
    isRollbackTriggerSelected,
    isRecentConfigAvailable,
}: TriggerViewConfigDiffProps) {
    const [activeSideNavOption, setActiveSideNavOption] = useState(
        DEPLOYMENT_CONFIGURATION_NAV_MAP.DEPLOYMENT_TEMPLATE.key,
    )
    const [convertVariables, setConvertVariables] = useState<boolean>(false) // toggle to show/hide variable values
    const [isVariableAvailable, setIsVariableAvailable] = useState<boolean>(false) // check if variable snapshot is {} or not
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
    const [configMapOptionCollapsed, setConfigMapOptionCollapsed] = useState<boolean>(false)
    const [secretOptionCollapsed, setSecretOptionCollapsed] = useState<boolean>(false)
    const [currentData, setCurrentData] = useState<any>({}) // store codeEditorValue of current(lhs) and base(rhs) config

    useEffect(() => {
        handleConfigToDeploySelection()
    }, [selectedConfigToDeploy])

    useEffect(() => {
        if (Object.keys(currentData).length === 0) return
        const { rhsData, lhsData } = currentData
        const editorValuesRHS = convertVariables ? rhsData?.resolvedValue : rhsData?.value
        const editorValuesLHS = convertVariables ? lhsData?.resolvedValue : lhsData?.value
        setEditorValues({
            displayName: editorValues.displayName,
            value: editorValuesRHS ? YAML.stringify(JSON.parse(editorValuesRHS)) : '',
            defaultValue: editorValuesLHS ? YAML.stringify(JSON.parse(editorValuesLHS)) : '',
        })
    }, [convertVariables])

    const handleConfigToDeploySelection = () => {
        if (activeSideNavOption.includes('/')) {
            const navParentChildKeys = activeSideNavOption.split('/')

            if (!getNavOptions(navParentChildKeys[0]).includes(navParentChildKeys[1])) {
                setConvertVariables(false)
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
                diffView={isRecentConfigAvailable}
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

    /*
        returns the current(lhs) and base(rhs) config value for the selected nav option
    */
    const getCurrentConfiguration = (
        dataValue: string,
    ): {
        rhsData: DeploymentHistorySingleValue
        lhsData: DeploymentHistorySingleValue
    } => {
        let _value: DeploymentHistorySingleValue, _defaultValue: DeploymentHistorySingleValue
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

        return {
            rhsData: _value,
            lhsData: _defaultValue,
        }
    }

    /*
        set the current(lhs) and base(rhs) config value in code editor for the selected nav option, runs every on nav option selection
    */
    const handleNavOptionSelection = (e, navConfigKey?: string) => {
        const dataValue = navConfigKey || e?.target?.dataset?.value
        if (dataValue) {
            setConvertVariables(false)
            setActiveSideNavOption(dataValue)

            const { rhsData, lhsData } = getCurrentConfiguration(dataValue)
            setCurrentData({
                rhsData,
                lhsData,
            })

            const _isVariableAvailable =
                Object.keys(rhsData?.variableSnapshot || {}).length !== 0 ||
                Object.keys(lhsData?.variableSnapshot || {}).length !== 0
            setIsVariableAvailable(_isVariableAvailable)

            const editorValuesRHS = convertVariables ? rhsData?.resolvedValue : rhsData?.value
            const editorValuesLHS = convertVariables ? lhsData?.resolvedValue : lhsData?.value
            setEditorValues({
                displayName: rhsData?.displayName || lhsData?.displayName,
                value: editorValuesRHS ? YAML.stringify(JSON.parse(editorValuesRHS)) : '',
                defaultValue: editorValuesLHS ? YAML.stringify(JSON.parse(editorValuesLHS)) : '',
            })
        }
    }

    const handleCollapsableNavOptionSelection = (navOptionKey: string) => {
        if (navOptionKey === 'configMap') {
            setConfigMapOptionCollapsed(!configMapOptionCollapsed)
        } else {
            setSecretOptionCollapsed(!secretOptionCollapsed)
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

    const tippyMsg = convertVariables ? 'Hide variables values' : 'Show variables values'

    const renderAvailableDiffColumn = () => {
        return (
            <div className="trigger-view-config-diff__side-nav pt-8 pb-8 bcn-0 dc__border-right h-100 dc__overflow-scroll">
                {Object.values(DEPLOYMENT_CONFIGURATION_NAV_MAP).map((navOption, idx) => {
                    if (navOption.isMulti) {
                        const options = getNavOptions(navOption.key)
                        return (
                            options.length > 0 && (
                                <Fragment key={`${navOption.key}-${idx}`}>
                                    <h3
                                        className="cn-7 fs-12 fw-6 lh-20 m-0 pt-6 pb-6 pl-14-imp pr-18 dc__uppercase pointer"
                                        onClick={() => handleCollapsableNavOptionSelection(navOption.key)}
                                        key={`${navOption.key}-${idx}`}
                                    >
                                        <DownArrowFull
                                            className="icon-dim-8 ml-6 mr-12 icon-color-grey rotate"
                                            style={{
                                                ['--rotateBy' as any]:
                                                    (navOption.key === 'configMap' && configMapOptionCollapsed) ||
                                                    (navOption.key === 'secret' && secretOptionCollapsed)
                                                        ? '-90deg'
                                                        : '0deg',
                                            }}
                                        />
                                        {navOption.displayName}
                                    </h3>
                                    {(navOption.key === 'configMap' && !configMapOptionCollapsed) ||
                                    (navOption.key === 'secret' && !secretOptionCollapsed) ? (
                                        options.map((_option) => {
                                            const navKey = `${navOption.key}/${_option}`
                                            return (
                                                <div className="pt-4 pb-4 pr-10 ml-23 dc__border-left">
                                                    <div
                                                        className={`flex left pointer ml-4 mr-4 pt-8 pb-8 pl-12 fs-13 lh-20 dc__overflow-hidden dc__border-radius-4-imp ${
                                                            navKey === activeSideNavOption
                                                                ? 'fw-6 cb-5 bcb-1'
                                                                : 'fw-4 cn-9'
                                                        } ${diffOptions?.[_option] ? 'diff-dot pr-8' : ''}`}
                                                        data-value={navKey}
                                                        onClick={handleNavOptionSelection}
                                                        key={navKey}
                                                    >
                                                        <ManifestIcon
                                                            className={`icon-dim-16 mr-8 ${
                                                                navKey === activeSideNavOption ? 'scb-5' : ''
                                                            }`}
                                                        />
                                                        {_option}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <></>
                                    )}
                                </Fragment>
                            )
                        )
                    } else {
                        return (
                            <div
                                className={`flex left pointer ml-6 mr-6 pt-8 pb-8 pl-16 pr-18 fs-13 lh-20 dc__overflow-hidden dc__border-radius-4-imp ${
                                    navOption.key === activeSideNavOption ? 'fw-6 cb-5 bcb-1' : 'fw-4 cn-9'
                                } ${diffOptions?.[navOption.key] ? 'diff-dot' : ''}`}
                                data-value={navOption.key}
                                onClick={handleNavOptionSelection}
                                key={navOption.key}
                            >
                                <ManifestIcon
                                    className={`icon-dim-16 mr-8 ${
                                        navOption.key === activeSideNavOption ? 'scb-5' : ''
                                    }`}
                                />
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
            <div
                className={`${
                    isRecentConfigAvailable ? 'trigger-view-config-diff__values' : ''
                } en-2 bw-1 br-4 bcn-0 mb-16 pt-2 pb-2`}
            >
                {configValuesOptions.keys.map((configKey, index) => {
                    const currentValue = configValuesOptions.currentValues?.[configKey]
                    const baseValue = configValuesOptions.baseValues?.[configKey]
                    const changeBGColor = currentValue?.value !== baseValue?.value
                    return (
                        <Fragment key={`deployment-history-diff-view-${index}`}>
                            {currentValue?.value ? (
                                renderDetailedValue(
                                    changeBGColor && isRecentConfigAvailable ? 'code-editor-red-diff' : '',
                                    currentValue,
                                )
                            ) : (
                                <div />
                            )}
                            {baseValue?.value ? (
                                renderDetailedValue(
                                    changeBGColor && isRecentConfigAvailable ? 'code-editor-green-diff' : '',
                                    baseValue,
                                )
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

    const handleShowVariablesClick = () => {
        setConvertVariables(!convertVariables)
    }

    const isOptionDisabled = (option) => {
        return !isConfigAvailable(option.value)
    }

    const renderConfigDiffViewHeader = () => {
        return (
            <div className="trigger-view-config-diff__tabs bcn-0 dc__border-bottom">
                <div className="fs-13 fw-6 lh-20 cn-9 m-0 pt-12 pb-12 pl-16 pr-16 dc__border-right">
                    Deployment Configuration
                </div>
                {isRecentConfigAvailable && (
                    <div className="fs-13 fw-4 lh-20 pt-12 pb-12 pl-16 pr-16 cn-9 dc__border-right">
                        Last Deployed Configuration
                    </div>
                )}
                <div className="flex left">
                    <ReactSelect
                        options={getDeployConfigOptions(isRollbackTriggerSelected, isRecentConfigAvailable)}
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
                        <div className="code-editor-header-value left pt-8 pb-8 pl-16 pr-16 fs-13 fw-6 lh-20 cn-9 bcn-0 dc__top-radius-4 dc__border-bottom">
                            <span>{editorValues.displayName}</span>
                            {isVariableAvailable && (
                                <Tippy content={tippyMsg} placement="bottom-start" animation="shift-away" arrow={false}>
                                    <li className="flex left dc_width-max-content cursor">
                                        <div className="w-40 h-20">
                                            <Toggle
                                                selected={convertVariables}
                                                color="var(--B500)"
                                                onSelect={handleShowVariablesClick}
                                                Icon={ViewVariablesIcon}
                                            />
                                        </div>
                                    </li>
                                </Tippy>
                            )}
                        </div>
                        {renderDeploymentDiffViaCodeEditor()}
                    </div>
                </div>
            </div>
        </div>
    )
}
