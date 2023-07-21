import React, { useContext, useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import ReactSelect, { components } from 'react-select'
import { DEPLOYMENT, ROLLOUT_DEPLOYMENT } from '../../../config'
import { versionComparator } from '../../common'
import { ConditionalWrap, ConfirmationDialog, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { DropdownIndicator, Option } from '../../v2/common/ReactSelect.utils'
import { ReactComponent as Arrows } from '../../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Locked } from '../../../assets/icons/ic-locked.svg'
import warningIcon from '../../../assets/icons/ic-info-filled.svg'
import {
    ChartTypeVersionOptionsProps,
    CompareOptionsProps,
    CompareWithDropdownProps,
    DeploymentChartGroupOptionType,
    DeploymentChartOptionType,
    DeploymentChartVersionType,
    DeploymentConfigStateActionTypes,
} from '../types'
import {
    COMPARE_VALUES_TIPPY_CONTENT,
    DEPLOYMENT_TEMPLATE_LABELS_KEYS,
    getCommonSelectStyles,
    README_TIPPY_CONTENT,
} from '../constants'
import { SortingOrder } from '../../app/types'
import ChartSelectorDropdown from '../ChartSelectorDropdown'
import { DeploymentConfigContext } from '../DeploymentConfig'

const renderReadMeOption = (openReadMe: boolean, handleReadMeClick: () => void, disabled?: boolean) => {
    const handleReadMeOptionClick = () => {
        if (disabled) {
            return
        }

        handleReadMeClick()
    }

    return (
        <span
            className={`dt-view-option flex cursor fs-13 fw-6 cn-7 ${openReadMe ? 'opened' : ''} ${
                disabled ? 'disabled' : ''
            }`}
            onClick={handleReadMeOptionClick}
            data-testid={`base-deployment-template-${!openReadMe ? 'readme' : 'hidereadme'}-button`}
        >
            {openReadMe ? (
                <>
                    <Close className="option-close-icon icon-dim-16 mr-8" />
                    Hide README
                </>
            ) : (
                <>
                    <File className="option-open-icon icon-dim-16 mr-8" />
                    README
                </>
            )}
        </span>
    )
}

const renderComparisonOption = (openComparison: boolean, handleComparisonClick: () => void, disabled: boolean) => {
    const handleComparisonOptionClick = () => {
        if (disabled) {
            return
        }

        handleComparisonClick()
    }

    return (
        <span
            className={`dt-view-option flex cursor fs-13 fw-6 cn-7 mr-10 ${openComparison ? 'opened' : ''} ${
                disabled ? 'disabled' : ''
            }`}
            onClick={handleComparisonOptionClick}
            data-testid={`base-deployment-template-${!openComparison ? 'comparevalues' : 'hidecomparison'}-button`}
        >
            {openComparison ? (
                <>
                    <Close className="option-close-icon icon-dim-16 mr-8" />
                    Hide comparison
                </>
            ) : (
                <>
                    <Arrows className="option-open-icon icon-dim-16 mr-8" />
                    Compare values
                </>
            )}
        </span>
    )
}

const getComparisonTippyContent = (isComparisonAvailable: boolean, isEnvOverride?: boolean) => {
    if (isComparisonAvailable) {
        return isEnvOverride
            ? COMPARE_VALUES_TIPPY_CONTENT.compareEnvValueWithOtherValues
            : COMPARE_VALUES_TIPPY_CONTENT.compareBaseValueWithOtherValues
    }

    return (
        <>
            <h2 className="fs-12 fw-6 lh-18 m-0">{COMPARE_VALUES_TIPPY_CONTENT.nothingToCompare}</h2>
            <p className="fs-12 fw-4 lh-18 m-0">{COMPARE_VALUES_TIPPY_CONTENT.noCDPipelineCreated}</p>
        </>
    )
}

export const ChartTypeVersionOptions = ({
    isUnSet,
    disableVersionSelect,
    charts,
    chartsMetadata,
    selectedChart,
    selectChart,
    selectedChartRefId,
}: ChartTypeVersionOptionsProps) => {
    const filteredCharts = selectedChart
        ? charts
              .filter((cv) => cv.name == selectedChart.name)
              .sort((a, b) =>
                  versionComparator(a, b, DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.version, SortingOrder.DESC),
              )
        : []

    const onSelectChartVersion = (selected) => {
        selectChart(selected)
    }

    return (
        <div
            className={`chart-type-version-options pr-16 pt-8 pb-8 ${
                disableVersionSelect ||
                (selectedChart?.name !== ROLLOUT_DEPLOYMENT && selectedChart?.name !== DEPLOYMENT)
                    ? ''
                    : 'dc__border-right'
            }`}
        >
            <div className="chart-type-options">
                <span className="fs-13 fw-4 cn-9">Chart type:</span>
                <ChartSelectorDropdown
                    charts={charts}
                    chartsMetadata={chartsMetadata}
                    selectedChartRefId={selectedChartRefId}
                    selectChart={selectChart}
                    selectedChart={selectedChart}
                    isUnSet={isUnSet}
                />
            </div>
            <div className="chart-version-options">
                <span className="fs-13 fw-4 cn-9">Chart version:</span>
                {disableVersionSelect ? (
                    <span className="fs-13 fw-6 cn-9">{selectedChart?.version}</span>
                ) : (
                    <ReactSelect
                        options={filteredCharts}
                        isMulti={false}
                        classNamePrefix="select-chart-version"
                        getOptionLabel={(option) => `${option.version}`}
                        getOptionValue={(option) => `${option.id}`}
                        value={selectedChart}
                        isSearchable={false}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                            DropdownIndicator,
                        }}
                        styles={getCommonSelectStyles({
                            menu: (base, state) => ({
                                ...base,
                                margin: '0',
                                width: '120px',
                            }),
                        })}
                        onChange={onSelectChartVersion}
                    />
                )}
            </div>
        </div>
    )
}

