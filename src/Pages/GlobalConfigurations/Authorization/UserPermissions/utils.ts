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
import { importComponentFromFELibrary, validateEmail } from '../../../../components/common'
import { authorizationSelectStyles } from '../constants'
import { User } from '../types'
import { UserListFilter } from './List/types'

const getStatusFromSearchParams = importComponentFromFELibrary('getStatusFromSearchParams', null, 'function')

export const getIsAdminOrSystemUser = (userEmail: User['emailId']): boolean =>
    userEmail === DefaultUserKey.admin || userEmail === DefaultUserKey.system

export const parseSearchParams = (searchParams: URLSearchParams): UserListFilter => ({
    status: getStatusFromSearchParams ? getStatusFromSearchParams(searchParams) : [],
})

export const getCreatableChipStyle = () => ({
    ...authorizationSelectStyles,
    multiValue: (base, state) => ({
        ...base,
        border: validateEmail(state.data.value) ? `1px solid var(--N200)` : `1px solid var(--R500)`,
        borderRadius: `4px`,
        background: validateEmail(state.data.value) ? 'white' : 'var(--R100)',
        height: '28px',
        margin: 0,
        paddingLeft: '2px 4px',
        fontSize: '12px',
    }),
    control: (base, state) => ({
        ...authorizationSelectStyles.control(base, state),
        minHeight: '36px',
        height: 'auto',
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: '34px',
    }),
    valueContainer: (base) => ({
        ...authorizationSelectStyles.valueContainer(base),
        gap: '4px',
        paddingBlock: '4px',
    }),
})
