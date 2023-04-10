import React, { useContext, useState } from 'react'
import { CDModalTab } from '../../../service'
import { ButtonWithLoader, getAlphabetIcon, getLoginInfo, ScanVulnerabilitiesTable, useAsync } from '../../../../common'
import { getModuleInfo } from '../../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleNameMap } from '../../../../../config'
import { ModuleStatus } from '../../../../v2/devtronStackManager/DevtronStackManager.type'
import { ReactComponent as World } from '../../../../../assets/icons/ic-world.svg'
import { ReactComponent as Failed } from '../../../../../assets/icons/ic-rocket-fail.svg'
import { ReactComponent as DeployIcon } from '../../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as ApprovalChecks } from '../../../../../assets/icons/ic-checks.svg'
import arrow from '../../../../../assets/icons/misc/arrow-chevron-down-black.svg'
import docker from '../../../../../assets/icons/misc/docker.svg'
import { CDMaterialType, DeploymentNodeType, MaterialInfo, UserApprovalMetadataType } from '../types'
import { GitTriggers } from '../../cicdHistory/types'
import GitCommitInfoGeneric from '../../../../common/GitCommitInfoGeneric'
import { Progressing, showError, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { submitApprovalRequest } from './Service'
import { TriggerViewContext } from '../config'
import Tippy from '@tippyjs/react'
import { toast } from 'react-toastify'

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
}) {
    const { onClickCDMaterial } = useContext(TriggerViewContext)
    const [tippyVisible, setTippyVisible] = useState<Record<string, boolean>>({})
    const loginInfo = getLoginInfo()
    const email: string = loginInfo ? loginInfo['email'] || loginInfo['sub'] : ''
    const [, securityModuleRes] = useAsync(() => getModuleInfo(ModuleNameMap.SECURITY), [])
    const isSecurityModuleInstalled = securityModuleRes?.status === ModuleStatus.INSTALLED

    const renderActiveCD = (mat) => {
        return (
            <>
                {mat.latest && (
                    <span className="bcg-1 br-4 eg-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                        <div className="fw-4 fs-11 lh-16 flex">
                            <World className="icon-dim-16 mr-4 scg-5" />
                            Active on <span className="fw-6 ml-4">{envName} </span>
                        </div>
                    </span>
                )}
                {mat.runningOnParentCd && (
                    <span className="bcg-1 br-4 eg-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                        <div className="fw-4 fs-11 lh-16 flex">
                            <World className="icon-dim-16 mr-4 scg-5" />
                            Active on <span className="fw-6 ml-4">{parentEnvironmentName}</span>
                        </div>
                    </span>
                )}
            </>
        )
    }

    const renderFailedCD = (mat) => {
        return (
            <span className="bcr-1 br-4 er-2 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6">
                <div className="fw-4 fs-11 lh-16 flex">
                    <Failed className="icon-dim-16 mr-4" />
                    Last deployment failed on <span className="fw-6 ml-4">{envName} </span>
                </div>
            </span>
        )
    }

    const renderProgressingCD = (mat) => {
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

    const submitRequest = (e: any) => {
        toggleTippyVisibility(e)
        const payload = {
            actionType: 0,
            pipelineId: pipelineId,
            artifactId: +e.currentTarget.dataset.id,
            approvalRequestId: 0,
        }
        submitApprovalRequest(payload)
            .then((response) => {
                toast.success('Image approval request submitted')
                onClickCDMaterial(pipelineId, DeploymentNodeType.CD, true)
            })
            .catch((e) => {
                showError(e)
            })
    }

    const approveRequest = (e: any) => {
        toggleTippyVisibility(e)
        const payload = {
            actionType: 1,
            pipelineId: pipelineId,
            artifactId: +e.currentTarget.dataset.id,
            approvalRequestId: +e.currentTarget.dataset.requestId,
        }
        submitApprovalRequest(payload)
            .then((response) => {
                toast.success('Image approved')
                onClickCDMaterial(pipelineId, DeploymentNodeType.CD, true)
            })
            .catch((e) => {
                showError(e)
            })
    }

    const cancelRequest = (e: any, noConfirmation?: boolean) => {
        if (!noConfirmation) {
            toggleTippyVisibility(e)
        }

        const payload = {
            actionType: 2,
            pipelineId: pipelineId,
            artifactId: +e.currentTarget.dataset.id,
            approvalRequestId: +e.currentTarget.dataset.requestId,
        }
        submitApprovalRequest(payload)
            .then((response) => {
                toast.success('Image approval request cancelled')
                onClickCDMaterial(pipelineId, DeploymentNodeType.CD, true)
            })
            .catch((e) => {
                showError(e)
            })
    }

    const getCancelRequestButton = (mat: CDMaterialType) => {
        return (
            <button
                className="cta delete flex mt-4 ml-auto mr-16 mb-16"
                data-id={mat.id}
                data-request-id={mat.userApprovalMetadata?.approvalRequestId}
                onClick={cancelRequest}
            >
                Cancel request
            </button>
        )
    }

    const getApproveRequestButton = (mat: CDMaterialType) => {
        return (
            <button
                className="cta flex mt-4 ml-auto mr-16 mb-16"
                data-id={mat.id}
                data-request-id={mat.userApprovalMetadata?.approvalRequestId}
                onClick={approveRequest}
                style={{
                    background: 'var(--G500)',
                }}
            >
                Approve request
            </button>
        )
    }

    const getSubmitRequestButton = (artifactId: number) => {
        return (
            <button className="cta flex mt-4 ml-auto mr-16 mb-16" data-id={artifactId} onClick={submitRequest}>
                Submit request
            </button>
        )
    }

    const toggleTippyVisibility = (e) => {
        const dataId = e.currentTarget?.dataset?.id
        if (dataId) {
            setTippyVisible((prevState) => ({
                ...prevState,
                [dataId]: !prevState[dataId],
            }))
        }
    }

    const handleOnClose = (id: string) => {
        setTippyVisible((prevState) => ({
            ...prevState,
            [id]: false,
        }))
    }

    const getApprovalCTA = (mat: CDMaterialType) => {
        const userId = node?.requestedUserId
        const requestedUserId = mat.userApprovalMetadata?.requestedUserData?.userId
        const isApprover = node.approvalUsers?.includes(email)

        if (mat.userApprovalMetadata?.approvalRuntimeState === 1) {
            if (node?.artifactTriggeredBy === email) {
                return (
                    <Tippy
                        className="default-tt w-200"
                        arrow={false}
                        placement="top"
                        content="You triggered the build pipeline for this image. The builder of an image cannot approve it."
                    >
                        <span className="cb-5 dc__opacity-0_5 cursor-default">Approve</span>
                    </Tippy>
                )
            } else if (
                isApprover &&
                mat.userApprovalMetadata.approvedUsersData?.some((userData) => userData.userId === userId)
            ) {
                return <span className="cg-5 cursor-default">Approved by you</span>
            } else if (requestedUserId && userId && requestedUserId === userId) {
                return (
                    <TippyCustomized
                        theme={TippyTheme.white}
                        className="w-300 h-100 dc__align-left"
                        placement="bottom-end"
                        iconClass="fcv-5"
                        heading="Cancel approval request"
                        infoText="Are you sure you want to cancel approval request for this image? A new approval request would need to be raised if you want to deploy this image."
                        additionalContent={getCancelRequestButton(mat)}
                        showCloseButton={true}
                        onClose={() => handleOnClose(mat.id)}
                        trigger="click"
                        interactive={true}
                        visible={tippyVisible[mat.id]}
                    >
                        <span className="cr-5" data-id={mat.id} onClick={toggleTippyVisibility}>
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
                        additionalContent={getApproveRequestButton(mat)}
                        showCloseButton={true}
                        onClose={() => handleOnClose(mat.id)}
                        trigger="click"
                        interactive={true}
                        visible={tippyVisible[mat.id]}
                    >
                        <span className="cg-5" data-id={mat.id} onClick={toggleTippyVisibility}>
                            Approve
                        </span>
                    </TippyCustomized>
                )
            } else {
                return <span className="cn-5 cursor-default">Awaiting approval</span>
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
                    additionalContent={getSubmitRequestButton(+mat.id)}
                    showCloseButton={true}
                    onClose={() => handleOnClose(mat.id)}
                    trigger="click"
                    interactive={true}
                    visible={tippyVisible[mat.id]}
                >
                    <span className="cb-5" data-id={mat.id} onClick={toggleTippyVisibility}>
                        Request approval
                    </span>
                </TippyCustomized>
            )
        }
    }

    const getApprovedTippyContent = (matId: string, userApprovalMetadata: UserApprovalMetadataType) => {
        const requestedBySelf =
            userApprovalMetadata?.requestedUserData?.userId &&
            userApprovalMetadata.requestedUserData.userId === node?.requestedUserId
        const imageApproved = userApprovalMetadata?.approvedUsersData?.length > 0

        return (
            <div className={`pl-12 pr-12 dc__overflow-hidden ${imageApproved ? 'h-200' : 'h-132'}`}>
                <div className="pt-12 pb-12 h-100 dc__overflow-scroll">
                    <div>
                        <h5 className="fs-13 fw-6 lh-20 mt-0 mb-8">Approval requested by</h5>
                        <span className="flex left mb-8">
                            {getAlphabetIcon(userApprovalMetadata?.requestedUserData?.userEmail)}
                            {requestedBySelf ? 'You' : userApprovalMetadata?.requestedUserData?.userEmail}
                            {requestedBySelf && (
                                <span
                                    className="fs-13 fw-6 lh-20 cr-5 ml-auto cursor"
                                    data-id={matId}
                                    data-request-id={userApprovalMetadata?.approvalRequestId}
                                    onClick={(e) => cancelRequest(e, true)}
                                >
                                    Cancel
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="mt-12">
                        <h5 className="fs-13 fw-6 lh-20 mt-0 mb-8">Approved by</h5>
                        {imageApproved ? (
                            <ol className="p-0 dc__list-style-none">
                                {userApprovalMetadata.approvedUsersData.map((_approver) => {
                                    return (
                                        <li key={_approver.userEmail} className="flex left mb-8">
                                            {getAlphabetIcon(_approver.userEmail)}
                                            {_approver.userId === node?.requestedUserId ? 'You' : _approver.userEmail}
                                        </li>
                                    )
                                })}
                            </ol>
                        ) : (
                            <span className="fs-13 fw-4 lh-20 cn-7">This image has not received any approvals.</span>
                        )}
                    </div>
                </div>
            </div>
        )
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
                        additionalContent={getApprovedTippyContent(mat.id, mat.userApprovalMetadata)}
                        showCloseButton={true}
                        trigger="click"
                        interactive={true}
                    >
                        <div className="flex left cursor">
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

    const renderMaterial = () => {
        return material.map((mat) => {
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
                        style={{ cursor: `${mat.vulnerable ? 'not-allowed' : mat.isSelected ? 'default' : 'pointer'}` }}
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
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                changeTab(
                                                    mat.index,
                                                    Number(mat.id),
                                                    CDModalTab.Changes,
                                                    {
                                                        id: pipelineId,
                                                        type: stageType,
                                                    },
                                                    appId,
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
                                                changeTab(mat.index, Number(mat.id), CDModalTab.Security, null, appId)
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
                                toggleSourceInfo(mat.index, null)
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

    return renderMaterial()
}
