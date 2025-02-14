import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import {
    CustomInputProps,
    DEFAULT_SECRET_PLACEHOLDER,
    PasswordField,
    PasswordFieldProps,
} from '@devtron-labs/devtron-fe-common-lib'

const meta = {
    component: PasswordField,
} satisfies Meta<CustomInputProps | PasswordFieldProps>

export default meta
type Story = StoryObj<typeof meta>

const PasswordFieldTemplate: Story = {
    render: (props) => {
        const [value, setValue] = useState<CustomInputProps['value']>(props.value)

        useEffect(() => {
            setValue(props.value)
        }, [props.value])

        const handleChange: CustomInputProps['onChange'] = (e) => {
            setValue(e.target.value)
            action('changed')(e)
        }

        return <PasswordField {...props} value={value} onChange={handleChange} />
    },
    args: {
        name: 'password-field',
        label: 'Password',
        value: '',
        placeholder: 'Enter password',
        onChange: null,
        shouldShowDefaultPlaceholderOnBlur: false,
    },
}

export const DoNotShowDefaultPlaceholderOnBlur: Story = {
    ...PasswordFieldTemplate,
}

export const ShowDefaultPlaceholderOnBlur: Story = {
    ...PasswordFieldTemplate,
    args: {
        ...PasswordFieldTemplate.args,
        shouldShowDefaultPlaceholderOnBlur: true,
        value: DEFAULT_SECRET_PLACEHOLDER,
    },
}
