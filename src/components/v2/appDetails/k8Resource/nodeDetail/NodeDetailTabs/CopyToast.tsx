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

import { copyToClipboard, noop } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as CheckIcon } from '../../../../assets/icons/ic-check.svg'
import 'xterm/css/xterm.css'
import './nodeDetailTab.scss'

interface toastType {
    showCopyToast: boolean
}

const CopyToast = ({ showCopyToast }: toastType) => (
    <span
        className={`br-8 bg__primary cn-9 clipboard-toast ${showCopyToast ? 'clipboard-toast--show' : ''}`}
        style={{ zIndex: 9 }}
    >
        <CheckIcon className="icon-dim-24 scn-9" />
        <div className="">Copied!</div>
    </span>
)

function handleSelectionChange(terminal, setPopupText): void {
    terminal.onSelectionChange(() => {
        const selectedText = terminal.getSelection()

        if (!selectedText) {
            return
        }

        copyToClipboard(selectedText)
            .then(() => {
                setPopupText(true)
            })
            .catch(noop)
    })
}

export default CopyToast
export { handleSelectionChange }
