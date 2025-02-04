import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'
import { MigrateFromArgoFormState } from '../cdPipeline.types'
import { BuildCDProps } from '../types'

export interface MigrateFromArgoProps
    extends Pick<BuildCDProps, 'setMigrateToDevtronFormState' | 'migrateToDevtronFormState'> {}

export interface MigrateToDevtronValidationFactoryProps extends Pick<MigrateFromArgoFormState, 'validationResponse'> {
    refetchValidationResponse: () => void
    appName: string
}

export type SelectClusterOptionType = SelectPickerOptionType<number>
export type SelectArgoAppOptionType = SelectPickerOptionType<Pick<MigrateFromArgoFormState, 'appName' | 'namespace'>>
