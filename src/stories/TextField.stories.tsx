import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { ComponentSizeType, CustomInput, CustomInputProps } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICKeyBulb } from '@Icons/ic-key-bulb.svg'

const meta = {
    component: CustomInput,
} satisfies Meta<CustomInputProps>

export default meta
type Story = StoryObj<typeof meta>

const TextFieldTemplate: Story = {
    render: (props) => {
        const [value, setValue] = useState<CustomInputProps['value']>(props.value)

        useEffect(() => {
            setValue(props.value)
        }, [props.value])

        const handleChange: CustomInputProps['onChange'] = (e) => {
            setValue(e.target.value)
            action('changed')(e)
        }

        return <CustomInput {...props} value={value} onChange={handleChange} />
    },
    args: {
        name: 'text-field',
        label: 'Text Field',
        value: '',
        placeholder: 'Enter value',
        onChange: null,
    },
}

export const Default: Story = {
    ...TextFieldTemplate,
}

export const WithMediumSize: Story = {
    ...Default,
    args: {
        ...Default.args,
        size: ComponentSizeType.medium,
    },
}

export const WithOnBlur: Story = {
    ...Default,
    args: {
        ...Default.args,
        onBlur: action('onBlur'),
    },
}

export const WithOnKeyDown: Story = {
    ...Default,
    args: {
        ...Default.args,
        onKeyDown: action('onKeyDown'),
    },
}

export const WithoutTrimOnBlur: Story = {
    ...Default,
    args: {
        ...Default.args,
        shouldTrim: false,
    },
}

export const WithHelperText: Story = {
    ...Default,
    args: {
        ...Default.args,
        helperText: 'Helper text goes here',
    },
}

export const WithError: Story = {
    ...Default,
    args: {
        ...Default.args,
        error: 'Error goes here',
    },
}

export const WithWarningText: Story = {
    ...Default,
    args: {
        ...Default.args,
        warningText: 'Warning goes here',
    },
}

export const WithErrorHelperAndWarningText: Story = {
    ...Default,
    args: {
        ...WithError.args,
        ...WithHelperText.args,
        ...WithWarningText.args,
    },
}

export const WithRequiredAttribute: Story = {
    ...Default,
    args: {
        ...Default.args,
        required: true,
    },
}

export const WithRowLayout: Story = {
    ...Default,
    args: {
        ...Default.args,
        layout: 'row',
    },
}

export const WithFullWidth: Story = {
    ...Default,
    args: {
        ...Default.args,
        fullWidth: true,
    },
}

export const HelperText: Story = {
    ...Default,
    args: {
        ...Default.args,
        helperText: 'Information goes here',
    },
}

export const WithDisabled: Story = {
    ...Default,
    args: {
        ...Default.args,
        disabled: true,
    },
}

export const WithOnFocus: Story = {
    ...Default,
    args: {
        ...Default.args,
        onFocus: action('onFocus'),
    },
}

export const WithAutoFocus: Story = {
    ...WithOnFocus,
    args: {
        ...WithOnFocus.args,
        autoFocus: true,
    },
}

export const WithNoTopBorderRadius: Story = {
    ...Default,
    args: {
        ...Default.args,
        borderRadiusConfig: {
            top: false,
        },
    },
}

export const WithNumberType: Story = {
    ...Default,
    args: {
        ...Default.args,
        label: 'Age',
        placeholder: 'Enter age',
        type: 'number',
    },
}

export const WithEndIcon: Story = {
    ...Default,
    args: {
        ...Default.args,
        endIconButtonConfig: {
            icon: <ICKeyBulb />,
            onClick: action('end icon clicked'),
            ariaLabel: 'End icon',
            showAriaLabelInTippy: false,
        },
    },
}
