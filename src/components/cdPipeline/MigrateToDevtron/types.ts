import { MigrateFromArgoFormState } from '../cdPipeline.types'
import { BuildCDProps } from '../types'

export interface MigrateFromArgoProps
    extends Pick<BuildCDProps, 'setMigrateToDevtronFormState' | 'migrateToDevtronFormState'> {}

export interface MigrateToDevtronValidationFactoryProps extends Pick<MigrateFromArgoFormState, 'validationResponse'> {
    refetchValidationResponse: () => void
    appName: string
}
