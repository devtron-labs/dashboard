import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { ComponentSizeType, Textarea, TextareaProps } from '@devtron-labs/devtron-fe-common-lib'
import { useEffect, useState } from 'react'

const meta = {
    component: Textarea,
} satisfies Meta<TextareaProps>

export default meta
type Story = StoryObj<typeof meta>

const TextareaTemplate: Story = {
    render: (props) => {
        const [value, setValue] = useState<TextareaProps['value']>(props.value)

        useEffect(() => {
            setValue(props.value)
        }, [props.value])

        const handleChange: TextareaProps['onChange'] = (e) => {
            setValue(e.target.value)
            action('changed')(e)
        }

        return <Textarea {...props} value={value} onChange={handleChange} />
    },
    args: {
        name: 'textarea',
        label: 'Description',
        value: '',
        placeholder: 'Enter description',
    } as TextareaProps,
}

export const Default: Story = {
    ...TextareaTemplate,
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

export const WithLargeValueForAutoExpansion: Story = {
    ...Default,
    args: {
        ...Default.args,
        value: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
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
