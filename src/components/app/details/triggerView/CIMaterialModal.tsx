import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Progressing, VisibleModal, stopPropagation, usePrompt } from '@devtron-labs/devtron-fe-common-lib'
import CIMaterial from './ciMaterial'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import { CIMaterialModalProps, CIMaterialRouterProps } from './types'

export const CIMaterialModal = ({
    loader,
    closeCIModal,
    isLoading,
    abortController,
    resetAbortController,
    ...props
}: CIMaterialModalProps) => {
    const { ciNodeId } = useParams<Pick<CIMaterialRouterProps, 'ciNodeId'>>()
    usePrompt({ shouldPrompt: isLoading })

    useEffect(() => {
        return () => {
            abortController.abort()
            resetAbortController()
        }
    }, [])

    return (
        <VisibleModal className="" close={closeCIModal}>
            <div className="modal-body--ci-material h-100" onClick={stopPropagation}>
                {loader ? (
                    <>
                        <div className="trigger-modal__header flex right">
                            <button
                                type="button"
                                aria-label="close-modal"
                                className="dc__transparent"
                                onClick={closeCIModal}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={{ height: 'calc(100% - 55px)' }}>
                            <Progressing pageLoader size={32} />
                        </div>
                    </>
                ) : (
                    <CIMaterial {...props} loader={loader} isLoading={isLoading} pipelineId={+ciNodeId} />
                )}
            </div>
        </VisibleModal>
    )
}

export default CIMaterialModal
