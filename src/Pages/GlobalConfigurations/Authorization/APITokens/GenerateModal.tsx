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

import { useState } from 'react'

import {
    ClipboardButton,
    copyToClipboard,
    GenericModal,
    Icon,
    InfoBlock,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'

import { GenerateTokenModalType } from './apiToken.type'

const GenerateModal = ({
    close,
    token,
    reload,
    redirectToTokenList,
    isRegenerationModal,
    open,
}: GenerateTokenModalType) => {
    const [copyToClipboardPromise, setCopyToClipboardPromise] = useState<ReturnType<typeof copyToClipboard>>(null)
    const modelType = isRegenerationModal ? 'Regenerated' : 'Generated'
    const handleCloseButton = () => {
        close()
        reload()
        redirectToTokenList()
    }

    const handleCopyToClipboard = async (e: React.MouseEvent) => {
        stopPropagation(e)
        setCopyToClipboardPromise(copyToClipboard(token))
    }

    return (
        <GenericModal
            name="create-ci-cd-pipeline-modal"
            open={open}
            width={600}
            onClose={handleCloseButton}
            onEscape={handleCloseButton}
        >
            <GenericModal.Header title={`API Token ${modelType}`} />
            <GenericModal.Body>
                <div className="flexbox-col dc__gap-20 p-20">
                    <div className="flexbox-col dc__gap-4">
                        <h5 className="m-0 cn-9 lh-1-5 fw-6">
                            Copy and store this token safely, you won’t be able to view it again.
                        </h5>
                        <p className="cn-7 fs-12 lh-1-5 m-0">
                            You can regenerate a token anytime. If you do, remember to update any scripts or
                            applications using the old token.
                        </p>
                    </div>

                    <InfoBlock
                        heading="API Token"
                        description={token}
                        variant="success"
                        customIcon={<Icon name="ic-key" color="G500" />}
                    />
                </div>
            </GenericModal.Body>
            <GenericModal.Footer
                buttonConfig={{
                    primaryButton: {
                        dataTestId: 'copy-token',
                        startIcon: <ClipboardButton content={token} copyToClipboardPromise={copyToClipboardPromise} />,
                        text: 'Copy token',
                        onClick: handleCopyToClipboard,
                    },
                }}
            />
        </GenericModal>
    )
}

export default GenerateModal
