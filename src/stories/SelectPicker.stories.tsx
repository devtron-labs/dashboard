import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import {
    ComponentSizeType,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerProps,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICCube } from '@Icons/ic-cube.svg'
import { ReactComponent as ICEnv } from '@Icons/ic-env.svg'

const meta = {
    component: SelectPicker,
} satisfies Meta<SelectPickerProps>

export default meta
type Story = StoryObj<typeof meta>

const options: SelectPickerOptionType[] = [
    {
        label: 'Label 1',
        value: 'Label 1',
    },
    {
        label: 'Label 2',
        value: 'Label 2',
    },
]

export const Default: Story = {
    args: {
        inputId: 'select-picker',
        label: 'Select Picker Label',
        options,
        onChange: action('clicked'),
    },
}

export const DescriptionInOptions: Story = {
    ...Default,
    args: {
        ...Default.args,
        options: options.map((option, index) => ({
            ...option,
            description: `Description ${index}`,
        })),
    },
}

export const StartIconInOptions: Story = {
    ...Default,
    args: {
        ...Default.args,
        options: options.map((option, index) => ({
            ...option,
            startIcon: <ICEnv />,
            description: `Description ${index}`,
        })),
    },
}

export const EndIconIconInOptions: Story = {
    ...Default,
    args: {
        ...Default.args,
        options: options.map((option, index) => ({
            ...option,
            endIcon: <ICEnv />,
            description: `Description ${index}`,
        })),
    },
}

export const HideSelectedOptionIcon: Story = {
    ...Default,
    args: {
        ...Default.args,
        options: options.map((option, index) => ({
            ...option,
            startIcon: <ICEnv />,
            description: `Description ${index}`,
        })),
        showSelectedOptionIcon: false,
    },
}

export const LargeSize: Story = {
    ...Default,
    args: {
        ...Default.args,
        size: ComponentSizeType.large,
    },
}

export const IconInControl: Story = {
    ...Default,
    args: {
        ...Default.args,
        icon: <ICCube className="scb-5" />,
    },
}

export const MediumMenuListWidth: Story = {
    ...Default,
    args: {
        ...Default.args,
        menuSize: ComponentSizeType.medium,
    },
}

export const LargeMenuListWidth: Story = {
    ...Default,
    args: {
        ...Default.args,
        menuSize: ComponentSizeType.large,
    },
}

export const Required: Story = {
    ...Default,
    args: {
        ...Default.args,
        required: true,
    },
}
export const CustomLabel: Story = {
    ...Default,
    args: {
        ...Default.args,
        label: 'Custom Label',
    },
}
export const ErrorState: Story = {
    ...Default,
    args: {
        ...Default.args,
        error: 'Something went wrong',
    },
}

export const HelperText: Story = {
    ...Default,
    args: {
        ...Default.args,
        helperText: 'Information goes here',
    },
}

export const MenuListFooter: Story = {
    ...Default,
    args: {
        ...Default.args,
        renderMenuListFooter: () => (
            <div className="px-8 py-6 dc__border-top bg__secondary cn-6">
                <div>Foot note</div>
            </div>
        ),
    },
}

export const Loading: Story = {
    ...Default,
    args: {
        ...Default.args,
        isLoading: true,
    },
}

export const Disabled: Story = {
    ...Default,
    args: {
        ...Default.args,
        isDisabled: true,
    },
}

export const ClearableSelectedOption: Story = {
    ...Default,
    args: {
        ...Default.args,
        isClearable: true,
    },
}

export const ShowSelectedOptionsCount: Story = {
    ...Default,
    args: {
        ...Default.args,
        showSelectedOptionIcon: true,
    },
}

export const MultiSelect: Story = {
    ...Default,
    args: {
        ...Default.args,
        isMulti: true,
    },
}

export const CreatableMultiSelect: Story = {
    ...Default,
    args: {
        ...Default.args,
        isMulti: true,
        isCreatable: true,
    },
}

export const MultiSelectWithGroupHeadingSelectable: Story = {
    ...Default,
    args: {
        ...Default.args,
        isMulti: true,
        multiSelectProps: {
            isGroupHeadingSelectable: true,
        },
        options: [
            {
                label: 'Group 1',
                options,
            },
        ],
    },
}

export const RenderCustomOptions: Story = {
    ...Default,
    args: {
        ...Default.args,
        shouldRenderCustomOptions: true,
        renderCustomOptions: () => <div className="p-8">Custom Option</div>,
    },
}

export const AlignMenuFromRight: Story = {
    ...Default,
    args: {
        ...Default.args,
        shouldMenuAlignRight: true,
    },
}

export const FullWidth: Story = {
    ...Default,
    args: {
        ...Default.args,
        fullWidth: true,
    },
}

export const CustomPlaceholder: Story = {
    ...Default,
    args: {
        ...Default.args,
        placeholder: 'Custom Placeholder',
    },
}
