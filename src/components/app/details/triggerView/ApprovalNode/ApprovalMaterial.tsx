import React, { useContext, useState } from 'react'
import { CDModalTab } from '../../../service'
import { ButtonWithLoader, ScanVulnerabilitiesTable, useAsync } from '../../../../common'
import { getModuleInfo } from '../../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleNameMap } from '../../../../../config'
import { ModuleStatus } from '../../../../v2/devtronStackManager/DevtronStackManager.type'
import { ReactComponent as World } from '../../../../../assets/icons/ic-world.svg'
import { ReactComponent as Failed } from '../../../../../assets/icons/ic-rocket-fail.svg'
import { ReactComponent as DeployIcon } from '../../../../../assets/icons/ic-nav-rocket.svg'
import arrow from '../../../../../assets/icons/misc/arrow-chevron-down-black.svg'
import docker from '../../../../../assets/icons/misc/docker.svg'
import { CDMaterialType, DeploymentNodeType, MaterialInfo } from '../types'
import { GitTriggers } from '../../cicdHistory/types'
import GitCommitInfoGeneric from '../../../../common/GitCommitInfoGeneric'
import { Progressing, showError, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { submitApprovalRequest } from './Service'
import { TriggerViewContext } from '../config'

export default function ApprovalMaterial({
    material,
    materialType,
    envName,
    stageType,
    changeTab,
    selectImage,
    toggleSourceInfo,
    appId,
    pipelineId,
    parentEnvironmentName,
}) {
    const { onClickCDMaterial } = useContext(TriggerViewContext)
    const [selectedMaterial, setSelectedMaterial] = useState<CDMaterialType>()
    const [tippyVisible, setTippyVisible] = useState<Record<string, boolean>>({})
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

    const handleImageSelection = async (index: number, currentSelectedMaterial: CDMaterialType) => {
        selectImage(index, materialType, null)
        if (selectedMaterial?.image !== currentSelectedMaterial.image) {
            setSelectedMaterial(selectedMaterial)
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
                onClickCDMaterial(pipelineId, DeploymentNodeType.CD, true)
            })
            .catch((e) => {
                showError(e)
            })
    }

    const cancelRequest = (e: any) => {
        toggleTippyVisibility(e)
        const payload = {
            actionType: 2,
            pipelineId: pipelineId,
            artifactId: +e.currentTarget.dataset.id,
            approvalRequestId: +e.currentTarget.dataset.requestId,
        }
        submitApprovalRequest(payload)
            .then((response) => {
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

    const getSubmitRequestButton = (artifactId: number) => {
        return (
            <button className="cta flex mt-4 ml-auto mr-16 mb-16" data-id={artifactId} onClick={submitRequest}>
                Submit request
            </button>
        )
    }

    const toggleTippyVisibility = (e) => {
        if (e.currentTarget?.dataset?.id) {
            setTippyVisible((prevState) => ({
                ...prevState,
                [e.currentTarget.dataset.id]: !prevState[e.currentTarget.dataset.id],
            }))
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
                </div>
                {mat.deployedTime && (
                    <div className="material-history__info flex left fs-13">
                        <DeployIcon className="icon-dim-16 scn-6 mr-8" />
                        <span className="fs-13 fw-4">{mat.deployedTime}</span>
                    </div>
                )}
                <div />
                {!hideSelector && (
                    <div className="material-history__select-text dc__no-text-transform w-auto">
                        {mat.vulnerable ? (
                            <span className="material-history__scan-error">Security vulnerability found</span>
                        ) : mat.userApprovalMetadata?.approvalRuntimeState === 1 ? (
                            <TippyCustomized
                                theme={TippyTheme.white}
                                className="w-300 h-100 dc__align-left"
                                placement="bottom-end"
                                iconClass="fcv-5"
                                heading="Cancel approval request"
                                infoText="Are you sure you want to cancel approval request for this image? A new approval request would need to be raised if you want to deploy this image."
                                additionalContent={getCancelRequestButton(mat)}
                                showCloseButton={true}
                                trigger="click"
                                interactive={true}
                                visible={tippyVisible[mat.id]}
                            >
                                <span className="cr-5" data-id={mat.id} onClick={toggleTippyVisibility}>
                                    Cancel request
                                </span>
                            </TippyCustomized>
                        ) : (
                            <TippyCustomized
                                theme={TippyTheme.white}
                                className="w-300 h-100 dc__align-left"
                                placement="bottom-end"
                                iconClass="fcv-5"
                                heading="Request approval"
                                infoText="Request approval for deploying this image. All users having ‘Approver’ permission for this application and environment can approve."
                                additionalContent={getSubmitRequestButton(+mat.id)}
                                showCloseButton={true}
                                trigger="click"
                                interactive={true}
                                visible={tippyVisible[mat.id]}
                            >
                                <span className="cb-5" data-id={mat.id} onClick={toggleTippyVisibility}>
                                    Request approval
                                </span>
                            </TippyCustomized>
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
        return material.map((mat, index) => {
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
                <div key={`material-history-${index}`} className="material-history material-history--cd">
                    {renderSequentialCDCardTitle(mat)}
                    <div
                        className={`material-history__top mh-66 ${
                            !isSecurityModuleInstalled && mat.showSourceInfo ? 'dc__border-bottom' : ''
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
                            {isSecurityModuleInstalled && (
                                <ul className="tab-list tab-list--vulnerability">
                                    <li className="tab-list__tab">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                changeTab(
                                                    index,
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
                                                changeTab(index, Number(mat.id), CDModalTab.Security, null, appId)
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
                                toggleSourceInfo(index, null)
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
