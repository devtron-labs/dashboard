import React, { useState } from 'react'
import {
    ButtonWithLoader,
    Drawer,
    GenericEmptyState,
    InfoColourBar,
    Progressing,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'
import { ResourceIdentifiers, RestartWorkloadModalProps } from '../../AppGroup.types'
import { ReactComponent as MechanicalIcon } from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { APP_DETAILS_TEXT } from './constants'
import { ReactComponent as DropdownIcon } from '../../../../assets/icons/ic-arrow-left.svg'

export const RestartWorkloadModal = ({
    closeModal,
    selectedAppIds,
    envName,
    workloadLoader,
    workloadList,
}: RestartWorkloadModalProps) => {
    const [collapsedWorkload, setCollapsedWorkload] = useState<boolean>(true)

    const toggleWorkloadCollapse = (appName) => {
        console.log(appName)
        setCollapsedWorkload(!collapsedWorkload)
    }

    const handleBulkRestart = () => {}

    if (workloadLoader) {
        return (
            <GenericEmptyState
                title={`Fetching workload for ${selectedAppIds.length} Applications`}
                subTitle="Restarting workloads"
                SvgImage={MechanicalIcon}
            />
        )
    }

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex dc__content-space dc__border-bottom pt-16 pr-20 pb-16 pl-20">
                <div className="fs-16 fw-6">
                    {` Restart workloads '${selectedAppIds.length} applications' on '${envName}'`}
                </div>
                <Close className="icon-dim-24 cursor" onClick={closeModal} />
            </div>
        )
    }

    const renderWorkloadTableHeader = () => (
        <div className="flex dc__content-space pl-16 pr-16 pt-8 pb-8 fs-12 fw-6 cn-7 dc__border-bottom-n1">
            <div className="dc__uppercase">{APP_DETAILS_TEXT.APPLICATIONS}</div>
            <div className="flex dc__gap-4">
                {APP_DETAILS_TEXT.EXPAND_ALL}
                <DropdownIcon className="icon-dim-16 rotate dc__flip-270" onClick={toggleWorkloadCollapse} />
            </div>
        </div>
    )

    const renderWorkloadDetails = (resourceIdentifiers: ResourceIdentifiers[]) => {
        return (
            !collapsedWorkload && (
                <div className="dc__gap-4 pt-8 pb-8">
                    {resourceIdentifiers.map((resource) => (
                        <div key={resource.name} className="flex left p-8 dc__border-left">
                            <span className="fw-6">{resource.groupVersionKind.Kind}</span>/<span>{resource.name}</span>
                        </div>
                    ))}
                </div>
            )
        )
    }

    const renderRestartWorkloadModalListItems = () => {
        return Object.entries(workloadList.resourceIdentifierMap).map(([appId, _resourceIdentifier]) => {
            return (
                <div className="pl-16 pr-16">
                    <div key={appId} className="flex dc__content-space pt-12 pb-12">
                        <div>{_resourceIdentifier.appName}</div>
                        <div
                            className="flex dc__gap-4"
                            onClick={() => toggleWorkloadCollapse(_resourceIdentifier.appName)}
                        >
                            {_resourceIdentifier.resourceIdentifiers.length} workload
                            <DropdownIcon className="icon-dim-16 rotate dc__flip-270" />
                        </div>
                    </div>
                    {renderWorkloadDetails(_resourceIdentifier.resourceIdentifiers)}
                </div>
            )
        })
    }

    const renderRestartWorkloadModalList = () => {
        return (
            <div className="flexbox-col dc__gap-12">
                {renderWorkloadTableHeader()}
                {renderRestartWorkloadModalListItems()}
            </div>
        )
    }

    const renderFooterSection = () => {
        return (
            <div className="pt-40 flexbox dc__content-end w-100 dc__align-end dc__gap-12">
                <button
                    type="button"
                    onClick={closeModal}
                    className="flex bcn-0 dc__border-radius-4-imp h-36 pl-16 pr-16 pt-8 pb-8 dc__border"
                >
                    Cancel
                </button>
                <ButtonWithLoader
                    rootClassName="cta flex h-36 pl-16 pr-16 pt-8 pb-8 w-96 dc__border-radius-4-imp"
                    isLoading={workloadLoader}
                    onClick={handleBulkRestart}
                >
                    {APP_DETAILS_TEXT.RESTART_WORKLOAD}
                </ButtonWithLoader>
            </div>
        )
    }

    return (
        <Drawer onEscape={closeModal} position="right" width="800" parentClassName="h-100">
            <div onClick={stopPropagation} className="bcn-0 h-100">
                {workloadLoader ? (
                    <div className="mh-320 flex">
                        <Progressing pageLoader />
                    </div>
                ) : (
                    <>
                        {renderHeaderSection()}
                        <InfoColourBar
                            message={APP_DETAILS_TEXT.APP_GROUP_INFO_TEXT}
                            classname="info_bar dc__no-border-radius dc__no-top-border"
                            Icon={InfoIcon}
                        />
                        {renderRestartWorkloadModalList()}
                        {renderFooterSection()}
                    </>
                )}
            </div>
        </Drawer>
    )
}
