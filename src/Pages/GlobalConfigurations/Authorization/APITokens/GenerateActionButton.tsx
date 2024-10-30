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

import { ButtonWithLoader } from '@devtron-labs/devtron-fe-common-lib'
import { GenerateActionButtonType } from './apiToken.type'

const GenerateActionButton = ({ loader, onCancel, onSave, buttonText, regenerateButton }: GenerateActionButtonType) => (
    <div
        className={`modal__buttons w-100 pl-16 pt-16 pr-16 flex ${
            regenerateButton ? 'right ml-auto' : 'left ml-0'
        } dc__border-top-n1`}
    >
        <ButtonWithLoader
            rootClassName={`flex cta cancel h-36 ${regenerateButton ? 'mr-12 order-first' : 'order-second'}`}
            onClick={onCancel}
            disabled={loader}
            dataTestId="cancel-token"
            isLoading={false}
        >
            Cancel
        </ButtonWithLoader>
        <ButtonWithLoader
            rootClassName={`flex cta h-36 ${regenerateButton ? 'order-second' : 'mr-12 order-first'}`}
            onClick={onSave}
            disabled={loader}
            isLoading={loader}
            dataTestId={buttonText.toLowerCase().replace(' ', '-')}
        >
            {buttonText}
        </ButtonWithLoader>
    </div>
)

export default GenerateActionButton
