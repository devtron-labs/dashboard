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

import { Button, ButtonStyleType, ButtonVariantType, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { HeaderSectionProps } from './types'

const HeaderSection = ({ isJobView, handleClose, isCloseDisabled }: HeaderSectionProps) => (
    <div className="flex flex-align-center flex-justify border__primary--bottom py-12 px-20">
        <h2 className="fs-16 fw-6 lh-1-43 m-0">Create {isJobView ? 'Job' : 'Devtron Application'}</h2>
        <Button
            onClick={handleClose}
            dataTestId={`close-create-custom${isJobView ? 'job' : 'app'}-wing`}
            icon={<ICClose />}
            disabled={isCloseDisabled}
            ariaLabel="Close"
            showAriaLabelInTippy={false}
            style={ButtonStyleType.negativeGrey}
            size={ComponentSizeType.small}
            variant={ButtonVariantType.borderLess}
        />
    </div>
)

export default HeaderSection
