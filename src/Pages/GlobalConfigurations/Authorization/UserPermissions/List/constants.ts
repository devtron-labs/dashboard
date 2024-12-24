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

import { DefaultUserKey } from '@devtron-labs/devtron-fe-common-lib'
import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS } from '../../../../../config'
import { User } from '../../types'
import { getDefaultUserStatusAndTimeout } from '../../libUtils'

export const userListLoading: User[] = Array.from(Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys()).map((index) => ({
    id: index,
    emailId: '',
    roleFilters: [],
    userRoleGroups: [],
    userGroups: [],
    superAdmin: false,
    createdOn: '',
    updatedOn: '',
    isDeleted: false,
    ...getDefaultUserStatusAndTimeout(),
}))

export const DEFAULT_USER_TOOLTIP_CONTENT: Record<DefaultUserKey, string> = {
    [DefaultUserKey.admin]:
        'Actions performed by the administrator user are logged under the ‘admin’ user for auditing.',
    [DefaultUserKey.system]: 'Automated actions performed in Devtron are logged under the ‘system’ user for auditing.',
}
