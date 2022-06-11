import React from 'react'
import { VisibleModal } from '../common'
import { ReactComponent as Success } from '../../assets/icons/ic-success-outline.svg'
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg'

function RegeneratedModal() {
    const handleCopyToClipboard = () => {
        return
    }

    return (
        <VisibleModal className={undefined}>
            <div className={`modal__body w-600 pl-20 pr-20 pt-20 pb-20 flex column`}>
                <Success className="vertical-align-middle mb-16" />

                <h1 className="modal__title fs-16 mb-20">API token regenerated</h1>

                <div
                    className="bcg-1 br-4 eg-2 bw-1 pl-16 pr-16 pt-10 pb-10"
                    style={{ width: '560px', wordWrap: 'break-word' }}
                >
                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjIsImp0aSI6InNvbWVSYW5kb21JZCJ9.TFArT1SLnV-XyZ19p6exiQoFNurXt9nKTpwykwXRXooeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjIsImp0aSI6InNvbWVSYW5kb21JZCJ9.TFArT1SLnV-XyZ19p6exiQoFNurXt9nKTpwykwXRXoo
                </div>
                <button className="flex cta mt-20 mb-20" onClick={handleCopyToClipboard}>
                    <Clipboard className="icon-dim-16 ml-8" /> Copy token
                </button>
            </div>
        </VisibleModal>
    )
}

export default RegeneratedModal
