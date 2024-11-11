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

import { TippyCustomized } from '../../../Common/TippyCustomized'
import { TippyTheme, InfoIconTippyProps } from '../../../Common/Types'
import { ReactComponent as ICHelpOutline } from '../../../Assets/Icon/ic-help-outline.svg'
import { ReactComponent as HelpIcon } from '../../../Assets/Icon/ic-help.svg'

const InfoIconTippy = ({
    heading,
    infoText,
    iconClass = 'fcv-5',
    documentationLink,
    documentationLinkText,
    additionalContent,
    iconClassName = 'icon-dim-16 dc__no-shrink',
    placement = 'bottom',
    dataTestid = 'info-tippy-button',
    children,
    headingInfo,
}: InfoIconTippyProps) => (
    <TippyCustomized
        theme={TippyTheme.white}
        headingInfo={headingInfo}
        className="w-300 h-100 dc__no-text-transform"
        placement={placement}
        Icon={HelpIcon}
        heading={heading}
        infoText={infoText}
        iconClass={iconClass}
        showCloseButton
        trigger="click"
        interactive
        documentationLink={documentationLink}
        documentationLinkText={documentationLinkText}
        additionalContent={additionalContent}
    >
        {children || (
            <button
                type="button"
                className="p-0 dc__no-background dc__no-border dc__outline-none-imp flex dc__tab-focus dc__no-shrink"
                aria-label="Info Icon"
                data-testid={dataTestid}
            >
                <ICHelpOutline className={iconClassName} />
            </button>
        )}
    </TippyCustomized>
)

export default InfoIconTippy
