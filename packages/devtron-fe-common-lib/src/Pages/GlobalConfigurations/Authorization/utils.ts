import { SelectPickerOptionType } from '@Shared/Components'
import { API_TOKEN_PREFIX } from '@Shared/constants'

export const getUserAndApiTokenOption = (emailId: string): SelectPickerOptionType<string> => ({
    label: emailId.startsWith(API_TOKEN_PREFIX) ? emailId.split(':')[1] : emailId,
    value: emailId,
})
