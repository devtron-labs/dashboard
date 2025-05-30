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

import { Button, ButtonComponentType, ComponentSizeType, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'

import nullStateImage from '@Images/empty-list.png'

import { ReactComponent as AddIcon } from '../../../../../assets/icons/ic-add.svg'
import { URLS } from '../../../../../config'
import { EMPTY_STATE_STATUS } from '../../../../../config/constantMessaging'

const renderAddGroupButton = () => (
    <Button
        text="Add group"
        startIcon={<AddIcon />}
        component={ButtonComponentType.link}
        linkProps={{
            to: `${URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS}/add`,
        }}
        size={ComponentSizeType.medium}
        dataTestId="add-permission-group-link"
    />
)

const NoPermissionGroups = () => (
    <GenericEmptyState
        image={nullStateImage}
        title={EMPTY_STATE_STATUS.NO_GROUPS.TITLE}
        subTitle={EMPTY_STATE_STATUS.NO_GROUPS.SUBTITLE}
        isButtonAvailable
        renderButton={renderAddGroupButton}
        classname="flex-grow-1"
    />
)

export default NoPermissionGroups
