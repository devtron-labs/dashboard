import React, { useEffect, useReducer } from 'react'
import ReactSelect, { components } from 'react-select'
import {
    CDMaterialActionTypes,
    CDMaterialProps,
    CDMaterialType,
    DeploymentNodeType,
    DeploymentWithConfigType,
    MaterialInfo,
    MATERIAL_TYPE,
    STAGE_TYPE,
} from './types'
import { GitTriggers } from '../cicdHistory/types'
import close from '../../../../assets/icons/ic-close.svg'
import arrow from '../../../../assets/icons/misc/arrow-chevron-down-black.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check-circle.svg'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as WarningIcon } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as BackIcon } from '../../../../assets/icons/ic-arrow-backward.svg'
import { ReactComponent as BotIcon } from '../../../../assets/icons/ic-bot.svg'
import { ReactComponent as World } from '../../../../assets/icons/ic-world.svg'
import { ReactComponent as Failed } from '../../../../assets/icons/ic-rocket-fail.svg'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import play from '../../../../assets/icons/misc/arrow-solid-right.svg'
import docker from '../../../../assets/icons/misc/docker.svg'
import {
    VisibleModal,
    ScanVulnerabilitiesTable,
    Progressing,
    getRandomColor,
    showError,
    ConditionalWrap,
    stopPropagation,
    noop,
} from '../../../common'
import { EmptyStateCdMaterial } from './EmptyStateCdMaterial'
import { CDButtonLabelMap, getCommonConfigSelectStyles } from './config'
import {
    CDModalTab,
    getLatestDeploymentConfig,
    getRecentDeploymentConfig,
    getSpecificDeploymentConfig,
} from '../../service'
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleNameMap } from '../../../../config'
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type'
import { DropdownIndicator, Option } from '../../../v2/common/ReactSelect.utils'
import {
    checkForDiff,
    getDeployConfigOptions,
    processResolvedPromise,
    getInitCDMaterialState,
    cdMaterialReducer,
} from './TriggerView.utils'
import TriggerViewConfigDiff from './triggerViewConfigDiff/TriggerViewConfigDiff'
import Tippy from '@tippyjs/react'

