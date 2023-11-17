import { VisibleModal } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { ReactComponent as HibernateModalIcon } from '../../../../assets/icons/ic-medium-hibernate.svg'
import { hibernate } from './service'
import { get } from 'http'

interface HibernateModalProps {
    selectedAppIds: number[]
    envName: string
    envId: string
    setOpenHiberateModal: (value: boolean) => void
    getAppListData: any
    fetchDeployments: any
}

export const HibernateModal = ({
    selectedAppIds,
    envName,
    envId,
    setOpenHiberateModal,
    getAppListData,
    fetchDeployments,
}: HibernateModalProps) => {
    const hibernateApps = (e) => {
        e.preventDefault()
        hibernate(selectedAppIds, Number(envId), envName)
            .then((res) => {})
            .catch((err) => {})
            .finally(() => {
                Promise.all([getAppListData(), fetchDeployments()]).then(() => {
                    setOpenHiberateModal(false)
                })
            })
    }

    return (
        <VisibleModal
            close={() => setOpenHiberateModal(false)}
            onEscape={() => setOpenHiberateModal(false)}
            className="generate-token-modal"
        >
            <div
                onClick={(e) => {
                    e.stopPropagation()
                }}
                className={`modal__body w-400 pl-24 pr-24 pt-24 pb-24 flex column`}
            >
                <div className="flexbox-col dc__gap-12">
                    <HibernateModalIcon className="dc__align-left" />
                    <span className="fs-16 fw-6">
                        Hibernate '{selectedAppIds.length} applications on '{envName}'
                    </span>
                    <span>
                        Pods for the selected applications will be{' '}
                        <span className="fw-6">scaled down to 0 on {envName} environment.</span>
                    </span>
                    <span> Are you sure you want to continue?</span>
                </div>
                <div className="pt-40 flexbox dc__content-end w-100 dc__align-end dc__gap-6">
                    <button
                        onClick={() => setOpenHiberateModal(false)}
                        className="flex bcn-0 dc__border-radius-4-imp h-36 pl-16 pr-16 pt-8 pb-8 dc__border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={hibernateApps}
                        className="flex cn-0 bcb-5 dc__border-radius-4-imp h-36 pl-16 pr-16 pt-8 pb-8 dc__border-n0"
                    >
                        Hibernate
                    </button>
                </div>
            </div>
        </VisibleModal>
    )
}
