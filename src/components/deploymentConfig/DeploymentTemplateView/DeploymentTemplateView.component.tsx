import React, { useContext, useEffect, useMemo, useState } from 'react'
import Tippy from '@tippyjs/react'
import ReactSelect, { components } from 'react-select'
import { versionComparator } from '../../common'
import { ConfirmationDialog, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { DropdownIndicator, Option } from '../../v2/common/ReactSelect.utils'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Locked } from '../../../assets/icons/ic-locked.svg'
import infoIcon from '../../../assets/icons/ic-info-filled.svg'
import warningIcon from '../../../assets/img/warning-medium.svg'
import {
    ChartTypeVersionOptionsProps,
    CompareWithApprovalPendingAndDraftProps,
    CompareWithDropdownProps,
    DeploymentChartOptionType,
    DeploymentChartVersionType,
    DeploymentConfigStateActionTypes,
    DropdownContainerProps,
    DropdownItemProps,
} from '../types'
import {
    DEPLOYMENT_TEMPLATE_LABELS_KEYS,
    getApprovalPendingOption,
    getCommonSelectStyles,
    getDeploymentConfigDropdownStyles,
    getDraftOption,
} from '../constants'
import { SortingOrder } from '../../app/types'
import ChartSelectorDropdown from '../ChartSelectorDropdown'
import { DeploymentConfigContext } from '../DeploymentConfig'
import { toast } from 'react-toastify'
import { deleteDeploymentTemplate } from '../../EnvironmentOverride/service'
import { getPosition, handleConfigProtectionError, textDecider } from '../DeploymentConfig.utils'
import { ReactComponent as Eye } from '../../../assets/icons/ic-visibility-on.svg'

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
        <div className="chart-type-version-options pr-16 pt-4 pb-4">
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

const customValueContainer = (props): JSX.Element => (
    <components.ValueContainer {...props}>
        {props.selectProps.value?.label}&nbsp;
        {props.selectProps.value?.version && `(v${props.selectProps.value.version})`}
        {React.cloneElement(props.children[1], {
            style: { position: 'absolute' },
        })}
    </components.ValueContainer>
)

const formatOptionLabel = (option): JSX.Element => (
    <div className="flex left column">
        <span className="w-100 dc__ellipsis-right">{option.label}</span>
    </div>
)

