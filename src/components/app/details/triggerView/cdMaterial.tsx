import React, { Component } from 'react'
import ReactSelect, { components } from 'react-select'
import {
    CDMaterialProps,
    CDMaterialState,
    CDMaterialType,
    DeploymentWithConfigType,
    MATERIAL_TYPE,
    STAGE_TYPE,
} from './types'
import { GitTriggers } from '../cIDetails/types'
import close from '../../../../assets/icons/ic-close.svg'
import arrow from '../../../../assets/icons/misc/arrow-chevron-down-black.svg'
import { ReactComponent as Check } from '../../../../assets/icons/ic-check-circle.svg'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as WarningIcon } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as BackIcon } from '../../../../assets/icons/ic-arrow-backward.svg'
import { ReactComponent as BotIcon } from '../../../../assets/icons/ic-bot.svg'
import play from '../../../../assets/icons/misc/arrow-solid-right.svg'
import docker from '../../../../assets/icons/misc/docker.svg'
import {
    VisibleModal,
    ScanVulnerabilitiesTable,
    Progressing,
    getRandomColor,
    showError,
    ConditionalWrap,
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
    SPECIFIC_TRIGGER_CONFIG_OPTION,
} from './TriggerView.utils'
import TriggerViewConfigDiff from './triggerViewConfigDiff/TriggerViewConfigDiff'
import Tippy from '@tippyjs/react'

export class CDMaterial extends Component<CDMaterialProps, CDMaterialState> {
    constructor(props: CDMaterialProps) {
        super(props)
        this.state = {
            isSecurityModuleInstalled: false,
            checkingDiff: false,
            diffFound: false,
            diffOptions: null,
            showConfigDiffView: false,
            loadingMore: false,
            showOlderImages: true,
            noMoreImages: false,
            selectedConfigToDeploy: SPECIFIC_TRIGGER_CONFIG_OPTION,
            selectedMaterial: props.material.find((_mat) => _mat.isSelected),
            isRollbackTrigger: props.materialType === MATERIAL_TYPE.rollbackMaterialList,
            recentDeploymentConfig: null,
            latestDeploymentConfig: null,
            specificDeploymentConfig: null,
        }
        this.handleConfigSelection = this.handleConfigSelection.bind(this)
        this.deployTrigger = this.deployTrigger.bind(this)
        this.reviewConfig = this.reviewConfig.bind(this)
        this.loadOlderImages = this.loadOlderImages.bind(this)
        this.handleOlderImagesLoading = this.handleOlderImagesLoading.bind(this)
        this.isConfigAvailable = this.isConfigAvailable.bind(this)
    }

    componentDidMount() {
        this.getSecurityModuleStatus()

        if (this.state.isRollbackTrigger && this.state.selectedMaterial && this.props.material.length > 0) {
            this.getDeploymentConfigDetails()
        }
    }

    getWfrId() {
        if (this.state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG) {
            return this.state.recentDeploymentConfig.wfrId
        }

        return this.state.selectedMaterial
            ? this.state.selectedMaterial.wfrId
            : this.props.material?.find((_mat) => _mat.isSelected)?.wfrId
    }

    getDeploymentConfigDetails() {
        this.setState({
            checkingDiff: true,
        })
        const { appId, pipelineId } = this.props
        Promise.allSettled([
            getRecentDeploymentConfig(appId, pipelineId),
            getLatestDeploymentConfig(appId, pipelineId),
            getSpecificDeploymentConfig(appId, pipelineId, this.getWfrId()),
        ]).then(
            ([recentDeploymentConfigRes, latestDeploymentConfigRes, specificDeploymentConfigRes]: {
                status: string
                value?: any
                reason?: any
            }[]) => {
                const _recentDeploymentConfig = processResolvedPromise(recentDeploymentConfigRes)
                const _specificDeploymentConfig = processResolvedPromise(specificDeploymentConfigRes)
                const _diffOptions = checkForDiff(_recentDeploymentConfig, _specificDeploymentConfig)

                this.setState({
                    recentDeploymentConfig: _recentDeploymentConfig,
                    latestDeploymentConfig: processResolvedPromise(latestDeploymentConfigRes),
                    specificDeploymentConfig: _specificDeploymentConfig,
                    diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                    diffOptions: _diffOptions,
                    checkingDiff: false,
                })
            },
        )
    }

