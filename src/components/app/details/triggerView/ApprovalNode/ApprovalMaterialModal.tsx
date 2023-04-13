import React, { useState } from 'react'
import {
    Progressing,
    stopPropagation,
    TippyCustomized,
    TippyTheme,
    VisibleModal,
} from '@devtron-labs/devtron-fe-common-lib'
import { EmptyView } from '../../cicdHistory/History.components'
import { ReactComponent as ApproversIcon } from '../../../../../assets/icons/ic-users.svg'
import noartifact from '../../../../../assets/img/no-artifact@2x.png'
import close from '../../../../../assets/icons/ic-close.svg'
import { ApprovalMaterialModalProps } from './Types'
import ApprovalMaterial from './ApprovalMaterial'
import { getAlphabetIcon } from '../../../../common'
import { Link } from 'react-router-dom'
import { APPROVAL_RUNTIME_STATE } from './Constants'

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
    const material = node?.[materialType] ?? []
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
            <div className="trigger-modal__header dc__no-border pb-12 cn-9">
                <h1 className="modal__title">
                    Approval for deployment to <span className="fw-6">{node?.environmentName ?? ''}</span>
                </h1>
                <button type="button" className="dc__transparent" onClick={closeApprovalModal}>
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
                    onClick={handleTabSelected}
                >
                    All images
                </li>
                <li
                    className={`tab-list__tab cursor pb-8 ${
                        selectedTabIndex === 1 ? 'active-tab fw-6 cb-5' : 'fw-4 cn-9'
                    }`}
                    data-selected-tab="1"
                    onClick={handleTabSelected}
                >
                    Approval requested<span className="dc__badge ml-6">{approvalRequestedMaterial.length}</span>
                </li>
            </ul>
        )
    }

    const getApprovalUsersTippyContent = () => {
        const approversPresent = node?.approvalUsers?.length > 0
        return (
            <div className="pl-12 pr-12 h-100 dc__overflow-hidden">
                <div className="pt-12 pb-12 h-100 mxh-210 dc__overflow-scroll">
                    {approversPresent ? (
                        <ol className="p-0 dc__list-style-none">
                            {node.approvalUsers.sort().map((_approver) => {
                                return (
                                    <li key={_approver} className="flex left mb-8">
                                        {getAlphabetIcon(_approver)}
                                        {_approver}
                                    </li>
                                )
                            })}
                        </ol>
                    ) : (
                        <div className="fs-13 fw-4 cn-7 lh-20">
                            No users have ‘Approver’ permission for this application and environment. ‘Approver’ role
                            can be provided to users via&nbsp;
                            <Link to="/global-config/auth/users" className="fs-13 cb-5 lh-20">
                                User Permissions.
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderModalBody = () => {
        const totalApproverText = `${node?.approvalUsers?.length ?? 0} Approvers`
        return (
            <div className="trigger-modal__body h-100vh">
                <div className="material-list__title pb-16">
                    {selectedTabIndex === 0 ? (
                        'Request approval for an image to deploy or rollback'
                    ) : (
                        <>
                            {`At least ${
                                node?.userApprovalConfig?.requiredCount ?? 1
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
                    envName={node?.environmentName}
                    stageType={stageType}
                    changeTab={changeTab}
                    toggleSourceInfo={toggleSourceInfo}
                    appId={appId}
                    pipelineId={pipelineId}
                    parentEnvironmentName={node?.parentEnvironmentName}
                    node={node}
                    selectedTabIndex={selectedTabIndex}
                />
            </div>
        )
    }

    const renderEmpty = () => {
        if (selectedTabIndex === 0) {
            return (
                <EmptyView
                    title="No image available"
                    subTitle="Trigger build pipeline and find the image here"
                    imgSrc={noartifact}
                />
            )
        }

        return (
            <EmptyView
                title="No approvals requested"
                subTitle="Images for which approval is requested will be available here. All users having ‘Approver’ permission for this application and environment can approve."
                imgSrc={noartifact}
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
