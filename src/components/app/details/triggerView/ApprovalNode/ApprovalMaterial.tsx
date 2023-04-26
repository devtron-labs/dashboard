import React, { useContext, useState } from 'react'
import { CDModalTab } from '../../../service'
import { getLoginInfo, noop, ScanVulnerabilitiesTable, useAsync } from '../../../../common'
import { getModuleInfo } from '../../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleNameMap, TriggerTypeMap } from '../../../../../config'
import { ModuleStatus } from '../../../../v2/devtronStackManager/DevtronStackManager.type'
import { ReactComponent as World } from '../../../../../assets/icons/ic-world.svg'
import { ReactComponent as Failed } from '../../../../../assets/icons/ic-rocket-fail.svg'
import { ReactComponent as DeployIcon } from '../../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as ApprovalChecks } from '../../../../../assets/icons/ic-checks.svg'
import arrow from '../../../../../assets/icons/misc/arrow-chevron-down-black.svg'
import docker from '../../../../../assets/icons/misc/docker.svg'
import { CDMaterialType, CDModalTabType, DeploymentNodeType, MaterialInfo } from '../types'
import { GitTriggers } from '../../cicdHistory/types'
import GitCommitInfoGeneric from '../../../../common/GitCommitInfoGeneric'
import { Progressing, showError, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { submitApprovalRequest } from './Service'
import { TriggerViewContext } from '../config'
import Tippy from '@tippyjs/react'
import { toast } from 'react-toastify'
import { ApprovedTippyContent } from './ApprovalMaterial.component'
import {
    APPROVAL_ACTION_TYPE,
    APPROVAL_CTA_TEXT,
    APPROVAL_REQUEST_TOAST_MSG,
    APPROVAL_RUNTIME_STATE,
} from './Constants'
import { ApprovalMaterialProps, ApprovalRequestType } from './Types'
import { ARTIFACT_STATUS } from '../Constants'

export default function ApprovalMaterial({
    material,
    envName,
    stageType,
    changeTab,
    toggleSourceInfo,
    appId,
    pipelineId,
    parentEnvironmentName,
    node,
    selectedTabIndex,
}: ApprovalMaterialProps) {
    const { onClickCDMaterial } = useContext(TriggerViewContext)
    const [tippyVisible, setTippyVisible] = useState<Record<string, boolean>>({})
    const [requestInProgress, setRequestInProgress] = useState(false)
    const loginInfo = getLoginInfo()
    const email: string = loginInfo ? loginInfo['email'] || loginInfo['sub'] : ''
    const [, securityModuleRes] = useAsync(() => getModuleInfo(ModuleNameMap.SECURITY), [])
    const isSecurityModuleInstalled = securityModuleRes?.status === ModuleStatus.INSTALLED

    const renderActiveEnv = (envName: string) => {
        return (
            <span className="bcg-1 br-4 eg-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                <div className="fw-4 fs-11 lh-16 flex">
                    <World className="icon-dim-16 mr-4 scg-5" />
                    Active on <span className="fw-6 ml-4">{envName} </span>
                </div>
            </span>
        )
    }

    const renderActiveCD = (mat) => {
        return (
            <>
                {mat.latest && renderActiveEnv(envName)}
                {mat.runningOnParentCd && renderActiveEnv(parentEnvironmentName)}
            </>
        )
    }

    const renderFailedCD = () => {
        return (
            <span className="bcr-1 br-4 er-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                <div className="fw-4 fs-11 lh-16 flex">
                    <Failed className="icon-dim-16 mr-4" />
                    Last deployment failed on <span className="fw-6 ml-4">{envName} </span>
                </div>
            </span>
        )
    }

    const renderProgressingCD = () => {
        return (
            <span className="bcy-1 br-4 ey-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                <div className="fw-4 fs-11 lh-16 flex">
                    <div className={`dc__app-summary__icon icon-dim-16 mr-6 progressing progressing--node`}></div>
                    Deploying on <span className="fw-6 ml-4">{envName} </span>
                </div>
            </span>
        )
    }

    const renderSequentialCDCardTitle = (mat) => {
        if (
            mat.latest ||
            mat.runningOnParentCd ||
            mat.artifactStatus === ARTIFACT_STATUS.Progressing ||
            mat.artifactStatus === ARTIFACT_STATUS.Degraded ||
            mat.artifactStatus === ARTIFACT_STATUS.Failed
        ) {
            return (
                <div className="bcn-0 p-8 br-4 dc__border-bottom flex left">
                    {renderActiveCD(mat)}
                    {mat.artifactStatus === ARTIFACT_STATUS.Progressing && renderProgressingCD()}
                    {(mat.artifactStatus === ARTIFACT_STATUS.Degraded ||
                        mat.artifactStatus === ARTIFACT_STATUS.Failed) &&
                        renderFailedCD()}
                </div>
            )
        }
    }

    const approvalRequest = (e: any, noConfirmation?: boolean) => {
        setRequestInProgress(true)
        const requestType = e.currentTarget.dataset.requestType as ApprovalRequestType
        const payload = {
            appId: +appId,
            actionType: APPROVAL_ACTION_TYPE[requestType.toLowerCase()],
            pipelineId: +pipelineId,
            artifactId: +e.currentTarget.dataset.id,
            approvalRequestId: requestType === ApprovalRequestType.SUBMIT ? 0 : +e.currentTarget.dataset.requestId,
        }
        submitApprovalRequest(payload)
            .then((response) => {
                toast.success(
                    requestType === ApprovalRequestType.APPROVE && node?.triggerType === TriggerTypeMap.automatic
                        ? APPROVAL_REQUEST_TOAST_MSG[`${requestType.toLowerCase()}_auto_cd`]
                        : APPROVAL_REQUEST_TOAST_MSG[requestType.toLowerCase()],
                )
                if (!noConfirmation) {
                    toggleTippyVisibility(e)
                }
                onClickCDMaterial(pipelineId, DeploymentNodeType.CD, true)
            })
            .catch((e) => {
                showError(e)
            })
            .finally(() => {
                setRequestInProgress(false)
            })
    }

    const getRequestButtonTestId = (approvalRequestType: ApprovalRequestType) => {
        const testId = APPROVAL_CTA_TEXT[approvalRequestType.toLowerCase()].toLowerCase().split(' ').join('-')
        if (approvalRequestType === ApprovalRequestType.SUBMIT) {
            return `${testId}-approval`
        }
        return `submit-${testId}`
    }

    const getRequestButton = (mat: CDMaterialType, approvalRequestType: ApprovalRequestType) => {
        const _className = `cta flex mt-4 ml-auto mr-16 mb-16 ${
            approvalRequestType === ApprovalRequestType.CANCEL ? 'delete' : ''
        }`
        const _style =
            approvalRequestType === ApprovalRequestType.APPROVE
                ? {
                      background: 'var(--G500)',
                  }
                : {}

        return (
            <button
                className={_className}
                data-id={mat.id}
                data-request-id={mat.userApprovalMetadata?.approvalRequestId}
                data-request-type={approvalRequestType}
                data-testid={getRequestButtonTestId(approvalRequestType)}
                onClick={requestInProgress ? noop : approvalRequest}
                style={_style}
            >
                {requestInProgress ? <Progressing size={24} /> : APPROVAL_CTA_TEXT[approvalRequestType.toLowerCase()]}
            </button>
        )
    }

    const toggleTippyVisibility = (e) => {
        const dataId = (e.currentTarget ?? e.target)?.dataset?.id
        if (dataId) {
            setTippyVisible((prevState) => ({
                ...prevState,
                [dataId]: !prevState[dataId],
            }))
        }
    }

    const handleOnClose = (id: string) => {
        if (requestInProgress) return
        setTippyVisible((prevState) => ({
            ...prevState,
            [id]: false,
        }))
    }

    const getApprovalCTA = (mat: CDMaterialType) => {
        const userId = node?.requestedUserId
        const requestedUserId = mat.userApprovalMetadata?.requestedUserData?.userId
        const isApprover = node.approvalUsers?.includes(email)

        if (mat.userApprovalMetadata?.approvalRuntimeState === APPROVAL_RUNTIME_STATE.requested) {
            if (requestedUserId !== userId && mat.triggeredBy === userId) {
                return (
                    <Tippy
                        className="default-tt w-200"
                        arrow={false}
                        placement="top"
                        content="You triggered the build pipeline for this image. The builder of an image cannot approve it."
                    >
                        <span className="cb-5 dc__opacity-0_5 cursor-default" data-testid="builder-approve-disabled">
                            Approve
                        </span>
                    </Tippy>
                )
            } else if (mat.userApprovalMetadata.approvedUsersData?.some((userData) => userData.userId === userId)) {
                return (
                    <span className="cg-5 cursor-default" data-testid="approved-by-you">
                        Approved by you
                    </span>
                )
            } else if (requestedUserId && userId && requestedUserId === userId) {
                return (
                    <TippyCustomized
                        theme={TippyTheme.white}
                        className="w-300 h-100 dc__align-left"
                        placement="bottom-end"
                        iconClass="fcv-5"
                        heading="Cancel approval request"
                        infoText="Are you sure you want to cancel approval request for this image? A new approval request would need to be raised if you want to deploy this image."
                        additionalContent={getRequestButton(mat, ApprovalRequestType.CANCEL)}
                        showCloseButton={true}
                        onClose={() => handleOnClose(mat.id)}
                        trigger="click"
                        interactive={true}
                        visible={tippyVisible[mat.id]}
                    >
                        <span
                            className="cr-5"
                            data-id={mat.id}
                            onClick={toggleTippyVisibility}
                            data-testid="cancel-request"
                        >
                            Cancel request
                        </span>
                    </TippyCustomized>
                )
            } else if (isApprover && requestedUserId !== userId) {
                return (
                    <TippyCustomized
                        theme={TippyTheme.white}
                        className="w-300 h-100 dc__align-left"
                        placement="bottom-end"
                        iconClass="fcv-5"
                        heading="Approve image"
                        infoText="Are you sure you want to approve deploying this image to cd-devtroncd?"
                        additionalContent={getRequestButton(mat, ApprovalRequestType.APPROVE)}
                        showCloseButton={true}
                        onClose={() => handleOnClose(mat.id)}
                        trigger="click"
                        interactive={true}
                        visible={tippyVisible[mat.id]}
                    >
                        <span
                            className="cg-5"
                            data-id={mat.id}
                            onClick={toggleTippyVisibility}
                            data-testid="approve-request"
                        >
                            Approve
                        </span>
                    </TippyCustomized>
                )
            } else {
                return (
                    <span className="cn-5 cursor-default" data-testid="awaiting-approval">
                        Awaiting approval
                    </span>
                )
            }
        } else {
            return (
                <TippyCustomized
                    theme={TippyTheme.white}
                    className="w-300 h-100 dc__align-left"
                    placement="bottom-end"
                    iconClass="fcv-5"
                    heading="Request approval"
                    infoText="Request approval for deploying this image. All users having ‘Approver’ permission for this application and environment can approve."
                    additionalContent={getRequestButton(mat, ApprovalRequestType.SUBMIT)}
                    showCloseButton={true}
                    onClose={() => handleOnClose(mat.id)}
                    trigger="click"
                    interactive={true}
                    visible={tippyVisible[mat.id]}
                >
                    <span
                        className="cb-5"
                        data-id={mat.id}
                        onClick={toggleTippyVisibility}
                        data-testid="request-approval"
                    >
                        Request approval
                    </span>
                </TippyCustomized>
            )
        }
    }

    const renderMaterialInfo = (mat: CDMaterialType, hideSelector?: boolean) => {
        const numOfApprovalsText = `${mat.userApprovalMetadata?.approvedUsersData?.length ?? 0}/${
            node?.userApprovalConfig?.requiredCount ?? 0
        } Approvals`

        return (
            <>
                <div className="flex left column">
                    <div className="commit-hash commit-hash--docker">
                        <img src={docker} alt="" className="commit-hash__icon" />
                        {mat.image}
                    </div>
                </div>
                {selectedTabIndex === 1 && (
                    <TippyCustomized
                        theme={TippyTheme.white}
                        className="w-300 h-100"
                        placement="top-start"
                        Icon={ApprovalChecks}
                        heading={numOfApprovalsText}
                        additionalContent={
                            <ApprovedTippyContent
                                matId={mat.id}
                                requestedUserId={node?.requestedUserId}
                                userApprovalMetadata={mat.userApprovalMetadata}
                                cancelRequest={approvalRequest}
                                requestInProgress={requestInProgress}
                            />
                        }
                        showCloseButton={true}
                        trigger="click"
                        interactive={true}
                    >
                        <div className="flex left cursor" data-testid="num-of-approvals-check">
                            <ApprovalChecks className="icon-dim-16 scn-6 mr-8" />
                            <span className="fs-13 fw-4">{numOfApprovalsText}</span>
                        </div>
                    </TippyCustomized>
                )}
                {selectedTabIndex === 0 && mat.deployedTime && (
                    <div className="material-history__info flex left">
                        <DeployIcon className="icon-dim-16 scn-6 mr-8" />
                        <span className="fs-13 fw-4">{mat.deployedTime}</span>
                    </div>
                )}
                <div />
                {!hideSelector && (
                    <div className="material-history__select-text dc__no-text-transform w-auto">
                        {mat.vulnerable ? (
                            <span className="material-history__scan-error">Security vulnerability found</span>
                        ) : (
                            getApprovalCTA(mat)
                        )}
                    </div>
                )}
            </>
        )
    }

    const renderGitMaterialInfo = (matInfo: MaterialInfo[]) => {
        return (
            <>
                {matInfo.map((mat: MaterialInfo, index: number) => {
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
                                    index={index}
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

    const handleTabSwitch = (e: any): void => {
        e.stopPropagation()
        const { index, id, tab } = e.currentTarget.dataset
        changeTab(
            index,
            +id,
            tab,
            tab === CDModalTab.Changes
                ? {
                      id: pipelineId,
                      type: stageType,
                  }
                : null,
            appId,
        )
    }

    const handleSourceInfoToggle = (e) => {
        e.stopPropagation()
        toggleSourceInfo(+e.currentTarget.dataset.index, null)
    }

    return (
        <>
            {material.map((mat) => {
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
                    <div key={`material-history-${mat.index}`} className="material-history material-history--cd">
                        {renderSequentialCDCardTitle(mat)}
                        <div
                            className={`material-history__top mh-66 ${
                                !isSecurityModuleInstalled && mat.showSourceInfo ? 'dc__border-bottom' : ''
                            }`}
                            style={{
                                cursor: `${mat.vulnerable ? 'not-allowed' : mat.isSelected ? 'default' : 'pointer'}`,
                            }}
                        >
                            {renderMaterialInfo(mat)}
                        </div>
                        {mat.showSourceInfo && (
                            <>
                                {isSecurityModuleInstalled && (
                                    <ul className="tab-list tab-list--vulnerability">
                                        <li className="tab-list__tab">
                                            <button
                                                type="button"
                                                data-id={mat.id}
                                                data-index={mat.index}
                                                data-tab={CDModalTab.Changes}
                                                onClick={handleTabSwitch}
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
                                                data-id={mat.id}
                                                data-index={mat.index}
                                                data-tab={CDModalTab.Security}
                                                onClick={handleTabSwitch}
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
                                data-index={mat.index}
                                data-testid={mat.showSourceInfo ? 'collapse-show-info' : 'collapse-hide-info'}
                                onClick={handleSourceInfoToggle}
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
            })}
        </>
    )
}