export default function CDMaterial(props: CDMaterialProps) {
    const [state, dispatch] = useReducer(cdMaterialReducer, {})

    useEffect(() => {
        getSecurityModuleStatus()
    }, [])

    useEffect(() => {
        dispatch({
            type: CDMaterialActionTypes.multipleOptions,
            payload: getInitCDMaterialState(props),
        })
    }, [props.material])

    useEffect(() => {
        if (
            (state.isRollbackTrigger || (state.isSelectImageTrigger && props.stageType === DeploymentNodeType.CD)) &&
            state.selectedMaterial &&
            props.material.length > 0
        ) {
            getDeploymentConfigDetails()
        }
    }, [state.isRollbackTrigger, state.isSelectImageTrigger, state.selectedMaterial])

    const getWfrId = () => {
        if (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG) {
            return state.recentDeploymentConfig.wfrId
        }

        return state.selectedMaterial
            ? state.selectedMaterial.wfrId
            : props.material?.find((_mat) => _mat.isSelected)?.wfrId
    }

    const getDeploymentConfigDetails = () => {
        dispatch({
            type: CDMaterialActionTypes.checkingDiff,
            payload: true,
        })
        const { appId, pipelineId } = props
        Promise.allSettled([
            getRecentDeploymentConfig(appId, pipelineId),
            getLatestDeploymentConfig(appId, pipelineId),
            state.isRollbackTrigger ? getSpecificDeploymentConfig(appId, pipelineId, getWfrId()) : noop,
        ]).then(
            ([recentDeploymentConfigRes, latestDeploymentConfigRes, specificDeploymentConfigRes]: {
                status: string
                value?: any
                reason?: any
            }[]) => {
                const _recentDeploymentConfig = processResolvedPromise(recentDeploymentConfigRes, true)
                const _specificDeploymentConfig = processResolvedPromise(specificDeploymentConfigRes)
                const _latestDeploymentConfig = processResolvedPromise(latestDeploymentConfigRes)
                const _diffOptions = state.isRollbackTrigger
                    ? checkForDiff(_recentDeploymentConfig, _specificDeploymentConfig)
                    : checkForDiff(_recentDeploymentConfig, _latestDeploymentConfig)

                dispatch({
                    type: CDMaterialActionTypes.multipleOptions,
                    payload: {
                        recentDeploymentConfig: _recentDeploymentConfig, //last deployed config
                        latestDeploymentConfig: _latestDeploymentConfig, //last saved config
                        specificDeploymentConfig: _specificDeploymentConfig, //config of one particular wfrId
                        diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                        diffOptions: _diffOptions,
                        checkingDiff: false,
                    },
                })
            },
        )
    }

    const getSecurityModuleStatus = async (): Promise<void> => {
        try {
            const { result } = await getModuleInfo(ModuleNameMap.SECURITY)
            if (result?.status === ModuleStatus.INSTALLED) {
                dispatch({
                    type: CDMaterialActionTypes.isSecurityModuleInstalled,
                    payload: true,
                })
            }
        } catch (error) {}
    }

    const renderGitMaterialInfo = (matInfo: MaterialInfo[]) => {
        return (
            <>
                {matInfo.map((mat: MaterialInfo) => {
                    let _gitCommit: GitTriggers = {
                        Commit: mat.revision,
                        Author: mat.author,
                        Date: mat.modifiedTime,
                        Message: mat.message,
                        WebhookData: JSON.parse(mat.webhookData),
                        Changes: [],
                        GitRepoUrl: '',
                        GitRepoName: '',
                        CiConfigureSourceType: '',
                        CiConfigureSourceValue: '',
                    }

                    return (
                        (_gitCommit.WebhookData?.Data ||
                            _gitCommit.Author ||
                            _gitCommit.Message ||
                            _gitCommit.Date ||
                            _gitCommit.Commit) && (
                            <div className="bcn-0 pt-12 br-4 pb-12 en-2 bw-1 m-12">
                                <GitCommitInfoGeneric
                                    materialUrl={mat.url}
                                    showMaterialInfoHeader={true}
                                    commitInfo={_gitCommit}
                                    materialSourceType={mat.type}
                                    selectedCommitInfo={''}
                                    materialSourceValue={mat.branch}
                                />
                            </div>
                        )
                    )
                })}
            </>
        )
    }

    const renderVulnerabilities = (mat) => {
        if (!mat.scanned) {
            return (
                <div className="security-tab-empty">
                    <p className="security-tab-empty__title">Image was not scanned</p>
                </div>
            )
        } else if (!mat.scanEnabled) {
            return (
                <div className="security-tab-empty">
                    <p className="security-tab-empty__title">Scan is Disabled</p>
                </div>
            )
        } else if (mat.vulnerabilitiesLoading) {
            return (
                <div className="security-tab-empty">
                    <Progressing />
                </div>
            )
        } else if (!mat.vulnerabilitiesLoading && mat.vulnerabilities.length === 0) {
            return (
                <div className="security-tab-empty">
                    <p className="security-tab-empty__title">No vulnerabilities Found</p>
                    <p className="security-tab-empty__subtitle">{mat.lastExecution}</p>
                </div>
            )
        } else
            return (
                <div className="security-tab">
                    <p className="security-tab__last-scanned">Scanned on {mat.lastExecution} </p>
                    <ScanVulnerabilitiesTable vulnerabilities={mat.vulnerabilities} />
                </div>
            )
    }

    const renderActiveCD = (mat) => {
        return (
            <>
                {mat.latest && (
                    <span className="bcg-1 br-4 eg-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                        <div className="fw-4 fs-11 lh-16 flex">
                            <World className="icon-dim-16 mr-4 scg-5" />
                            Active on <span className="fw-6 ml-4">{props.envName} </span>
                        </div>
                    </span>
                )}
                {mat.runningOnParentCd && (
                    <span className="bcg-1 br-4 eg-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                        <div className="fw-4 fs-11 lh-16 flex">
                            <World className="icon-dim-16 mr-4 scg-5" />
                            Active on <span className="fw-6 ml-4">{props.parentEnvironmentName}</span>
                        </div>
                    </span>
                )}
            </>
        )
    }

    const renderProgressingCD = (mat) => {
        return (
            <span className="bcy-1 br-4 ey-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                <div className="fw-4 fs-11 lh-16 flex">
                    <div className={`dc__app-summary__icon icon-dim-16 mr-6 progressing progressing--node`}></div>
                    Deploying on <span className="fw-6 ml-4">{props.envName} </span>
                </div>
            </span>
        )
    }

    const renderFailedCD = (mat) => {
        return (
            <span className="bcr-1 br-4 er-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                <div className="fw-4 fs-11 lh-16 flex">
                    <Failed className="icon-dim-16 mr-4" />
                    Last deployment failed on <span className="fw-6 ml-4">{props.envName} </span>
                </div>
            </span>
        )
    }

    const renderSequentialCDCardTitle = (mat) => {
        if (props.stageType !== STAGE_TYPE.CD) return

        if (
            mat.latest ||
            mat.runningOnParentCd ||
            mat.artifactStatus === 'Progressing' ||
            mat.artifactStatus === 'Degraded' ||
            mat.artifactStatus === 'Failed'
        ) {
            return (
                <div className="bcn-0 p-8 br-4 dc__border-bottom flex left">
                    {renderActiveCD(mat)}
                    {mat.artifactStatus === 'Progressing' && renderProgressingCD(mat)}
                    {(mat.artifactStatus === 'Degraded' || mat.artifactStatus === 'Failed') && renderFailedCD(mat)}
                </div>
            )
        }
    }

    const handleImageSelection = async (index: number, selectedMaterial: CDMaterialType) => {
        props.selectImage(
            index,
            props.materialType,
            props.isFromBulkCD ? { id: props.pipelineId, type: props.stageType } : null,
        )
        if (state.isSelectImageTrigger && state.selectedMaterial?.image !== selectedMaterial.image) {
            dispatch({
                type: CDMaterialActionTypes.selectedMaterial,
                payload: selectedMaterial,
            })
        }

        if (state.isRollbackTrigger && state.selectedMaterial?.wfrId !== selectedMaterial.wfrId) {
            const isSpecificTriggerConfig =
                state.selectedConfigToDeploy.value === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG

            dispatch({
                type: CDMaterialActionTypes.multipleOptions,
                payload: {
                    selectedMaterial,
                    checkingDiff: isSpecificTriggerConfig,
                },
            })

            try {
                const { result } = await getSpecificDeploymentConfig(
                    props.appId,
                    props.pipelineId,
                    selectedMaterial.wfrId,
                )
                if (result) {
                    const _specificDeploymentConfig = processResolvedPromise({
                        status: 'fulfilled',
                        value: {
                            result,
                        },
                    })

                    if (isSpecificTriggerConfig) {
                        const _diffOptions = checkForDiff(state.recentDeploymentConfig, _specificDeploymentConfig)
                        dispatch({
                            type: CDMaterialActionTypes.multipleOptions,
                            payload: {
                                specificDeploymentConfig: _specificDeploymentConfig,
                                diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                                diffOptions: _diffOptions,
                            },
                        })
                    } else {
                        dispatch({
                            type: CDMaterialActionTypes.specificDeploymentConfig,
                            payload: _specificDeploymentConfig,
                        })
                    }
                }
            } catch (error) {
                showError(error)
            } finally {
                dispatch({
                    type: CDMaterialActionTypes.checkingDiff,
                    payload: false,
                })
            }
        }
    }

    const renderMaterialInfo = (mat: CDMaterialType, hideSelector?: boolean) => {
        return (
            <>
                <div className="flex left column">
                    <div className="commit-hash commit-hash--docker">
                        <img src={docker} alt="" className="commit-hash__icon" />
                        {mat.image}
                    </div>
                    {props.stageType !== STAGE_TYPE.CD && mat.latest && (
                        <span className="last-deployed-status">Last Run</span>
                    )}
                </div>
                {props.materialType === MATERIAL_TYPE.none ? (
                    <div />
                ) : (
                    <div className="material-history__info flex left fs-13">
                        <DeployIcon className="icon-dim-16 scn-6 mr-8" />
                        <span className="fs-13 fw-4">{mat.deployedTime}</span>
                    </div>
                )}
                {!!mat.deployedBy && state.isRollbackTrigger ? (
                    <div className="material-history__deployed-by flex left">
                        {mat.deployedBy === 'system' ? (
                            <>
                                <BotIcon className="icon-dim-16 mr-6" />
                                <span className="fs-13 fw-4">Auto triggered</span>
                            </>
                        ) : (
                            <>
                                <span
                                    className="flex fs-13 fw-6 lh-18 icon-dim-20 mr-6 cn-0 m-auto dc__border-transparent dc__uppercase dc__border-radius-50-per"
                                    style={{
                                        backgroundColor: getRandomColor(mat.deployedBy),
                                    }}
                                >
                                    {mat.deployedBy[0]}
                                </span>
                                <span className="fs-13 fw-4">{mat.deployedBy}</span>
                            </>
                        )}
                    </div>
                ) : (
                    <div />
                )}
                {!hideSelector && (
                    <div className="material-history__select-text w-auto">
                        {mat.vulnerable ? (
                            <span className="material-history__scan-error">Security Issues Found</span>
                        ) : mat.isSelected ? (
                            <Check className="dc__align-right icon-dim-24" />
                        ) : (
                            'Select'
                        )}
                    </div>
                )}
            </>
        )
    }

    const renderMaterial = () => {
        const materialList = state.isRollbackTrigger && state.showOlderImages ? [props.material[0]] : props.material

        return materialList.map((mat, index) => {
            let isMaterialInfoAvailable = true
            for (const materialInfo of mat.materialInfo) {
                isMaterialInfoAvailable =
                    isMaterialInfoAvailable &&
                    !!(
                        materialInfo.webhookData ||
                        materialInfo.author ||
                        materialInfo.message ||
                        materialInfo.modifiedTime ||
                        materialInfo.revision
                    )
                if (!isMaterialInfoAvailable) break
            }
            return (
                <div
                    key={`material-history-${index}`}
                    className={`material-history material-history--cd ${
                        mat.isSelected ? 'material-history-selected' : ''
                    }`}
                >
                    {renderSequentialCDCardTitle(mat)}
                    <div
                        className={`material-history__top mh-66 ${
                            !state.isSecurityModuleInstalled && mat.showSourceInfo ? 'dc__border-bottom' : ''
                        }`}
                        style={{ cursor: `${mat.vulnerable ? 'not-allowed' : mat.isSelected ? 'default' : 'pointer'}` }}
                        onClick={(event) => {
                            event.stopPropagation()
                            if (!mat.vulnerable) {
                                handleImageSelection(index, mat)
                            }
                        }}
                    >
                        {renderMaterialInfo(mat)}
                    </div>
                    {mat.showSourceInfo && (
                        <>
                            {state.isSecurityModuleInstalled && !props.hideInfoTabsContainer && (
                                <ul className="tab-list tab-list--vulnerability">
                                    <li className="tab-list__tab">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                props.changeTab(
                                                    index,
                                                    Number(mat.id),
                                                    CDModalTab.Changes,
                                                    {
                                                        id: props.pipelineId,
                                                        type: props.stageType,
                                                    },
                                                    props.appId,
                                                )
                                            }}
                                            className={`dc__transparent tab-list__tab-link tab-list__tab-link--vulnerability ${
                                                mat.tab === CDModalTab.Changes ? 'active' : ''
                                            }`}
                                        >
                                            Changes
                                        </button>
                                    </li>
                                    <li className="tab-list__tab">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                props.changeTab(
                                                    index,
                                                    Number(mat.id),
                                                    CDModalTab.Security,
                                                    props.isFromBulkCD
                                                        ? { id: props.pipelineId, type: props.stageType }
                                                        : null,
                                                    props.appId,
                                                )
                                            }}
                                            className={`dc__transparent tab-list__tab-link tab-list__tab-link--vulnerability ${
                                                mat.tab === CDModalTab.Security ? 'active' : ''
                                            }`}
                                        >
                                            Security
                                            {mat.vulnerabilitiesLoading ? '' : ` (${mat.vulnerabilities.length})`}
                                        </button>
                                    </li>
                                </ul>
                            )}
                            {mat.tab === CDModalTab.Changes
                                ? renderGitMaterialInfo(mat.materialInfo)
                                : renderVulnerabilities(mat)}
                        </>
                    )}
                    {mat.materialInfo.length > 0 && isMaterialInfoAvailable && (
                        <button
                            type="button"
                            className="material-history__changes-btn"
                            data-testid={mat.showSourceInfo ? 'collapse-show-info' : 'collapse-hide-info'}
                            onClick={(event) => {
                                event.stopPropagation()
                                props.toggleSourceInfo(
                                    index,
                                    props.isFromBulkCD ? { id: props.pipelineId, type: props.stageType } : null,
                                )
                            }}
                        >
                            {mat.showSourceInfo ? 'Hide Source Info' : 'Show Source Info'}
                            <img
                                src={arrow}
                                alt=""
                                style={{ transform: `${mat.showSourceInfo ? 'rotate(-180deg)' : ''}` }}
                            />
                        </button>
                    )}
                </div>
            )
        })
    }

    const renderCDModalHeader = (): JSX.Element | string => {
        const _stageType = state.isRollbackTrigger ? STAGE_TYPE.ROLLBACK : props.stageType
        switch (_stageType) {
            case STAGE_TYPE.PRECD:
                return 'Pre Deployment'
            case STAGE_TYPE.CD:
                return (
                    <>
                        Deploy to <span className="fw-6">{props.envName}</span>
                    </>
                )
            case STAGE_TYPE.POSTCD:
                return 'Post Deployment'
            case STAGE_TYPE.ROLLBACK:
                return (
                    <>
                        Rollback for <span className="fw-6">{props.envName}</span>
                    </>
                )
            default:
                return ''
        }
    }

    const reviewConfig = () => {
        if (canReviewConfig()) {
            dispatch({
                type: CDMaterialActionTypes.showConfigDiffView,
                payload: !state.showConfigDiffView,
            })
        }
    }

    const isConfigPresent = () => {
        return (
            (state.selectedConfigToDeploy.value === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                state.specificDeploymentConfig?.deploymentTemplate &&
                state.specificDeploymentConfig.pipelineStrategy) ||
            (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LAST_SAVED_CONFIG &&
                state.latestDeploymentConfig?.deploymentTemplate &&
                state.latestDeploymentConfig.pipelineStrategy)
        )
    }

    const canReviewConfig = () => {
        return (
            (state.recentDeploymentConfig?.deploymentTemplate &&
                state.recentDeploymentConfig.pipelineStrategy &&
                (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG ||
                    isConfigPresent())) ||
            !state.recentDeploymentConfig
        )
    }

    const canDeployWithConfig = () => {
        return (
            (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
                state.recentDeploymentConfig?.deploymentTemplate &&
                state.recentDeploymentConfig.pipelineStrategy) ||
            isConfigPresent()
        )
    }

    const formatOptionLabel = (option) => {
        return (
            <div className="flex left column w-100">
                <span className="dc__ellipsis-right">{option.label}</span>
                <small className="cn-6">{option.infoText}</small>
                <div className="dc__border-bottom" />
            </div>
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

    const renderStatus = (_canReviewConfig: boolean) => {
        if (state.checkingDiff) {
            return (
                <>
                    Checking diff&nbsp;
                    <Progressing
                        size={16}
                        styles={{
                            width: 'auto',
                        }}
                    />
                </>
            )
        } else {
            if (!_canReviewConfig) {
                return (
                    state.recentDeploymentConfig && (
                        <>
                            <WarningIcon className="no-config-found-icon icon-dim-16" />
                            &nbsp; Config Not Available
                        </>
                    )
                )
            } else if (state.diffFound) {
                return (
                    <>
                        <WarningIcon className="config-diff-found-icon icon-dim-16" />
                        &nbsp; <span className="config-diff-status">Config Diff</span>
                    </>
                )
            } else {
                return <span className="config-diff-status">No Config Diff</span>
            }
        }
    }

    const getStatusColorClasses = (_canReviewConfig: boolean) => {
        if (state.checkingDiff) {
            return 'cn-0 bcb-5'
        } else if (!_canReviewConfig) {
            return 'cn-9 bcn-1 cursor-not-allowed'
        } else if (state.diffFound) {
            return 'cn-0 bcr-5'
        }
        return 'cn-0 bcg-5'
    }

    const renderConfigDiffStatus = () => {
        const _canReviewConfig = canReviewConfig() && state.recentDeploymentConfig !== null
        const isLastDeployedOption =
            state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG

        return (
            <div
                className={`trigger-modal__config-diff-status flex pl-16 pr-16 dc__right-radius-4 ${
                    _canReviewConfig ? 'cursor' : 'config-not-found'
                } ${isLastDeployedOption ? 'pt-10 pb-10' : 'pt-7 pb-7'}`}
                onClick={reviewConfig}
            >
                {!isLastDeployedOption && (state.recentDeploymentConfig !== null || state.checkingDiff) && (
                    <div
                        className={`flex pt-3 pb-3 pl-12 pr-12 dc__border-radius-24 fs-12 fw-6 lh-20 ${getStatusColorClasses(
                            _canReviewConfig,
                        )}`}
                    >
                        {renderStatus(_canReviewConfig)}
                    </div>
                )}
                {((!state.checkingDiff && _canReviewConfig) ||
                    isLastDeployedOption ||
                    !state.recentDeploymentConfig) && (
                    <span className={`dc__uppercase cb-5 pointer ${!isLastDeployedOption ? 'ml-12' : ''}`}>REVIEW</span>
                )}
            </div>
        )
    }

    const isDeployButtonDisabled = () => {
        const selectedImage = props.material.find((artifact) => artifact.isSelected)
        return (
            !selectedImage ||
            (state.isRollbackTrigger && (state.checkingDiff || !canDeployWithConfig())) ||
            (state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
                !state.recentDeploymentConfig)
        )
    }

    const getTippyContent = () => {
        return (
            <>
                <h2 className="fs-12 fw-6 lh-18 m-0">Selected Config not available!</h2>
                <p className="fs-12 fw-4 lh-18 m-0">
                    {state.selectedConfigToDeploy.value === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                    (!state.specificDeploymentConfig ||
                        !state.specificDeploymentConfig.deploymentTemplate ||
                        !state.specificDeploymentConfig.pipelineStrategy)
                        ? 'Please select a different image or configuration to deploy'
                        : 'Please select a different configuration to deploy'}
                </p>
            </>
        )
    }

    const renderTriggerModalCTA = () => {
        const buttonLabel = CDButtonLabelMap[props.stageType]
        return (
            <div
                className={`trigger-modal__trigger ${
                    (!state.isRollbackTrigger && !state.isSelectImageTrigger) || state.showConfigDiffView
                        ? 'flex right'
                        : ''
                }`}
            >
                {(state.isRollbackTrigger || state.isSelectImageTrigger) &&
                    !state.showConfigDiffView &&
                    props.stageType === DeploymentNodeType.CD && (
                        <div className="flex left dc__border br-4 h-42">
                            <div className="flex">
                                <ReactSelect
                                    options={getDeployConfigOptions(
                                        state.isRollbackTrigger,
                                        state.recentDeploymentConfig !== null,
                                    )}
                                    components={{
                                        IndicatorSeparator: null,
                                        DropdownIndicator,
                                        Option,
                                        ValueContainer: customValueContainer,
                                    }}
                                    isDisabled={state.checkingDiff}
                                    isSearchable={false}
                                    formatOptionLabel={formatOptionLabel}
                                    classNamePrefix="deploy-config-select"
                                    placeholder="Select Config"
                                    menuPlacement="top"
                                    value={state.selectedConfigToDeploy}
                                    styles={getCommonConfigSelectStyles({
                                        valueContainer: (base, state) => ({
                                            ...base,
                                            minWidth: '135px',
                                            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                                        }),
                                    })}
                                    onChange={handleConfigSelection}
                                />
                            </div>
                            <span className="dc__border-left h-100" />
                            <ConditionalWrap
                                condition={!state.checkingDiff && isDeployButtonDisabled()}
                                wrap={(children) => (
                                    <Tippy
                                        className="default-tt w-200"
                                        arrow={false}
                                        placement="top"
                                        content={getTippyContent()}
                                    >
                                        {children}
                                    </Tippy>
                                )}
                            >
                                {renderConfigDiffStatus()}
                            </ConditionalWrap>
                        </div>
                    )}
                <ConditionalWrap
                    condition={!state.checkingDiff && isDeployButtonDisabled()}
                    wrap={(children) => (
                        <Tippy className="default-tt w-200" arrow={false} placement="top" content={getTippyContent()}>
                            {children}
                        </Tippy>
                    )}
                >
                    <button
                        className={`cta flex ml-auto h-36 ${isDeployButtonDisabled() ? 'disabled-opacity' : ''}`}
                        onClick={deployTrigger}
                    >
                        {props.isLoading ? (
                            <Progressing />
                        ) : (
                            <>
                                {props.stageType === STAGE_TYPE.CD ? (
                                    <DeployIcon className="icon-dim-16 dc__no-svg-fill mr-8" />
                                ) : (
                                    <img src={play} alt="trigger" className="trigger-btn__icon" />
                                )}
                                {buttonLabel}
                            </>
                        )}
                    </button>
                </ConditionalWrap>
            </div>
        )
    }

    const handleConfigSelection = (selected) => {
        if (selected.value !== state.selectedConfigToDeploy.value) {
            const _diffOptions = checkForDiff(state.recentDeploymentConfig, getBaseTemplateConfiguration(selected))
            dispatch({
                type: CDMaterialActionTypes.multipleOptions,
                payload: {
                    selectedConfigToDeploy: selected,
                    diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                    diffOptions: _diffOptions,
                },
            })
        }
    }

    const deployTrigger = (e) => {
        e.stopPropagation()

        // Blocking the deploy action if already deploying or config is not available
        if (props.isLoading || isDeployButtonDisabled()) {
            return
        }

        if (state.isRollbackTrigger || state.isSelectImageTrigger) {
            props.triggerDeploy(props.stageType, props.appId, state.selectedConfigToDeploy?.value, getWfrId())
        } else {
            props.triggerDeploy(props.stageType, props.appId)
        }
    }

    const getBaseTemplateConfiguration = (selected = null) => {
        const selectedConfig = selected?.value || state.selectedConfigToDeploy.value
        return selectedConfig === DeploymentWithConfigType.LAST_SAVED_CONFIG
            ? state.latestDeploymentConfig
            : selectedConfig === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG
            ? state.recentDeploymentConfig
            : state.specificDeploymentConfig
    }

    const handleOlderImagesLoading = (loadingMore: boolean, noMoreImages?: boolean) => {
        dispatch({
            type: CDMaterialActionTypes.multipleOptions,
            payload: {
                loadingMore,
                noMoreImages,
            },
        })
    }

    const loadOlderImages = () => {
        if (props.onClickRollbackMaterial && !state.loadingMore) {
            if (props.material.length > 19) {
                props.onClickRollbackMaterial(props.pipelineId, props.material.length + 1, 20, handleOlderImagesLoading)
                dispatch({
                    type: CDMaterialActionTypes.multipleOptions,
                    payload: {
                        showOlderImages: false,
                        loadingMore: true,
                    },
                })
            } else {
                dispatch({
                    type: CDMaterialActionTypes.multipleOptions,
                    payload: {
                        showOlderImages: false,
                        noMoreImages: true,
                    },
                })
            }
        }
    }

    const isConfigAvailable = (optionValue: string) => {
        if (
            (optionValue === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                (!state.specificDeploymentConfig?.deploymentTemplate ||
                    !state.specificDeploymentConfig.pipelineStrategy)) ||
            (optionValue === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
                (!state.recentDeploymentConfig?.deploymentTemplate ||
                    !state.recentDeploymentConfig.pipelineStrategy)) ||
            (optionValue === DeploymentWithConfigType.LAST_SAVED_CONFIG &&
                (!state.latestDeploymentConfig?.deploymentTemplate || !state.latestDeploymentConfig.pipelineStrategy))
        ) {
            return false
        }

        return true
    }

    const renderTriggerBody = () => {
        return (
            <div
                className={`trigger-modal__body ${state.showConfigDiffView && canReviewConfig() ? 'p-0' : ''}`}
                style={{
                    height: state.showConfigDiffView ? 'calc(100vh - 141px)' : 'calc(100vh - 116px)',
                }}
            >
                {state.showConfigDiffView && canReviewConfig() ? (
                    <TriggerViewConfigDiff
                        currentConfiguration={state.recentDeploymentConfig}
                        baseTemplateConfiguration={getBaseTemplateConfiguration()}
                        selectedConfigToDeploy={state.selectedConfigToDeploy}
                        handleConfigSelection={handleConfigSelection}
                        isConfigAvailable={isConfigAvailable}
                        diffOptions={state.diffOptions}
                        isRollbackTriggerSelected={state.isRollbackTrigger}
                        isRecentConfigAvailable={state.recentDeploymentConfig !== null}
                    />
                ) : (
                    <>
                        {!props.isFromBulkCD && (
                            <div className="material-list__title pb-16">
                                {state.isRollbackTrigger ? 'Select from previously deployed images' : 'Select Image'}
                            </div>
                        )}
                        {renderMaterial()}
                        {state.isRollbackTrigger && !state.noMoreImages && props.material.length !== 1 && (
                            <button className="show-older-images-cta cta ghosted flex h-32" onClick={loadOlderImages}>
                                {state.loadingMore ? <Progressing styles={{ height: '32px' }} /> : 'Show older images'}
                            </button>
                        )}
                    </>
                )}
            </div>
        )
    }

    const renderCDModal = () => {
        return (
            <>
                <div className="trigger-modal__header">
                    {state.showConfigDiffView ? (
                        <div className="flex left">
                            <button type="button" className="dc__transparent icon-dim-24" onClick={reviewConfig}>
                                <BackIcon />
                            </button>
                            <div className="flex column left ml-16">
                                <h1 className="modal__title mb-8">{renderCDModalHeader()}</h1>
                                {state.selectedMaterial && (
                                    <div className="flex left dc__column-gap-24">
                                        {renderMaterialInfo(state.selectedMaterial, true)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <h1 className="modal__title">{renderCDModalHeader()}</h1>
                    )}
                    <button type="button" className="dc__transparent" onClick={props.closeCDModal}>
                        <img alt="close" src={close} />
                    </button>
                </div>
                {renderTriggerBody()}
                {renderTriggerModalCTA()}
            </>
        )
    }

    const renderCDMaterialBody = () => {
        if (props.isLoading) {
            return (
                <>
                    <div className="trigger-modal__header flex right">
                        <button type="button" className="dc__transparent" onClick={props.closeCDModal}>
                            <CloseIcon />
                        </button>
                    </div>
                    <div style={{ height: 'calc(100% - 55px)' }}>
                        <Progressing pageLoader />
                    </div>
                </>
            )
        } else if (props.material.length > 0) {
            return renderCDModal()
        } else {
            return (
                <>
                    <div className="trigger-modal__header">
                        <h1 className="modal__title">{renderCDModalHeader()}</h1>
                        <button type="button" className="dc__transparent" onClick={props.closeCDModal}>
                            <img alt="close" src={close} />
                        </button>
                    </div>
                    <EmptyStateCdMaterial materialType={props.materialType} />
                </>
            )
        }
    }

    if (props.isFromBulkCD) {
        return props.material.length > 0 ? (
            renderTriggerBody()
        ) : (
            <EmptyStateCdMaterial materialType={props.materialType} />
        )
    } else {
        return (
            <VisibleModal
                className=""
                parentClassName={state.isRollbackTrigger || state.isSelectImageTrigger ? 'dc__overflow-hidden' : ''}
                close={props.closeCDModal}
            >
                <div
                    className={`modal-body--cd-material h-100 ${
                        state.isRollbackTrigger || state.isSelectImageTrigger ? 'contains-diff-view' : ''
                    } ${props.material.length > 0 ? '' : 'no-material'}`}
                    onClick={stopPropagation}
                >
                    {renderCDMaterialBody()}
                </div>
            </VisibleModal>
        )
    }
}
