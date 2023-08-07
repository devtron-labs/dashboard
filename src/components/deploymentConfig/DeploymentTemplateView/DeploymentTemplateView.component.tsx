import React, { useContext, useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import ReactSelect, { components } from 'react-select'
import { DEPLOYMENT, ROLLOUT_DEPLOYMENT } from '../../../config'
import { versionComparator } from '../../common'
import { ConfirmationDialog, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { DropdownIndicator, Option } from '../../v2/common/ReactSelect.utils'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Locked } from '../../../assets/icons/ic-locked.svg'
import infoIcon from '../../../assets/icons/ic-info-filled.svg'
import warningIcon from '../../../assets/img/warning-medium.svg'
import {
    ChartTypeVersionOptionsProps,
    CompareWithDropdownProps,
    DeploymentChartGroupOptionType,
    DeploymentChartOptionType,
    DeploymentChartVersionType,
    DeploymentConfigStateActionTypes,
} from '../types'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS, getCommonSelectStyles } from '../constants'
import { SortingOrder } from '../../app/types'
import ChartSelectorDropdown from '../ChartSelectorDropdown'
import { DeploymentConfigContext } from '../DeploymentConfig'
import { toast } from 'react-toastify'
import { deleteDeploymentTemplate } from '../../EnvironmentOverride/service'

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
            className={`chart-type-version-options pr-16 pt-4 pb-4 ${
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

const formatOptionLabel = (option: DeploymentChartOptionType): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 dc__ellipsis-right">
                {option.label}&nbsp;{option.version && `(v${option.version})`}
            </span>
        </div>
    )
}

const customValueContainer = (props): JSX.Element => {
    return (
        <components.ValueContainer {...props}>
            {props.selectProps.value?.label}&nbsp;
            {props.selectProps.value?.version && `(v${props.selectProps.value.version})`}
            {React.cloneElement(props.children[1], {
                style: { position: 'absolute' },
            })}
        </components.ValueContainer>
    )
}

export const CompareWithDropdown = ({
    envId,
    isEnvOverride,
    environments,
    charts,
    selectedOption,
    setSelectedOption,
    globalChartRef,
    isDraftMode,
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
            if (isDraftMode) {
                return environments.find((env) => +envId === env.id)
            }
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
        if (isEnvOverride || isDraftMode) {
            _groupOptions.push({
                label: '',
                options: [baseTemplateOption],
            })
        }

        // Push all environment & other version options
        _groupOptions.push({
            label: isDraftMode
                ? DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.publishedLabel
                : DEPLOYMENT_TEMPLATE_LABELS_KEYS.otherEnv.label,
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
        return 'calc(100vh - 220px)'
    } else if (isEnvOverride) {
        return 'calc(100vh - 272px)'
    } else {
        return isUnSet ? 'calc(100vh - 236px)' : 'calc(100vh - 240px)'
    }
}

export const renderEditorHeading = (
    isEnvOverride: boolean,
    overridden: boolean,
    readOnly: boolean,
    environmentName: string,
    selectedChart: DeploymentChartVersionType,
    handleOverride: (e: any) => Promise<void>,
    latestDraft: any,
    isPublishedOverriden: boolean,
) => {
    return (
        <div className="flex dc__content-space w-100">
            <div className="flex left">
                {!readOnly && <Edit className="icon-dim-16 mr-10" />}
                {!!latestDraft ? (
                    <span className="fw-6 mr-4">Last saved draft</span>
                ) : (
                    `${isEnvOverride ? environmentName : DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label} ${
                        selectedChart ? `(v${selectedChart.version})` : ''
                    }`
                )}
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
            <div className="flex right dc__gap-8">
                {isEnvOverride && (
                    <span className="fs-12 fw-4 lh-20 dc__italic-font-style">
                        {overridden ? 'Overriden' : 'Inheriting from base'}
                    </span>
                )}
                {isEnvOverride && (!latestDraft || (latestDraft.action !== 3 && isPublishedOverriden)) && (
                    <span
                        data-testid={`action-override-${overridden ? 'delete' : 'allow'}`}
                        className={`cursor ${overridden ? 'cr-5' : 'cb-5'}`}
                        onClick={handleOverride}
                    >
                        {overridden ? 'Delete override' : 'Allow override'}
                    </span>
                )}
            </div>
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
            <ConfirmationDialog.Icon src={infoIcon} />
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

export const DeleteOverrideDialog = ({ appId, envId, initialise }) => {
    const { state, dispatch } = useContext(DeploymentConfigContext)
    const [apiInProgress, setApiInProgress] = useState(false)

    const closeConfirmationDialog = () => {
        dispatch({ type: DeploymentConfigStateActionTypes.toggleDialog })
    }

    async function handleDelete() {
        try {
            setApiInProgress(true)
            await deleteDeploymentTemplate(state.data.environmentConfig.id, Number(appId), Number(envId))
            toast.success('Restored to global.', { autoClose: null })
            dispatch({
                type: DeploymentConfigStateActionTypes.duplicate,
                payload: null,
            })
            initialise(true, true)
        } catch (err) {
        } finally {
            setApiInProgress(false)
            closeConfirmationDialog()
        }
    }

    return (
        <ConfirmationDialog>
            <ConfirmationDialog.Icon src={warningIcon} />
            <ConfirmationDialog.Body
                title="This action will cause permanent removal."
                subtitle="This action will cause all overrides to erase and app level configuration will be applied"
            />
            <ConfirmationDialog.ButtonGroup>
                <button
                    data-testid="cancel-changes-button"
                    type="button"
                    className="cta cancel"
                    onClick={closeConfirmationDialog}
                    disabled={apiInProgress}
                >
                    Cancel
                </button>
                <button
                    data-testid="confirm-changes-button"
                    type="button"
                    className="cta delete"
                    onClick={handleDelete}
                    disabled={apiInProgress}
                >
                    {apiInProgress ? <Progressing size={16} /> : 'Confirm'}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}
