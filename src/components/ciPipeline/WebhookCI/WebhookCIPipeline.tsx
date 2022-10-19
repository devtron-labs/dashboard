import React from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ButtonWithLoader, VisibleModal } from '../../common'

export function WebhookCI() {
    return (
        <VisibleModal className="">
            <div className="modal__body modal__body__ci_new_ui br-0 modal__body--p-0">
                <div className="flex flex-align-center flex-justify bcn-0 pr-20">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Deploy image from external source</h2>
                    <button
                        type="button"
                        className="dc__transparent flex icon-dim-24"
                        onClick={() => {
                           alert('Hello')
                        }}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
            </div>
        </VisibleModal>
    )
}
