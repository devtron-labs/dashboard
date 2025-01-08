import { Checkbox, CHECKBOX_VALUE } from '@devtron-labs/devtron-fe-common-lib'
import { DefaultCheckboxProps } from './types'

export const DefaultCheckbox = ({ shouldBeDefault, handleCheckbox, isDefault }: DefaultCheckboxProps) => (
    <Checkbox
        isChecked={isDefault}
        value={CHECKBOX_VALUE.CHECKED}
        disabled={shouldBeDefault}
        onChange={handleCheckbox}
        dataTestId="add-ses-default-checkbox"
        name="default"
        rootClassName="cn-9 fs-13"
    >
        Set as default configuration to send emails
    </Checkbox>
)