export const CompareOptions = ({
    isComparisonAvailable,
    isEnvOverride,
    openComparison,
    handleComparisonClick,
    chartConfigLoading,
    openReadMe,
    isReadMeAvailable,
    handleReadMeClick,
}: CompareOptionsProps) => {
    return (
        <div className="flex">
            <ConditionalWrap
                condition={!openComparison && !chartConfigLoading}
                wrap={(children) => (
                    <Tippy
                        className="default-tt w-200"
                        arrow={false}
                        placement="bottom"
                        content={getComparisonTippyContent(isComparisonAvailable, isEnvOverride)}
                    >
                        {children}
                    </Tippy>
                )}
            >
                {renderComparisonOption(
                    openComparison,
                    handleComparisonClick,
                    chartConfigLoading || !isComparisonAvailable,
                )}
            </ConditionalWrap>
            <ConditionalWrap
                condition={!openReadMe && (chartConfigLoading || !isReadMeAvailable)}
                wrap={(children) => (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={chartConfigLoading ? README_TIPPY_CONTENT.fetching : README_TIPPY_CONTENT.notAvailable}
                    >
                        {children}
                    </Tippy>
                )}
            >
                {renderReadMeOption(openReadMe, handleReadMeClick, chartConfigLoading || !isReadMeAvailable)}
            </ConditionalWrap>
        </div>
    )
}

const formatOptionLabel = (option: DeploymentChartOptionType): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 dc__ellipsis-right">
                {option.label}&nbsp;{option.version && `(${option.version})`}
            </span>
        </div>
    )
}

const customValueContainer = (props): JSX.Element => {
    return (
        <components.ValueContainer {...props}>
            {props.selectProps.value?.label}&nbsp;
            {props.selectProps.value?.version && `(${props.selectProps.value.version})`}
            {React.cloneElement(props.children[1], {
                style: { position: 'absolute' },
            })}
        </components.ValueContainer>
    )
}

export const CompareWithDropdown = ({
    isEnvOverride,
    environments,
    charts,
    selectedOption,
    setSelectedOption,
    globalChartRef,
}: CompareWithDropdownProps) => {
    const [groupedOptions, setGroupedOptions] = useState<DeploymentChartGroupOptionType[]>([
        {
            label: '',
            options: [],
        },
    ])
    const baseTemplateOption = {
        id: -1,
        value: '',
        label: DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label,
        version: globalChartRef?.version || '',
        kind: DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.key,
    }

    useEffect(() => {
        _initOptions()
    }, [environments, charts])

    const getSelectedOption = () => {
        if (isEnvOverride) {
            return baseTemplateOption as DeploymentChartOptionType
        } else if (environments.length > 0) {
            return environments[0]
        } else {
            return charts[0]
        }
    }

    const _initOptions = () => {
        const _groupOptions = []

        // Push base template option if in environment override view
        if (isEnvOverride) {
            _groupOptions.push({
                label: '',
                options: [baseTemplateOption],
            })
        }

        // Push all environment & other version options
        _groupOptions.push({
            label: DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.label,
            options: environments.length > 0 ? environments : [DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.noOptions],
        })
        _groupOptions.push({
            label: DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.label,
            options: charts.length > 0 ? charts : [DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherVersion.noOptions],
        })

        setGroupedOptions(_groupOptions)
        if (!selectedOption) {
            setSelectedOption(getSelectedOption())
        }
    }

    const onChange = (selected: DeploymentChartOptionType) => {
        setSelectedOption(selected)
    }

    return (
        <ReactSelect
            options={groupedOptions}
            isMulti={false}
            value={selectedOption}
            isOptionSelected={(option, selected) => option.id === selected[0].id}
            classNamePrefix="compare-template-values-select"
            formatOptionLabel={formatOptionLabel}
            isOptionDisabled={(option) => option.value === 0}
            isSearchable={false}
            onChange={onChange}
            components={{
                IndicatorSeparator: null,
                Option,
                DropdownIndicator,
                ValueContainer: customValueContainer,
            }}
            styles={{
                control: (base) => ({
                    ...base,
                    backgroundColor: 'var(--N100)',
                    border: 'none',
                    boxShadow: 'none',
                    minHeight: '32px',
                    cursor: 'pointer',
                }),
                option: (base, state) => ({
                    ...base,
                    color: 'var(--N900)',
                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                }),
                menu: (base) => ({
                    ...base,
                    marginTop: '2px',
                    minWidth: '240px',
                }),
                menuList: (base) => ({
                    ...base,
                    position: 'relative',
                    paddingBottom: 0,
                    paddingTop: 0,
                    maxHeight: '250px',
                }),
                dropdownIndicator: (base, state) => ({
                    ...base,
                    padding: 0,
                    color: 'var(--N400)',
                    transition: 'all .2s ease',
                    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }),
                noOptionsMessage: (base) => ({
                    ...base,
                    color: 'var(--N600)',
                }),
            }}
        />
    )
}