export const CompareWithDropdown = ({
    envId,
    isEnvOverride,
    environments,
    charts,
    selectedOption,
    setSelectedOption,
    globalChartRef,
    isValues,
    groupedData,
}: CompareWithDropdownProps) => {
    const [groupedOptions, setGroupedOptions] = useState([
        {
            label: '',
            options: [],
        },
    ])
    const baseTemplateOption = {
        id: -1,
        label: `${DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label} ${
            globalChartRef?.version ? `(v${globalChartRef.version})` : ''
        }`,
        environmentName: DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label,
        chartRefId: globalChartRef?.id || '',
        chartVersion: globalChartRef?.version || '',
    }

    const envName = useMemo(() => {
        return environments.find((env) => env.id === +envId)?.label
    }, [environments, envId])

    const labelName = {
        '1': 'Default values',
        '2': 'Published on environments',
        '3': `Prev. Deployments on ${envName}`,
        '4': 'Deployed on environments',
    }

    useEffect(() => {
        _initOptions()
    }, [environments, charts, isValues])

    const getSelectedOption = () => {
        if (isEnvOverride) {
            const currentEnv = environments.find((env) => +envId === env.id)
            if (currentEnv?.value) {
                return currentEnv
            }
        }
        return baseTemplateOption
    }

    const _initOptions = () => {
        const _groupOptions = []

        _groupOptions.push({
            label: '',
            options: [baseTemplateOption],
        })

        let id = 0
        _groupOptions.length = 4

        // place all options under corresponding groups
        groupedData.forEach((group) => {
            if (!isValues && group[0].type === 1) return
            if (isValues && group[0].type === 4) return
            if (!envId && group[0].type === 3) return
            _groupOptions[getPosition(isValues, isEnvOverride, group[0].type)] = {
                label: labelName[group[0].type],
                options: group.map((item) => ({
                    id: id++,
                    label: textDecider(item, charts),
                    ...item,
                })),
            }
        })

        setGroupedOptions(_groupOptions)
        setSelectedOption(getSelectedOption())
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
            isSearchable={false}
            onChange={onChange}
            components={{
                IndicatorSeparator: null,
                Option,
                DropdownIndicator,
                ValueContainer: customValueContainer,
            }}
            styles={getDeploymentConfigDropdownStyles(false)}
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
    isDeleteDraftState: boolean,
    isValues: boolean,
) => (
    <div className="flex dc__content-space w-100">
        <div className="flex left">
            {!readOnly && <Edit className="icon-dim-16 mr-10" />}
            {latestDraft ? (
                <span className="fw-6 mr-4">Last saved draft{selectedChart ? ` (v${selectedChart.version})` : ''}</span>
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
                    content={
                        !overridden
                            ? DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText
                            : 'Base configurations are overridden for this file'
                    }
                >
                    <Locked className="icon-dim-16 fcn-6 ml-10" />
                </Tippy>
            )}
        </div>
        <div className="flex right dc__gap-8">
            {!isDeleteDraftState && isEnvOverride && (
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
                    {isValues ? (overridden ? 'Delete override' : 'Allow override') : ''}
                </span>
            )}
        </div>
    </div>
)

export const CompareWithApprovalPendingAndDraft = ({
    isEnvOverride,
    overridden,
    readOnly,
    environmentName,
    selectedChart,
    handleOverride,
    latestDraft,
    isPublishedOverriden,
    isDeleteDraftState,
    setShowDraftData,
    isValues,
    selectedOptionDraft,
    setSelectedOptionDraft,
}: CompareWithApprovalPendingAndDraftProps) => {
    const compareWithApprovalAndDraftOptions = [
        {
            label: 'Manifest generated from',
            options: [
                getApprovalPendingOption(selectedChart?.version),
                getDraftOption(selectedChart?.version, isValues),
            ],
        },
    ]
    const onChange = (selected) => {
        setSelectedOptionDraft(selected)
        setShowDraftData(selected.id === 1)
    }

    return (
        <div className="flex dc__content-space w-100">
            <div className="flex left">
                {!readOnly ? <Edit className="icon-dim-16 mr-10" /> : <Eye />}
                {latestDraft ? (
                    <ReactSelect
                        options={compareWithApprovalAndDraftOptions}
                        isMulti={false}
                        value={selectedOptionDraft}
                        isOptionSelected={(option, selected) => option.id === selected[0].id}
                        classNamePrefix="compare-template-values-select"
                        formatOptionLabel={formatOptionLabel}
                        isSearchable={false}
                        onChange={onChange}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                            DropdownIndicator,
                            ValueContainer: customValueContainer,
                        }}
                        styles={getDeploymentConfigDropdownStyles(overridden)}
                    />
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
                        content={
                            !overridden
                                ? DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText
                                : 'Base configurations are overridden for this file'
                        }
                    >
                        <Locked className="icon-dim-16 fcn-6 ml-10" />
                    </Tippy>
                )}
            </div>
            <div className="flex right dc__gap-8">
                {!isDeleteDraftState && isEnvOverride && (
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
                        {isValues ? (overridden ? 'Delete override' : 'Allow override') : ''}
                    </span>
                )}
            </div>
        </div>
    )
}

export const SuccessToastBody = ({ chartConfig }) => (
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
    const { state, dispatch, reloadEnvironments } = useContext(DeploymentConfigContext)
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
            initialise(null, true)
        } catch (err) {
            handleConfigProtectionError(3, err, dispatch, reloadEnvironments)
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

export function DropdownContainer({ isOpen, onClose, children }: DropdownContainerProps) {
    if (!isOpen) {
        return null
    }

    return (
        <div className="dc__transparent-div" onClick={onClose}>
            <div className="flex-col bcn-0 w-204 h-72 dc__position-abs dc__top-119 dc__border-radius-4-imp dc__left-405 dc__border dc__zi-20 config-toolbar-dropdown-shadow">
                <div className="pt-4 pb-4 pl-0 pr-0">{children}</div>
            </div>
        </div>
    )
}

export function DropdownItem({ label, isValues, onClick }: DropdownItemProps) {
    return (
        <div
            className={`dc__content-start cursor pt-6 pb-6 pr-8 pl-8 fs-13 ${isValues ? 'fw-6 bcb-1' : 'fw-n cn-9'}`}
            onClick={onClick}
        >
            {label}
        </div>
    )
}
