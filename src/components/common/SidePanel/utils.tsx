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

import {
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ComponentSizeType,
    CONTACT_SUPPORT_LINK,
    OPEN_NEW_TICKET,
    SidePanelTab,
} from '@devtron-labs/devtron-fe-common-lib'

export const renderOpenTicketButton = () => (
    <div className="flexbox-col dc__gap-12">
        <Button
            dataTestId="open-ai-integration-ticket"
            size={ComponentSizeType.medium}
            component={ButtonComponentType.anchor}
            text="Open Ticket"
            anchorProps={{
                href: OPEN_NEW_TICKET,
            }}
        />
        <Button
            dataTestId="contact-support"
            component={ButtonComponentType.anchor}
            text="Contact Support"
            anchorProps={{
                href: CONTACT_SUPPORT_LINK,
            }}
            variant={ButtonVariantType.text}
        />
    </div>
)

export const getContentWrapperClassNameForTab = (tab: SidePanelTab, expected: SidePanelTab) =>
    `flexbox-col dc__overflow-hidden ${tab !== expected ? 'side-panel-content--hidden' : 'flex-grow-1'}`
