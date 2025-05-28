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

import { CollapsibleListItem } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICCheckCircleDots } from '@Icons/ic-check-circle-dots.svg'
import { ReactComponent as ICFileEdit } from '@Icons/ic-file-edit.svg'
import { ReactComponent as ICStamp } from '@Icons/ic-stamp.svg'
import { ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'

export const RESOURCE_CONFIG_STATE_TO_ICON_CONFIG_MAP: Record<
    ResourceConfigState,
    Pick<CollapsibleListItem<'navLink'>['iconConfig'], 'Icon'> & {
        tippyContent: CollapsibleListItem<'navLink'>['iconConfig']['tooltipProps']['content']
        iconClass?: string
    }
> = {
    [ResourceConfigState.ApprovalPending]: {
        Icon: ICCheckCircleDots,
        tippyContent: 'Approval Pending',
    },
    [ResourceConfigState.Draft]: {
        Icon: ICFileEdit,
        tippyContent: 'In-draft',
        iconClass: 'scv-5',
    },
    [ResourceConfigState.Published]: {
        Icon: ICStamp,
        tippyContent: 'Approval(s) will be required for configuration change',
        iconClass: 'scv-5',
    },
    [ResourceConfigState.Unnamed]: {
        Icon: ICStamp,
        tippyContent: 'Approval(s) will be required for configuration change',
        iconClass: 'scv-5',
    },
} as const
