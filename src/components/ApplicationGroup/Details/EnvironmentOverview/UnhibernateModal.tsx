import {
    MODAL_TYPE,
    Progressing,
    VisibleModal,
    capitalizeFirstLetter,
    showError,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useState } from 'react'
import { ReactComponent as UnhibernateModalIcon } from '../../../../assets/icons/ic-medium-unhibernate.svg'
import { manageApps } from './service'
import { ButtonWithLoader, importComponentFromFELibrary } from '../../../common'
import { UnhibernateModalProps } from '../../AppGroup.types'

const ResistantInput = importComponentFromFELibrary('ResistantInput')

export const UnhibernateModal = ({
    selectedAppIds,
    envName,
    envId,
    setOpenUnhiberateModal,
    setAppStatusResponseList,
    setShowHibernateStatusDrawer,
    showDefaultDrawer,
    isDeploymentLoading,
}: UnhibernateModalProps) => {
    const [loader, setLoader] = useState<boolean>(false)
    const [value, setValue] = useState<string>('')

    const unhibernateApps = (e) => {
        e.preventDefault()
        setLoader(true)
        manageApps(selectedAppIds, Number(envId), envName, 'unhibernate')
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
            .finally(() => {
                setLoader(false)
            })
    }

    const closeModal = () => {
        setOpenUnhiberateModal(false)
    }

    const renderHibernateModalBody = () => {
        if (showDefaultDrawer) {
            return (
                <>
                    <span>
                        Pods for the selected applications will be &nbsp;
                        <span className="fw-6">scaled down to 0 on {envName} environment.</span>
                    </span>
                    <span> Are you sure you want to continue?</span>
                </>
            )
        }
        return (
            <div>
                Hibernating some applications is blocked due to deployment window
                {ResistantInput && <ResistantInput value={value} setValue={setValue} type={MODAL_TYPE.HIBERNATE} />}
            </div>
        )
    }

    return (
        <VisibleModal close={closeModal} onEscape={closeModal} className="generate-token-modal">
            <div onClick={stopPropagation} className="modal__body w-400 pl-24 pr-24 pt-24 pb-24 fs-14 flex column">
                {isDeploymentLoading ? (
                    <Progressing />
                ) : (
                    <>
                        <div className="flexbox-col dc__gap-12">
                            <UnhibernateModalIcon className="dc__align-left" />
                            <span className="fs-16 fw-6">
                                Unhibernate '{selectedAppIds.length} applications' on '{envName}'
                            </span>
                            {renderHibernateModalBody()}
                        </div>
                        <div className="pt-40 flexbox dc__content-end w-100 dc__align-end dc__gap-12">
                            <button
                                onClick={closeModal}
                                className="flex bcn-0 dc__border-radius-4-imp h-36 pl-16 pr-16 pt-8 pb-8 dc__border"
                                disabled={loader}
                            >
                                Cancel
                            </button>
                            <ButtonWithLoader
                                rootClassName="cta flex h-36 pl-16 pr-16 pt-8 pb-8 w-96 dc__border-radius-4-imp"
                                loaderColor="#fff"
                                isLoading={loader}
                                disabled={
                                    !showDefaultDrawer &&
                                    (!value || (value && value !== capitalizeFirstLetter(MODAL_TYPE.HIBERNATE)))
                                }
                                onClick={unhibernateApps}
                            >
                                Unhibernate
                            </ButtonWithLoader>
                        </div>
                    </>
                )}
            </div>
        </VisibleModal>
    )
}
