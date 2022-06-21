import React, { useState } from 'react'
import { copyToClipboard, VisibleModal } from '../common'
import { ReactComponent as Success } from '../../assets/icons/ic-success-outline.svg'
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { GenerateTokenModalType } from './authorization.type'
import { toast } from 'react-toastify'

function GenerateModal({
    close,
    token,
    copied,
    setCopied,
    setShowGenerateModal,
    reload,
    redirectToTokenList,
}: GenerateTokenModalType) {
    return (
        <VisibleModal className="">
            <div className={`modal__body w-600 pl-20 pr-20 pt-20 pb-20 flex column`}>
                <button
                    type="button"
                    className="w-100 flex right transparent"
                    onClick={() => {
                        close()
                        reload()
                        toast.success('Changes saved')
                        redirectToTokenList()
                    }}
                >
                    <Close className="icon-dim-24" />
                </button>
                <Success className="vertical-align-middle mb-16" />

                <div className="modal__header ">
                    <h1 className="modal__title fs-16">API token regenerated</h1>
                </div>
                <div
                    className="bcg-1 br-4 eg-2 bw-1 pl-16 pr-16 pt-10 pb-10"
                    style={{ width: '560px', wordWrap: 'break-word' }}
                >
                    {token}
                </div>
                <button
                    className="flex cta mt-20 mb-20"
                    onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(token, () => setCopied(true))
                        close()
                        reload()
                        toast.success('Copied successfully')
                        redirectToTokenList()
                    }}
                >
                    <Clipboard className="icon-dim-16 ml-8" />
                    Copy token
                </button>
            </div>
        </VisibleModal>
    )
}

export default GenerateModal