export const getCodeEditorHeight = (
    isUnSet: boolean,
    isEnvOverride: boolean,
    openComparison: boolean,
    showReadme: boolean,
) => {
    if (openComparison || showReadme) {
        return isEnvOverride ? 'calc(100vh - 216px)' : 'calc(100vh - 148px)'
    } else if (isEnvOverride) {
        return 'calc(100vh - 266px)'
    }

    return isUnSet ? 'calc(100vh - 236px)' : 'calc(100vh - 204px)'
}

export const renderEditorHeading = (
    isEnvOverride: boolean,
    overridden: boolean,
    readOnly: boolean,
    environmentName: string,
    selectedChart: DeploymentChartVersionType,
    handleOverride: (e: any) => Promise<void>,
) => {
    return (
        <div className="flex dc__content-space w-100">
            <div className="flex left">
                {!readOnly && <Edit className="icon-dim-16 mr-10" />}
                {`${isEnvOverride ? environmentName : DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label} ${
                    selectedChart ? `(${selectedChart.version})` : ''
                }`}
                {isEnvOverride && readOnly && (
                    <Tippy
                        className="default-tt w-200"
                        arrow={false}
                        placement="top"
                        content={DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText}
                    >
                        <Locked className="icon-dim-16 fcn-6 ml-10" />
                    </Tippy>
                )}
            </div>
            {isEnvOverride && (
                <span
                    data-testid={`action-override-${overridden ? 'delete' : 'allow'}`}
                    className={`cursor ${overridden ? 'cr-5' : 'cb-5'}`}
                    onClick={handleOverride}
                >
                    {overridden ? 'Delete override' : 'Allow override'}
                </span>
            )}
        </div>
    )
}

export const SuccessToastBody = ({ chartConfig }) => {
    return (
        <div className="toast">
            <div
                className="toast__title"
                data-testid={`${
                    chartConfig.id ? 'update-base-deployment-template-popup' : 'saved-base-deployment-template-popup'
                }`}
            >
                {chartConfig.id ? 'Updated' : 'Saved'}
            </div>
            <div className="toast__subtitle">Changes will be reflected after next deployment.</div>
        </div>
    )
}

export const SaveConfirmationDialog = ({ save }) => {
    const { state, dispatch } = useContext(DeploymentConfigContext)

    const closeConfirmationDialog = () => {
        dispatch({
            type: DeploymentConfigStateActionTypes.showConfirmation,
            payload: false,
        })
    }

    const getButtonState = () => {
        if (state.loading) {
            return <Progressing />
        } else if (state.chartConfig.id) {
            return 'Update'
        } else {
            return 'Save'
        }
    }

    return (
        <ConfirmationDialog>
            <ConfirmationDialog.Icon src={warningIcon} />
            <ConfirmationDialog.Body title="Retain overrides and update" />
            <p>Changes will only be applied to environments using default configuration.</p>
            <p>Environments using overriden configurations will not be updated.</p>
            <ConfirmationDialog.ButtonGroup>
                <button
                    data-testid="base-deployment-template-cancel-button"
                    type="button"
                    className="cta cancel"
                    onClick={closeConfirmationDialog}
                >
                    Cancel
                </button>
                <button
                    data-testid="base_deployment_template_update_button"
                    type="button"
                    className="cta"
                    onClick={save}
                >
                    {getButtonState()}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}
