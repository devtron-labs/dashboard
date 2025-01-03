import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { EmptyConfigurationSubTitle } from './constants'
import { EmptyConfigurationViewProps } from './types'

export const EmptyConfigurationView = ({ configTabType, image }: EmptyConfigurationViewProps) => (
    <GenericEmptyState
        image={image}
        title={`Send Email notifications via ${configTabType}`}
        subTitle={EmptyConfigurationSubTitle[configTabType]}
        imageClassName="dc__w-fit-content--imp dc__height-auto--imp"
    />
)
