import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { EmptyConfigurationSubTitle } from './constants'
import { EmptyConfigurationViewProps } from './types'

export const EmptyConfigurationView = ({ configTabType }: EmptyConfigurationViewProps) => (
    <GenericEmptyState
        title={`Send Email notifications via ${configTabType}`}
        subTitle={EmptyConfigurationSubTitle[configTabType]}
    />
)
