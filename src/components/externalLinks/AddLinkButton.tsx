import { Button, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Add } from '@Icons/ic-add.svg'
import { AddLinkButtonProps } from './ExternalLinks.type'

export const AddLinkButton = ({ handleOnClick }: AddLinkButtonProps) => (
    <Button
        dataTestId="external-links-add-link"
        text="Add Link"
        size={ComponentSizeType.medium}
        startIcon={<Add />}
        onClick={handleOnClick}
    />
)
