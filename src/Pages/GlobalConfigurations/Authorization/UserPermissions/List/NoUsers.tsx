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

import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import nullStateImage from '../../../../../assets/img/empty-applist@2x.png'
import { ReactComponent as AddIcon } from '../../../../../assets/icons/ic-add.svg'
import { EMPTY_STATE_STATUS } from '../../../../../config/constantMessaging'
import { URLS } from '../../../../../config'

const renderAddUserButton = () => (
    <Link
        type="button"
        to={`${URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION}/add`}
        role="button"
        className="cta dc__gap-4 flex h-32 anchor"
    >
        <AddIcon />
        Add user
    </Link>
)

const NoUsers = () => (
    <GenericEmptyState
        image={nullStateImage}
        title={EMPTY_STATE_STATUS.NO_USER.TITLE}
        subTitle={EMPTY_STATE_STATUS.NO_USER.SUBTITLE}
        isButtonAvailable
        renderButton={renderAddUserButton}
        classname="flex-grow-1"
    />
)

export default NoUsers
