import { Button, ButtonVariantType, ComponentSizeType, useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { ReactComponent as Add } from '@Icons/ic-add.svg'
import { getTabText } from './notifications.util'
import { AddConfigurationButtonProps } from './types'

export const AddConfigurationButton = ({ activeTab }: AddConfigurationButtonProps) => {
    const { searchParams } = useSearchString()
    const history = useHistory()

    const handleAddClick = () => {
        const newParams = {
            ...searchParams,
            modal: activeTab,
            configId: '0',
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    return (
        <Button
            onClick={handleAddClick}
            variant={ButtonVariantType.primary}
            size={ComponentSizeType.small}
            dataTestId={`${activeTab}-add-button`}
            startIcon={<Add />}
            text={`Add ${getTabText(activeTab)}`}
        />
    )
}
