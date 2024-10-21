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

import { ReactComponent as ErrorIcon } from '../../../Assets/Icon/ic-error-exclamation.svg'
import { ReactComponent as InfoIcon } from '../../../Assets/Icon/ic-exclamation.svg'
import { GenericSectionErrorStateProps } from './types'

const GenericSectionErrorState = ({
    reload,
    withBorder = false,
    title = 'Failed to load',
    subTitle = 'We could not load the information on this page.',
    description = 'Please reload or try again later',
    buttonText = 'Reload',
    rootClassName,
    useInfoIcon = false,
}: GenericSectionErrorStateProps) => (
    <div className={`flex column dc__gap-8 p-16 ${withBorder ? 'dc__border br-4' : ''} ${rootClassName || ''}`}>
        {useInfoIcon ? (
            <InfoIcon className="icon-dim-24 fcn-6" />
        ) : (
            <ErrorIcon className="icon-dim-24 alert-icon-r5-imp" />
        )}
        <div className="flex column dc__gap-4 dc__align-center">
            <h3 className="fs-13 lh-20 fw-6 cn-9 m-0">{title}</h3>
            <div className="flex column fs-13 lh-20 fw-4 cn-7">
                {subTitle && <p className="m-0">{subTitle}</p>}
                {description && <p className="m-0">{description}</p>}
            </div>
        </div>

        {reload && (
            <button
                type="button"
                className="cta text h-20 fs-13 lh-20-imp"
                onClick={reload}
                data-testid="generic-section-reload-button"
            >
                {buttonText}
            </button>
        )}
    </div>
)

export default GenericSectionErrorState
