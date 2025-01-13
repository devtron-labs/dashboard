import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { EmptyConfigurationSubTitle } from './constants'
import { EmptyConfigurationViewProps } from './types'
import { AddConfigurationButton } from './AddConfigurationButton'

export const EmptyConfigurationView = ({ activeTab, image }: EmptyConfigurationViewProps) => {
    const renderButton = () => <AddConfigurationButton activeTab={activeTab} />
    return (
        <GenericEmptyState
            image={image}
            title={`Send Email notifications via ${activeTab}`}
            subTitle={EmptyConfigurationSubTitle[activeTab]}
            imageClassName="w-160--imp dc__height-auto--imp"
            renderButton={renderButton}
            isButtonAvailable
        />
    )
}
