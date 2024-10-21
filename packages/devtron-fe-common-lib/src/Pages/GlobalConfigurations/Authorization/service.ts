import { get, ResponseType, ROUTES } from '@Common/index'
import { SelectPickerOptionType } from '@Shared/Components'
import { API_TOKEN_PREFIX } from '@Shared/constants'
import { stringComparatorBySortOrder } from '@Shared/Helpers'
import { DefaultUserKey } from '@Shared/types'
import { GroupBase } from 'react-select'
import { UserMinType } from './types'
import { getUserAndApiTokenOption } from './utils'

// FIXME: Common out the typing and url from dashboard
export const getUserAndApiTokenOptions = async (): Promise<GroupBase<SelectPickerOptionType<string>>[]> => {
    const { result } = (await get(ROUTES.USER_LIST_MIN)) as ResponseType<UserMinType[]>

    if (!result) {
        return []
    }

    const sortedEmailList = result.map(({ emailId }) => emailId).sort(stringComparatorBySortOrder)

    return [
        {
            label: 'Users',
            options: sortedEmailList
                .filter((emailId) => emailId !== DefaultUserKey.system && !emailId.startsWith(API_TOKEN_PREFIX))
                .map((emailId) => getUserAndApiTokenOption(emailId)),
        },
        {
            label: 'API Tokens',
            options: sortedEmailList
                .filter((emailId) => emailId.startsWith(API_TOKEN_PREFIX))
                .map((emailId) => getUserAndApiTokenOption(emailId)),
        },
    ]
}
