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

import { GenericModal, InfoBlock } from '@devtron-labs/devtron-fe-common-lib'

import { VARIABLE_IN_USE_MODAL_DESCRIPTION, VARIABLE_IN_USE_MODAL_TITLE } from './constants'
import { VariablesInUseErrorModalProps } from './types'

const VariablesInUseErrorModal = ({ errors, handleClose }: VariablesInUseErrorModalProps) => (
    <GenericModal
        name="scoped-variables-in-use-error-modal"
        open
        width={600}
        onClose={handleClose}
        onEscape={handleClose}
    >
        <GenericModal.Header title={VARIABLE_IN_USE_MODAL_TITLE} />
        <GenericModal.Body>
            <div className="flexbox-col dc__gap-16 p-20 dc__overflow-auto mxh-400">
                <InfoBlock variant="error" description={VARIABLE_IN_USE_MODAL_DESCRIPTION} />
                {errors.map((error, idx) => (
                    <p
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${idx}-${error.userMessage}`}
                        className="m-0 fs-13 fw-6 cn-9 lh-1-5 dc__first-letter-capitalize"
                    >
                        {error.userMessage}
                    </p>
                ))}
            </div>
        </GenericModal.Body>
        <GenericModal.Footer
            buttonConfig={{
                secondaryButton: {
                    dataTestId: 'variables-in-use-error-close-btn',
                    text: 'Close',
                    onClick: handleClose,
                },
            }}
        />
    </GenericModal>
)

export default VariablesInUseErrorModal
