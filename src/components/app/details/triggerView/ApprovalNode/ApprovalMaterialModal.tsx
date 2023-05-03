import React, { useState } from 'react'
import {
    GenericEmptyState,
    Progressing,
    stopPropagation,
    TippyCustomized,
    TippyTheme,
    VisibleModal,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ApproversIcon } from '../../../../../assets/icons/ic-users.svg'
import { ReactComponent as APITokenIcon } from '../../../../../assets/icons/ic-key-bulb.svg'
import noartifact from '../../../../../assets/img/no-artifact@2x.png'
import norequests from '../../../../../assets/img/no-pending-action@2x.png'
import close from '../../../../../assets/icons/ic-close.svg'
import { ApprovalMaterialModalProps } from './Types'
import ApprovalMaterial from './ApprovalMaterial'
import { getAlphabetIcon } from '../../../../common'
import { Link } from 'react-router-dom'
import { APPROVAL_MODAL_TEXT, APPROVAL_RUNTIME_STATE, EMPTY_VIEW_TEXTS } from './Constants'

export default function ApprovalMaterialModal({
    isLoading,
    node,
    materialType,
    stageType,
    changeTab,
    toggleSourceInfo,
    closeApprovalModal,
    appId,
    pipelineId,
}: ApprovalMaterialModalProps) {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
    const material = node[materialType] ?? []
    const approvalRequestedMaterial = [],
        remainingMaterial = []
    material.forEach((mat) => {
        if (mat.userApprovalMetadata?.approvalRuntimeState === APPROVAL_RUNTIME_STATE.requested) {
            approvalRequestedMaterial.push(mat)
        } else {
            remainingMaterial.push(mat)
        }
    })

    const renderModalHeader = () => {
        return (
            <div
                data-testid="approval-for-deployment-heading"
                className="trigger-modal__header dc__no-border pb-12 cn-9"
            >
                <h1 className="modal__title">
                    {APPROVAL_MODAL_TEXT.heading}&nbsp;
                    <span className="fw-6">{!isLoading && node.environmentName ? node.environmentName : ''}</span>
                </h1>
                <button
                    data-testid="close-approval-node-box"
                    type="button"
                    className="dc__transparent"
                    onClick={closeApprovalModal}
                >
                    <img alt="close" src={close} />
                </button>
            </div>
        )
    }

    const handleTabSelected = (e) => {
        setSelectedTabIndex(+e.currentTarget.dataset.selectedTab)
    }

    const renderTabs = () => {
        return (
            <ul role="tablist" className="tab-list fs-13 lh-20 pl-20 dc__border-bottom">
                <li
                    className={`tab-list__tab cursor pb-8 ${
                        selectedTabIndex === 0 ? 'active-tab fw-6 cb-5' : 'fw-4 cn-9'
                    }`}
                    data-selected-tab="0"
                    data-testid="all-images-tab"
                    onClick={handleTabSelected}
                >
                    {APPROVAL_MODAL_TEXT.tab.first}
                </li>
                <li
                    className={`tab-list__tab cursor pb-8 ${
                        selectedTabIndex === 1 ? 'active-tab fw-6 cb-5' : 'fw-4 cn-9'
                    }`}
                    data-selected-tab="1"
                    data-testid="approval-requested-tab"
                    onClick={handleTabSelected}
                >
                    {APPROVAL_MODAL_TEXT.tab.second}
                    <span className="dc__badge ml-6">{approvalRequestedMaterial.length}</span>
                </li>
            </ul>
        )
    }

    const getApproversInfoMsg = () => {
        return (
            <div className="fs-12 fw-4 bcv-1 cn-9 lh-20 pt-8 pb-8 pl-12 pr-12">
                {APPROVAL_MODAL_TEXT.approverInfoMsg}&nbsp;
                <Link to="/global-config/auth/users" className="fs-13 cb-5 lh-20">
                    {APPROVAL_MODAL_TEXT.permissions}
                </Link>
            </div>
        )
    }

    const getApproversList = (approvers: string[], isAPIToken?: boolean) => {
        return (
            <ol className="pt-8 pl-12 pr-12 dc__list-style-none">
                {approvers.sort().map((_approver) => {
                    return (
                        <li key={_approver} className="flex left mb-8 fs-13 fw-4">
                            {isAPIToken ? <APITokenIcon className="icon-dim-20 mr-8" /> : getAlphabetIcon(_approver)}
                            {_approver}
                        </li>
                    )
                })}
            </ol>
        )
    }

    const getApprovalUsersTippyContent = () => {
        const approversPresent = node.approvalUsers?.length > 0
        const users: string[] = [],
            apiTokens: string[] = []

        if (approversPresent) {
            for (const approver of node.approvalUsers) {
                if (approver.startsWith(APPROVAL_MODAL_TEXT.apiTokenPrefix)) {
                    apiTokens.push(approver.split(':')[1])
                } else {
                    users.push(approver)
                }
            }
        }

        return (
            <div className="h-100 dc__overflow-hidden">
                <div className="h-100 mxh-210 dc__overflow-scroll">
                    {approversPresent ? (
                        <>
                            {getApproversInfoMsg()}
                            <div className="fs-13 fw-6 cn-9 pt-12 pl-12">{APPROVAL_MODAL_TEXT.approverGroups.user}</div>
                            {getApproversList(users)}
                            <div className="fs-13 fw-6 cn-9 mt-12 pl-12">
                                {APPROVAL_MODAL_TEXT.approverGroups.token}
                            </div>
                            {getApproversList(apiTokens, true)}
                        </>
                    ) : (
                        <div className="fs-13 fw-4 cn-7 lh-20">
                            {APPROVAL_MODAL_TEXT.noApproverInfoMsg}&nbsp;
                            <Link to="/global-config/auth/users" className="fs-13 cb-5 lh-20">
                                {APPROVAL_MODAL_TEXT.permissions}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderModalBody = () => {
        const totalApproverText = `${node.approvalUsers?.length ?? 0} Approvers`
        return (
            <div className="trigger-modal__body h-100vh">
                <div className="material-list__title pb-16">
                    {selectedTabIndex === 0 ? (
                        'Request approval for an image to deploy or rollback to'
                    ) : (
                        <>
                            {`At least ${
                                node.userApprovalConfig?.requiredCount ?? 1
                            } approvals are required for an image to be deployed. `}
                            <TippyCustomized
                                theme={TippyTheme.white}
                                className="w-300 h-100"
                                placement="bottom"
                                Icon={ApproversIcon}
                                iconClass="fcv-5"
                                heading={totalApproverText}
                                additionalContent={getApprovalUsersTippyContent()}
                                showCloseButton={true}
                                trigger="click"
                                interactive={true}
                            >
                                <span className="fs-13 dc__underline cursor">{totalApproverText}</span>
                            </TippyCustomized>
                        </>
                    )}
                </div>
                <ApprovalMaterial
                    material={selectedTabIndex === 1 ? approvalRequestedMaterial : remainingMaterial}
                    envName={node.environmentName}
                    stageType={stageType}
                    changeTab={changeTab}
                    toggleSourceInfo={toggleSourceInfo}
                    appId={appId}
                    pipelineId={pipelineId}
                    parentEnvironmentName={node.parentEnvironmentName}
                    node={node}
                    selectedTabIndex={selectedTabIndex}
                />
            </div>
        )
    }

    const renderViewImagesButton = () => {
        return (
            <button className="cta ghosted flex h-36" data-selected-tab="0" onClick={handleTabSelected}>
                {EMPTY_VIEW_TEXTS.noPendingImages.label}
            </button>
        )
    }

    const renderEmpty = () => {
        if (selectedTabIndex === 0) {
            return (
                <GenericEmptyState
                    image={noartifact}
                    title={EMPTY_VIEW_TEXTS.noImage.title}
                    subTitle={EMPTY_VIEW_TEXTS.noImage.subTitle}
                    isButtonAvailable={false}
                />
            )
        }

        return (
            <GenericEmptyState
                image={norequests}
                title={EMPTY_VIEW_TEXTS.noPendingImages.title}
                subTitle={EMPTY_VIEW_TEXTS.noPendingImages.subTitle}
                isButtonAvailable={true}
                renderButton={renderViewImagesButton}
            />
        )
    }

    const showModalBody = selectedTabIndex === 1 ? approvalRequestedMaterial.length > 0 : remainingMaterial.length > 0
    return (
        <VisibleModal className="" parentClassName="dc__overflow-hidden" close={closeApprovalModal}>
            <div className="modal-body--cd-material h-100" onClick={stopPropagation}>
                {renderModalHeader()}
                {renderTabs()}
                {isLoading ? (
                    <Progressing size={32} fullHeight fillColor="var(--N500)" />
                ) : (
                    <>{showModalBody ? renderModalBody() : renderEmpty()}</>
                )}
            </div>
        </VisibleModal>
    )
}
