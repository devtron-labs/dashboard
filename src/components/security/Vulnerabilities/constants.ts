import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import { VulnerabilityViewTypes } from './types'

export const VULNERABILITY_VIEW_TYPE_SELECT_OPTIONS: SelectPickerOptionType<VulnerabilityViewTypes>[] = [
    { label: 'Deployments', value: VulnerabilityViewTypes.DEPLOYMENTS },
    { label: 'Vulnerabilities', value: VulnerabilityViewTypes.VULNERABILITIES },
]
