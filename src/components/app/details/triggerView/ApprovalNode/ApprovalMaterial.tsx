import React, { useContext, useState } from 'react'
import { CDModalTab } from '../../../service'
import { getLoginInfo, noop, ScanVulnerabilitiesTable, useAsync } from '../../../../common'
import { getModuleInfo } from '../../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleNameMap, TriggerTypeMap } from '../../../../../config'
import { ModuleStatus } from '../../../../v2/devtronStackManager/DevtronStackManager.type'
import { ReactComponent as DeployIcon } from '../../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as ApprovalChecks } from '../../../../../assets/icons/ic-checks.svg'
import { ReactComponent as CancelIcon } from '../../../../../assets/icons/ic-cross.svg'
import arrow from '../../../../../assets/icons/misc/arrow-chevron-down-black.svg'
import docker from '../../../../../assets/icons/misc/docker.svg'
import { CDMaterialType, DeploymentNodeType, MaterialInfo } from '../types'
import { GitTriggers } from '../../cicdHistory/types'
import GitCommitInfoGeneric from '../../../../common/GitCommitInfoGeneric'
import { Progressing, showError, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { submitApprovalRequest } from './Service'
import { TriggerViewContext } from '../config'
import Tippy from '@tippyjs/react'
import { toast } from 'react-toastify'
import { ApprovedTippyContent, DeploymentEnvState } from './ApprovalMaterial.component'
import {
    APPROVAL_ACTION_TYPE,
    APPROVAL_CTA_TEXT,
    APPROVAL_MODAL_CTA_TEXT,
    APPROVAL_REQUEST_TOAST_MSG,
    APPROVAL_RUNTIME_STATE,
    DEPLOYMENT_ENV_TEXT,
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
                    {mat.latest && <DeploymentEnvState envStateText={DEPLOYMENT_ENV_TEXT.active} envName={envName} />}
                    {mat.runningOnParentCd && (
                        <DeploymentEnvState envStateText={DEPLOYMENT_ENV_TEXT.active} envName={parentEnvironmentName} />
                    )}
                    {mat.artifactStatus === ARTIFACT_STATUS.Progressing && (
                        <DeploymentEnvState envStateText={DEPLOYMENT_ENV_TEXT.deploying} envName={envName} />
                    )}
                    {(mat.artifactStatus === ARTIFACT_STATUS.Degraded ||
                        mat.artifactStatus === ARTIFACT_STATUS.Failed) && (
                        <DeploymentEnvState envStateText={DEPLOYMENT_ENV_TEXT.failed} envName={envName} />
                    )}
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
        const _className = `cta flex h-32 mt-4 ml-auto mr-16 mb-16 ${
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
                        content={APPROVAL_MODAL_CTA_TEXT.imageBuilderTippy}
                    >
                        <span className="cb-5 dc__opacity-0_5 cursor-default" data-testid="builder-approve-disabled">
                            {APPROVAL_MODAL_CTA_TEXT.approveRequest.label}
                        </span>
                    </Tippy>
                )
            } else if (mat.userApprovalMetadata.approvedUsersData?.some((userData) => userData.userId === userId)) {
                return (
                    <span className="cg-5 cursor-default" data-testid="approved-by-you">
                        {APPROVAL_MODAL_CTA_TEXT.approvedByYou}
                    </span>
                )
            } else if (requestedUserId && userId && requestedUserId === userId) {
                return (
                    <TippyCustomized
                        theme={TippyTheme.white}
                        className="w-300 h-100 dc__align-left"
                        placement="bottom-end"
                        iconClass="fcv-5"
                        heading={APPROVAL_MODAL_CTA_TEXT.cancelRequest.heading}
                        infoText={APPROVAL_MODAL_CTA_TEXT.cancelRequest.infoText}
                        additionalContent={getRequestButton(mat, ApprovalRequestType.CANCEL)}
                        showCloseButton={true}
                        onClose={() => handleOnClose(mat.id)}
                        trigger="click"
                        interactive={true}
                        visible={tippyVisible[mat.id]}
                    >
                        <span
                            className="flex right dc_width-max-content ml-auto cr-5 cursor"
                            data-id={mat.id}
                            onClick={toggleTippyVisibility}
                            data-testid="cancel-request"
                        >
                            <CancelIcon className="icon-dim-16 fcr-5 scr-5 mr-4" />
                            {APPROVAL_MODAL_CTA_TEXT.cancelRequest.label}
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
                        heading={APPROVAL_MODAL_CTA_TEXT.approveRequest.heading}
                        infoText={`${APPROVAL_MODAL_CTA_TEXT.approveRequest.infoText} ${envName}?`}
                        additionalContent={getRequestButton(mat, ApprovalRequestType.APPROVE)}
                        showCloseButton={true}
                        onClose={() => handleOnClose(mat.id)}
                        trigger="click"
                        interactive={true}
                        visible={tippyVisible[mat.id]}
                    >
                        <span
                            className="cg-5 cursor"
                            data-id={mat.id}
                            onClick={toggleTippyVisibility}
                            data-testid="approve-request"
                        >
                            {APPROVAL_MODAL_CTA_TEXT.approveRequest.label}
                        </span>
                    </TippyCustomized>
                )
            } else {
                return (
                    <span className="cn-5 cursor-default" data-testid="awaiting-approval">
                        {APPROVAL_MODAL_CTA_TEXT.awaiting}
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
                    heading={APPROVAL_MODAL_CTA_TEXT.requestApproval.heading}
                    infoText={APPROVAL_MODAL_CTA_TEXT.requestApproval.infoText}
                    additionalContent={getRequestButton(mat, ApprovalRequestType.SUBMIT)}
                    showCloseButton={true}
                    onClose={() => handleOnClose(mat.id)}
                    trigger="click"
                    interactive={true}
                    visible={tippyVisible[mat.id]}
                >
                    <span
                        className="cb-5 cursor"
                        data-id={mat.id}
                        onClick={toggleTippyVisibility}
                        data-testid="request-approval"
                    >
                        {APPROVAL_MODAL_CTA_TEXT.requestApproval.label}
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
                    <div className="material-history__select-text fs-13 dc__no-text-transform w-auto cursor-default">
                        {mat.vulnerable ? (
                            <span className="material-history__scan-error">
                                {APPROVAL_MODAL_CTA_TEXT.vulnerability.found}
                            </span>
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
                    <p className="security-tab-empty__title">{APPROVAL_MODAL_CTA_TEXT.vulnerability.notScanned}</p>
                </div>
            )
        } else if (!mat.scanEnabled) {
            return (
                <div className="security-tab-empty">
                    <p className="security-tab-empty__title">{APPROVAL_MODAL_CTA_TEXT.vulnerability.scanDisabled}</p>
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
                    <p className="security-tab-empty__title">{APPROVAL_MODAL_CTA_TEXT.vulnerability.notFound}</p>
                    <p className="security-tab-empty__subtitle">{mat.lastExecution}</p>
                </div>
            )
        } else
            return (
                <div className="security-tab">
                    <p className="security-tab__last-scanned">
                        {APPROVAL_MODAL_CTA_TEXT.vulnerability.scanned}&nbsp;
                        {mat.lastExecution}
                    </p>
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
                            className={`material-history__top cursor-default mh-66 ${
                                !isSecurityModuleInstalled && mat.showSourceInfo ? 'dc__border-bottom' : ''
                            }`}
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
                                {mat.showSourceInfo
                                    ? APPROVAL_MODAL_CTA_TEXT.sourceInfo.hide
                                    : APPROVAL_MODAL_CTA_TEXT.sourceInfo.show}
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
