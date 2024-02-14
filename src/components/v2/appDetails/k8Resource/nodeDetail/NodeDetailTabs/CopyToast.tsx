import React from 'react'
import { copyToClipboard } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as CheckIcon } from '../../../../assets/icons/ic-check.svg'
import 'xterm/css/xterm.css'
import '../../../../../LogViewer/LogViewer.scss'
import './nodeDetailTab.scss'

interface toastType {
    showCopyToast: boolean
}

const CopyToast = ({ showCopyToast }: toastType) => {
    return (
        <span
            className={`br-8 bcn-0 cn-9 clipboard-toast ${showCopyToast ? 'clipboard-toast--show' : ''}`}
            style={{ zIndex: 9 }}
        >
            <CheckIcon className="icon-dim-24 scn-9" />
            <div className="">Copied!</div>
        </span>
    )
}

function handleSelectionChange(terminal, setPopupText): void {
    terminal.onSelectionChange(() => {
        copyToClipboard(terminal.getSelection())
        if (terminal.getSelection()) {
            setPopupText(true)
        }
    })
}

export default CopyToast
export { handleSelectionChange }
