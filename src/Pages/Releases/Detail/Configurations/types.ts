import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import {
    AppConfigState,
    EnvironmentOptionType,
} from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'

interface AppOptionType extends Omit<SelectPickerOptionType<number>, 'label'> {
    label: string
}

export interface ReleaseConfigurationContextType extends Pick<AppConfigState, 'envIdToEnvApprovalConfigMap'> {
    environments: EnvironmentOptionType[]
    applications: AppOptionType[]
    reloadEnvironments: () => void
    isAppListLoading: boolean
    isEnvListLoading: boolean
}
