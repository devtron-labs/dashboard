import React from 'react'
import { useParams } from 'react-router-dom'
import { Progressing, VisibleModal, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import CIMaterial from './ciMaterial'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import { CIMaterialRouteProps } from './types'

export const CIMaterialModal = ({ loader, closeCIModal, ...props }: CIMaterialRouteProps) => {
    const { ciNodeId } = useParams<{ ciNodeId: string }>()
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
                    <CIMaterial {...props} loader={loader} pipelineId={+ciNodeId} />
                )}
            </div>
        </VisibleModal>
    )
}

export default CIMaterialModal