    async getSecurityModuleStatus(): Promise<void> {
        try {
            const { result } = await getModuleInfo(ModuleNameMap.SECURITY)
            if (result?.status === ModuleStatus.INSTALLED) {
                this.setState({ isSecurityModuleInstalled: true })
            }
        } catch (error) {}
    }

    renderGitMaterialInfo(matInfo) {
        return (
            <>
                {matInfo.map((mat) => {
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
                        <div className="bcn-0 pt-12 br-4 pb-12 en-2 bw-1 m-12">
                            <GitCommitInfoGeneric
                                materialUrl={mat.url}
                                showMaterialInfo={false}
                                commitInfo={_gitCommit}
                                materialSourceType={''}
                                selectedCommitInfo={''}
                                materialSourceValue={''}
                            />
                        </div>
                    )
                })}
            </>
        )
    }

    renderVulnerabilities(mat) {
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

    renderSequentialCDCardTitle = (mat) => {
        if (this.props.stageType !== STAGE_TYPE.CD) return

        if (mat.latest && mat.runningOnParentCd) {
            return (
                <div className="bcv-1 pt-6 pb-6 pl-16 pr-16 br-4">
                    <span className="cn-9 fw-6">Deployed on</span>&nbsp;
                    <span className="cv-5 fw-6">
                        {this.props.parentEnvironmentName}
                        {this.props.parentEnvironmentName ? (
                            <>
                                <span className="cn-9 fw-4 dc__italic-font-style">&nbsp;and&nbsp;</span>
                                {this.props.envName}
                            </>
                        ) : (
                            ''
                        )}
                    </span>
                </div>
            )
        } else if (mat.latest) {
            return (
                <div className="bcv-1 pt-6 pb-6 pl-16 pr-16 br-4">
                    <span className="cn-9 fw-6">Deployed on </span>
                    <span className="cv-5 fw-6">{this.props.envName} </span>
                </div>
            )
        } else if (mat.runningOnParentCd) {
            return (
                <div className="bcv-1 pt-6 pb-6 pl-16 pr-16 br-4">
                    <span className="cn-9 fw-6">Deployed on </span>
                    <span className="cv-5 fw-6">{this.props.parentEnvironmentName}</span>
                </div>
            )
        }
    }

    async handleImageSelection(index: number, selectedMaterial: CDMaterialType) {
        this.props.selectImage(index, this.props.materialType)

        if (this.state.isRollbackTrigger && this.state.selectedMaterial?.wfrId !== selectedMaterial.wfrId) {
            this.setState({
                selectedMaterial,
                checkingDiff: true,
            })

            try {
                const { result } = await getSpecificDeploymentConfig(
                    this.props.appId,
                    this.props.pipelineId,
                    selectedMaterial.wfrId,
                )
                if (result) {
                    const _specificDeploymentConfig = processResolvedPromise({
                        status: 'fulfilled',
                        value: {
                            result,
                        },
                    })
                    const _diffOptions = checkForDiff(this.state.recentDeploymentConfig, _specificDeploymentConfig)
                    this.setState({
                        specificDeploymentConfig: _specificDeploymentConfig,
                        diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                        diffOptions: _diffOptions,
                    })
                }
            } catch (error) {
                showError(error)
            } finally {
                this.setState({
                    checkingDiff: false,
                })
            }
        }
    }

    renderMaterialInfo(mat: CDMaterialType, hideSelector?: boolean) {
        return (
            <>
                <div className="flex left column">
                    <div className="commit-hash commit-hash--docker">
                        <img src={docker} alt="" className="commit-hash__icon" />
                        {mat.image}
                    </div>
                    {this.props.stageType !== STAGE_TYPE.CD && mat.latest && (
                        <span className="last-deployed-status">Last Run</span>
                    )}
                </div>
                {this.props.materialType === MATERIAL_TYPE.none ? (
                    <div />
                ) : (
                    <div className="material-history__info flex left fs-13">
                        <DeployIcon className="icon-dim-16 scn-6 mr-8" />
                        <span className="fs-13 fw-4">{mat.deployedTime}</span>
                    </div>
                )}
                {!!mat.deployedBy && this.state.isRollbackTrigger ? (
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

    renderMaterial() {
        const materialList =
            this.state.isRollbackTrigger && this.state.showOlderImages ? [this.props.material[0]] : this.props.material
        return materialList.map((mat, index) => {
            return (
                <div
                    key={`material-history-${index}`}
                    className={`material-history material-history--cd ${
                        mat.isSelected ? 'material-history-selected' : ''
                    }`}
                >
                    {this.renderSequentialCDCardTitle(mat)}
                    <div
                        className={`material-history__top mh-66 ${
                            !this.state.isSecurityModuleInstalled && mat.showSourceInfo ? 'dc__border-bottom' : ''
                        }`}
                        style={{ cursor: `${mat.vulnerable ? 'not-allowed' : mat.isSelected ? 'default' : 'pointer'}` }}
                        onClick={(event) => {
                            event.stopPropagation()
                            if (!mat.vulnerable) {
                                this.handleImageSelection(index, mat)
                            }
                        }}
                    >
                        {this.renderMaterialInfo(mat)}
                    </div>
                    {mat.showSourceInfo && (
                        <>
                            {this.state.isSecurityModuleInstalled && !this.props.hideInfoTabsContainer && (
                                <ul className="tab-list tab-list--vulnerability">
                                    <li className="tab-list__tab">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                this.props.changeTab(index, Number(mat.id), CDModalTab.Changes)
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
                                                this.props.changeTab(index, Number(mat.id), CDModalTab.Security)
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
                                ? this.renderGitMaterialInfo(mat.materialInfo)
                                : this.renderVulnerabilities(mat)}
                        </>
                    )}
                    <button
                        type="button"
                        className="material-history__changes-btn"
                        onClick={(event) => {
                            event.stopPropagation()
                            this.props.toggleSourceInfo(index)
                        }}
                    >
                        {mat.showSourceInfo ? 'Hide Source Info' : 'Show Source Info'}
                        <img
                            src={arrow}
                            alt=""
                            style={{ transform: `${mat.showSourceInfo ? 'rotate(-180deg)' : ''}` }}
                        />
                    </button>
                </div>
            )
        })
    }

    renderCDModalHeader(): JSX.Element | string {
        const _stageType = this.state.isRollbackTrigger ? STAGE_TYPE.ROLLBACK : this.props.stageType
        switch (_stageType) {
            case STAGE_TYPE.PRECD:
                return 'Pre Deployment'
            case STAGE_TYPE.CD:
                return (
                    <>
                        Deploy to <span className="fw-6">{this.props.envName}</span>
                    </>
                )
            case STAGE_TYPE.POSTCD:
                return 'Post Deployment'
            case STAGE_TYPE.ROLLBACK:
                return (
                    <>
                        Rollback for <span className="fw-6">{this.props.envName}</span>
                    </>
                )
            default:
                return ''
        }
    }

    reviewConfig() {
        if (this.canReviewConfig()) {
            this.setState((prevState) => ({
                showConfigDiffView: !prevState.showConfigDiffView,
            }))
        }
    }

    isConfigPresent() {
        return (
            (this.state.selectedConfigToDeploy.value === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                this.state.specificDeploymentConfig?.deploymentTemplate &&
                this.state.specificDeploymentConfig.pipelineStrategy) ||
            (this.state.selectedConfigToDeploy.value === DeploymentWithConfigType.LAST_SAVED_CONFIG &&
                this.state.latestDeploymentConfig?.deploymentTemplate &&
                this.state.latestDeploymentConfig.pipelineStrategy)
        )
    }

    canReviewConfig() {
        return (
            this.state.recentDeploymentConfig?.deploymentTemplate &&
            this.state.recentDeploymentConfig.pipelineStrategy &&
            (this.state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG ||
                this.isConfigPresent())
        )
    }

    canDeployWithConfig() {
        return (
            (this.state.selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
                this.state.recentDeploymentConfig?.deploymentTemplate &&
                this.state.recentDeploymentConfig.pipelineStrategy) ||
            this.isConfigPresent()
        )
    }

    formatOptionLabel(option) {
        return (
            <div className="flex left column w-100">
                <span className="dc__ellipsis-right">{option.label}</span>
                <small className="cn-6">{option.infoText}</small>
                <div className="dc__border-bottom" />
            </div>
        )
    }

    customValueContainer(props) {
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

    renderConfigDiffStatus() {
        const _canReviewConfig = this.canReviewConfig()
        const statusColorClasses = this.state.checkingDiff
            ? 'cn-0 bcb-5'
            : !_canReviewConfig
            ? 'cn-9 bcn-1 cursor-not-allowed'
            : this.state.diffFound
            ? 'cn-0 bcr-5'
            : 'cn-0 bcg-5'
        return (
            <div
                className={`trigger-modal__config-diff-status flex pt-7 pb-7 pl-16 pr-16 dc__right-radius-4 ${
                    _canReviewConfig ? 'cursor' : 'config-not-found'
                }`}
                onClick={this.reviewConfig}
            >
                <div
                    className={`flex pt-3 pb-3 pl-12 pr-12 dc__border-radius-24 fs-12 fw-6 lh-20 ${statusColorClasses}`}
                >
                    {this.state.checkingDiff ? (
                        <>
                            Checking diff&nbsp;
                            <Progressing
                                size={16}
                                styles={{
                                    width: 'auto',
                                }}
                            />
                        </>
                    ) : !_canReviewConfig ? (
                        <>
                            <WarningIcon className="no-config-found-icon icon-dim-16" />
                            &nbsp; Config not available
                        </>
                    ) : this.state.diffFound ? (
                        <>
                            <WarningIcon className="config-diff-found-icon icon-dim-16" />
                            &nbsp; <span className="config-diff-status">Config diff</span>
                        </>
                    ) : (
                        <span className="config-diff-status">No config diff</span>
                    )}
                </div>
                {!this.state.checkingDiff && _canReviewConfig && (
                    <span className="dc__uppercase cb-5 pointer ml-12">REVIEW</span>
                )}
            </div>
        )
    }

    isDeployButtonDisabled() {
        const selectedImage = this.props.material.find((artifact) => artifact.isSelected)
        return (
            !selectedImage || (this.state.isRollbackTrigger && (this.state.checkingDiff || !this.canDeployWithConfig()))
        )
    }

    getTippyContent() {
        return (
            <>
                <h2 className="fs-12 fw-6 lh-18 m-0">Selected Config not available!</h2>
                <p className="fs-12 fw-4 lh-18 m-0">
                    {this.state.selectedConfigToDeploy.value === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                    (!this.state.specificDeploymentConfig ||
                        !this.state.specificDeploymentConfig.deploymentTemplate ||
                        !this.state.specificDeploymentConfig.pipelineStrategy)
                        ? 'Please select a different image or configuration to deploy'
                        : 'Please select a different configuration to deploy'}
                </p>
            </>
        )
    }

    renderTriggerModalCTA() {
        const buttonLabel = CDButtonLabelMap[this.props.stageType]

        return (
            <div
                className={`trigger-modal__trigger ${
                    !this.state.isRollbackTrigger || this.state.showConfigDiffView ? 'flex right' : ''
                }`}
            >
                {this.state.isRollbackTrigger && !this.state.showConfigDiffView && (
                    <div className="flex left dc__border br-4 h-42">
                        <div className="flex">
                            <ReactSelect
                                options={getDeployConfigOptions()}
                                components={{
                                    IndicatorSeparator: null,
                                    DropdownIndicator,
                                    Option,
                                    ValueContainer: this.customValueContainer,
                                }}
                                isDisabled={this.state.checkingDiff}
                                isSearchable={false}
                                formatOptionLabel={this.formatOptionLabel}
                                classNamePrefix="deploy-config-select"
                                placeholder="Select Config"
                                menuPlacement="top"
                                value={this.state.selectedConfigToDeploy}
                                styles={getCommonConfigSelectStyles({
                                    valueContainer: (base, state) => ({
                                        ...base,
                                        minWidth: '135px',
                                        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                                    }),
                                })}
                                onChange={this.handleConfigSelection}
                            />
                        </div>
                        <span className="dc__border-left h-100" />
                        <ConditionalWrap
                            condition={!this.state.checkingDiff && this.isDeployButtonDisabled()}
                            wrap={(children) => (
                                <Tippy
                                    className="default-tt w-200"
                                    arrow={false}
                                    placement="top"
                                    content={this.getTippyContent()}
                                >
                                    {children}
                                </Tippy>
                            )}
                        >
                            {this.renderConfigDiffStatus()}
                        </ConditionalWrap>
                    </div>
                )}
                <ConditionalWrap
                    condition={!this.state.checkingDiff && this.isDeployButtonDisabled()}
                    wrap={(children) => (
                        <Tippy
                            className="default-tt w-200"
                            arrow={false}
                            placement="top"
                            content={this.getTippyContent()}
                        >
                            {children}
                        </Tippy>
                    )}
                >
                    <button
                        className={`cta flex h-36 ${this.isDeployButtonDisabled() ? 'disabled-opacity' : ''}`}
                        onClick={this.deployTrigger}
                    >
                        {this.props.isLoading ? (
                            <Progressing />
                        ) : (
                            <>
                                {this.props.stageType === STAGE_TYPE.CD ? (
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

    handleConfigSelection(selected) {
        if (selected.value !== this.state.selectedConfigToDeploy.value) {
            const _diffOptions = checkForDiff(
                this.state.recentDeploymentConfig,
                this.getBaseTemplateConfiguration(selected),
            )
            this.setState({
                selectedConfigToDeploy: selected,
                diffFound: _diffOptions && Object.values(_diffOptions).some((d) => d),
                diffOptions: _diffOptions,
            })
        }
    }

    deployTrigger(e) {
        e.stopPropagation()

        // Blocking the deploy action if already deploying or config is not available
        if (this.props.isLoading || this.isDeployButtonDisabled()) {
            return
        }

        if (this.state.isRollbackTrigger) {
            this.props.triggerDeploy(this.props.stageType, this.state.selectedConfigToDeploy?.value, this.getWfrId())
        } else {
            this.props.triggerDeploy(this.props.stageType)
        }
    }

    getBaseTemplateConfiguration(selected = null) {
        const selectedConfig = selected?.value || this.state.selectedConfigToDeploy.value
        return selectedConfig === DeploymentWithConfigType.LAST_SAVED_CONFIG
            ? this.state.latestDeploymentConfig
            : selectedConfig === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG
            ? this.state.recentDeploymentConfig
            : this.state.specificDeploymentConfig
    }

    handleOlderImagesLoading(loadingMore: boolean, noMoreImages?: boolean) {
        this.setState({
            loadingMore,
            noMoreImages,
        })
    }

    loadOlderImages() {
        if (this.props.onClickRollbackMaterial && !this.state.loadingMore) {
            if (this.props.material.length > 19) {
                this.props.onClickRollbackMaterial(
                    this.props.pipelineId,
                    this.props.material.length + 1,
                    20,
                    this.handleOlderImagesLoading,
                )
                this.setState({
                    showOlderImages: false,
                    loadingMore: true,
                })
            } else {
                this.setState({
                    showOlderImages: false,
                    noMoreImages: true,
                })
            }
        }
    }

    isConfigAvailable(optionValue: string) {
        if (
            (optionValue === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                (!this.state.specificDeploymentConfig?.deploymentTemplate ||
                    !this.state.specificDeploymentConfig.pipelineStrategy)) ||
            (optionValue === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG &&
                (!this.state.recentDeploymentConfig?.deploymentTemplate ||
                    !this.state.recentDeploymentConfig.pipelineStrategy)) ||
            (optionValue === DeploymentWithConfigType.LAST_SAVED_CONFIG &&
                (!this.state.latestDeploymentConfig?.deploymentTemplate ||
                    !this.state.latestDeploymentConfig.pipelineStrategy))
        ) {
            return false
        }

        return true
    }

    renderCDModal() {
        return (
            <>
                <div className="trigger-modal__header">
                    {this.state.showConfigDiffView ? (
                        <div className="flex left">
                            <button type="button" className="dc__transparent icon-dim-24" onClick={this.reviewConfig}>
                                <BackIcon />
                            </button>
                            <div className="flex column left ml-16">
                                <h1 className="modal__title mb-8">{this.renderCDModalHeader()}</h1>
                                {this.state.selectedMaterial && (
                                    <div className="flex left dc__column-gap-24">
                                        {this.renderMaterialInfo(this.state.selectedMaterial, true)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <h1 className="modal__title">{this.renderCDModalHeader()}</h1>
                    )}
                    <button type="button" className="dc__transparent" onClick={this.props.closeCDModal}>
                        <img alt="close" src={close} />
                    </button>
                </div>
                <div
                    className={`trigger-modal__body ${
                        this.state.showConfigDiffView && this.canReviewConfig() ? 'p-0' : ''
                    }`}
                    style={{
                        height: this.state.showConfigDiffView ? 'calc(100vh - 141px)' : 'calc(100vh - 116px)',
                    }}
                >
                    {this.state.showConfigDiffView && this.canReviewConfig() ? (
                        <TriggerViewConfigDiff
                            currentConfiguration={this.state.recentDeploymentConfig}
                            baseTemplateConfiguration={this.getBaseTemplateConfiguration()}
                            selectedConfigToDeploy={this.state.selectedConfigToDeploy}
                            handleConfigSelection={this.handleConfigSelection}
                            isConfigAvailable={this.isConfigAvailable}
                            diffOptions={this.state.diffOptions}
                        />
                    ) : (
                        <>
                            <div className="material-list__title pb-16">
                                {this.state.isRollbackTrigger
                                    ? 'Select from previously deployed images'
                                    : 'Select Image'}
                            </div>
                            {this.renderMaterial()}
                            {this.state.isRollbackTrigger &&
                                !this.state.noMoreImages &&
                                this.props.material.length !== 1 && (
                                    <button
                                        className="show-older-images-cta cta ghosted flex h-32"
                                        onClick={this.loadOlderImages}
                                    >
                                        {this.state.loadingMore ? (
                                            <Progressing styles={{ height: '32px' }} />
                                        ) : (
                                            'Show older images'
                                        )}
                                    </button>
                                )}
                        </>
                    )}
                </div>
                {this.renderTriggerModalCTA()}
            </>
        )
    }

    stopPropagationOnClick(e) {
        e.stopPropagation()
    }

    render() {
        return (
            <VisibleModal
                className=""
                parentClassName={this.state.isRollbackTrigger ? 'dc__overflow-hidden' : ''}
                close={this.props.closeCDModal}
            >
                <div
                    className={`modal-body--cd-material h-100 ${
                        this.state.isRollbackTrigger ? 'contains-diff-view' : ''
                    } ${this.props.material.length > 0 ? '' : 'no-material'}`}
                    onClick={this.stopPropagationOnClick}
                >
                    {this.props.material.length > 0 ? (
                        this.renderCDModal()
                    ) : (
                        <>
                            <div className="trigger-modal__header">
                                <h1 className="modal__title">{this.renderCDModalHeader()}</h1>
                                <button type="button" className="dc__transparent" onClick={this.props.closeCDModal}>
                                    <img alt="close" src={close} />
                                </button>
                            </div>
                            <EmptyStateCdMaterial materialType={this.props.materialType} />
                        </>
                    )}
                </div>
            </VisibleModal>
        )
    }
}
