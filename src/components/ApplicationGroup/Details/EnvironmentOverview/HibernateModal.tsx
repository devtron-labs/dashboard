/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { SyntheticEvent, useEffect, useState } from 'react'
import { VisibleModal, stopPropagation, MODAL_TYPE, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as HibernateModalIcon } from '../../../../assets/icons/ic-medium-hibernate.svg'
import { ReactComponent as ICUnHibernate } from '../../../../assets/icons/ic-medium-unhibernate.svg'
import { manageApps } from './service'
import { importComponentFromFELibrary } from '../../../common'
import { HibernateModalProps } from '../../AppGroup.types'

const ResistantInput = importComponentFromFELibrary('ResistantInput')

export const HibernateModal = ({
    selectedAppDetailsList,
    appDetailsList,
    envName,
    envId,
    setOpenedHibernateModalType,
    openedHibernateModalType,
    setAppStatusResponseList,
    setShowHibernateStatusDrawer,
    isDeploymentWindowLoading,
    showDefaultDrawer,
    httpProtocol,
    isDeploymentBlockedViaWindow,
}: HibernateModalProps) => {
    const [isActionButtonDisabled, setActionButtonDisabled] = useState<boolean>(true)
    const isCurrentSelected = !Array.isArray(selectedAppDetailsList)

    const handleAction = (event: SyntheticEvent) => {
        event.preventDefault()
        setOpenedHibernateModalType(null)
        setShowHibernateStatusDrawer({
            hibernationOperation: openedHibernateModalType === MODAL_TYPE.HIBERNATE,
            showStatus: false,
            inProgress: true,
        })
        const selectedAppIds = (isCurrentSelected ? [selectedAppDetailsList] : selectedAppDetailsList).map(
            (appDetails) => appDetails.appId,
        )
        manageApps(
            selectedAppIds,
            appDetailsList,
            Number(envId),
            envName,
            openedHibernateModalType === MODAL_TYPE.HIBERNATE ? 'hibernate' : 'unhibernate',
            httpProtocol,
        ).then((res) => {
            setAppStatusResponseList(res)
            setShowHibernateStatusDrawer({
                hibernationOperation: openedHibernateModalType === MODAL_TYPE.HIBERNATE,
                showStatus: true,
                inProgress: false,
            })
        })
    }

    useEffect(() => {
        setActionButtonDisabled(isDeploymentBlockedViaWindow)
    }, [isDeploymentBlockedViaWindow])

    const closeModal = () => {
        setOpenedHibernateModalType(null)
    }

    const renderHibernateModalBody = () => {
        if (showDefaultDrawer || !isDeploymentBlockedViaWindow) {
            return (
                <>
                    <span>
                        Pods for the selected application(s) will be&nbsp;
                        <span className="fw-6">
                            {openedHibernateModalType === MODAL_TYPE.HIBERNATE
                                ? `scaled down to 0 on ${envName} environment.`
                                : `scaled up to its original count on ${envName}`}
                        </span>
                    </span>
                    <span> Are you sure you want to continue?</span>
                </>
            )
        }
        return (
            <>
                <div>
                    {openedHibernateModalType === MODAL_TYPE.HIBERNATE ? 'Hibernating' : 'Unhibernating'} some
                    applications is blocked due to deployment window
                </div>
                {ResistantInput && (
                    <ResistantInput setActionButtonDisabled={setActionButtonDisabled} type={openedHibernateModalType} />
                )}
            </>
        )
    }

    return (
        <VisibleModal close={closeModal} onEscape={closeModal} className="">
            <div onClick={stopPropagation} className="modal__body w-400 pl-24 pr-24 pt-24 pb-24 fs-14 flex column">
                {isDeploymentWindowLoading ? (
                    <div className="mh-320 flex">
                        <Progressing pageLoader />
                    </div>
                ) : (
                    <>
                        <div className="flexbox-col dc__gap-12">
                            {openedHibernateModalType === MODAL_TYPE.HIBERNATE ? (
                                <HibernateModalIcon className="dc__align-left" />
                            ) : (
                                <ICUnHibernate className="dc__align-left" />
                            )}
                            <span className="fs-16 fw-6">
                                {`${openedHibernateModalType === MODAL_TYPE.HIBERNATE ? 'Hibernate' : 'Unhibernate'} '${
                                    isCurrentSelected
                                        ? selectedAppDetailsList.application
                                        : `${selectedAppDetailsList.length} applications`
                                }' on '${envName}'`}
                            </span>
                            {renderHibernateModalBody()}
                        </div>
                        <div className="pt-40 flexbox dc__content-end w-100 dc__align-end dc__gap-12">
                            <button
                                onClick={closeModal}
                                className="flex bcn-0 dc__border-radius-4-imp h-36 pl-16 pr-16 pt-8 pb-8 dc__border"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="cta flex h-36 pl-16 pr-16 pt-8 pb-8 w-96 dc__border-radius-4-imp"
                                disabled={!showDefaultDrawer && isActionButtonDisabled}
                                onClick={handleAction}
                            >
                                {openedHibernateModalType === MODAL_TYPE.HIBERNATE ? 'Hibernate' : 'Unhibernate'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </VisibleModal>
    )
}
