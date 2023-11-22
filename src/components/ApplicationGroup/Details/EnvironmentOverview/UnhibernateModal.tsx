import { VisibleModal, showError } from '@devtron-labs/devtron-fe-common-lib'
import React, { useState } from 'react'
import { ReactComponent as UnhibernateModalIcon } from '../../../../assets/icons/ic-medium-unhibernate.svg'
import { unhibernate } from './service'
import { ButtonWithLoader } from '../../../common'

interface UnhibernateModalProps {
    selectedAppIds: number[]
    envName: string
    envId: string
    setOpenUnhiberateModal: (value: boolean) => void
    setAppStatusResponseList: React.Dispatch<React.SetStateAction<any[]>>
    setShowHibernateStatusDrawer: React.Dispatch<
        React.SetStateAction<{
            hibernationOperation: boolean
            showStatus: boolean
        }>
    >
}

export const UnhibernateModal = ({
    selectedAppIds,
    envName,
    envId,
    setOpenUnhiberateModal,
    setAppStatusResponseList,
    setShowHibernateStatusDrawer,
}: UnhibernateModalProps) => {
    const [loader, setLoader] = useState<boolean>(false)
    const unhibernateApps = (e) => {
        e.preventDefault()
        setLoader(true)
        unhibernate(selectedAppIds, Number(envId), envName)
            .then((res) => {
                setOpenUnhiberateModal(false)
                setAppStatusResponseList(res?.result?.response)
                setShowHibernateStatusDrawer({
                    hibernationOperation: false,
                    showStatus: true,
                })
            })
            .catch((err) => {
                showError(err)
            })
    }

    return (
        <VisibleModal
            close={() => setOpenUnhiberateModal(false)}
            onEscape={() => setOpenUnhiberateModal(false)}
            className="generate-token-modal"
        >
            <div
                onClick={(e) => {
                    e.stopPropagation()
                }}
                className={`modal__body w-400 pl-24 pr-24 pt-24 pb-24 fs-14 flex column`}
            >
                <div className="flexbox-col dc__gap-12">
                    <UnhibernateModalIcon className="dc__align-left" />
                    <span className="fs-16 fw-6">
                        Unhibernate '{selectedAppIds.length} applications' on '{envName}'
                    </span>
                    <span>
                        Pods for the selected applications will be{' '}
                        <span className="fw-6">scaled up to its original count on {envName} environment.</span>
                    </span>
                    <span> Are you sure you want to continue?</span>
                </div>
                <div className="pt-40 flexbox dc__content-end w-100 dc__align-end dc__gap-12">
                    <button
                        onClick={() => setOpenUnhiberateModal(false)}
                        className="flex bcn-0 dc__border-radius-4-imp h-36 pl-16 pr-16 pt-8 pb-8 dc__border"
                        disabled={loader}
                    >
                        Cancel
                    </button>
                    <ButtonWithLoader
                        rootClassName="cta flex h-36 pl-16 pr-16 pt-8 pb-8 w-96 dc__border-radius-4-imp"
                        loaderColor="#fff"
                        isLoading={loader}
                        disabled={false}
                        onClick={unhibernateApps}
                    >
                        Unhibernate
                    </ButtonWithLoader>
                </div>
            </div>
        </VisibleModal>
    )
}
