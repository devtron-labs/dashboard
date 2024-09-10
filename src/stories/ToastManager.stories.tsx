import type { Meta, StoryObj } from '@storybook/react'
import { Button, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'

type ShowToastParameters = Parameters<typeof ToastManager.showToast>

const meta = {
    title: 'Toast',
    render: ({ toastProps, toastOptions }) => {
        const handleClick = (toastVariant: ToastVariantType) => () => {
            ToastManager.showToast({ ...toastProps, variant: ToastVariantType[toastVariant] }, toastOptions)
        }

        return (
            <div className="flex flex-wrap dc__gap-8">
                {Object.keys(ToastVariantType).map((toastVariant) => (
                    <Button
                        text={`Show ${ToastVariantType[toastVariant]} toast`}
                        dataTestId={`show-toast-${ToastVariantType[toastVariant]}`}
                        onClick={handleClick(ToastVariantType[toastVariant])}
                        key={toastVariant}
                    />
                ))}
            </div>
        )
    },
} satisfies Meta<{
    toastProps: ShowToastParameters[0]
    toastOptions?: ShowToastParameters[1]
}>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        toastProps: {
            description:
                'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia aspernatur, odio vero vitae omnis quos cumque quaerat debitis minus blanditiis, autem distinctio, animi exercitationem nesciunt nostrum commodi id consequuntur unde!',
        },
        toastOptions: {
            autoClose: false,
        },
    },
}

export const WithCustomTitle: Story = {
    ...Default,
    args: {
        ...Default.args,
        toastProps: {
            ...Default.args.toastProps,
            title: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure animi possimus, itaque commodi perspiciatis omnis adipisci, eum voluptatem facilis exercitationem voluptate aspernatur dolorem quasi! Odio, voluptates! Quas ipsum quaerat enim? Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure animi possimus, itaque commodi perspiciatis omnis adipisci, eum voluptatem facilis exercitationem voluptate aspernatur dolorem quasi! Odio, voluptates! Quas ipsum quaerat enim?',
        },
    },
}

export const WithButton: Story = {
    ...Default,
    args: {
        ...Default.args,
        toastProps: {
            ...Default.args.toastProps,
            buttonProps: {
                dataTestId: 'button',
                text: 'Reload',
            },
        },
    },
}

export const WithCustomTitleAndButton: Story = {
    ...Default,
    args: {
        ...Default.args,
        toastProps: {
            ...WithCustomTitle.args.toastProps,
            ...WithButton.args.toastProps,
        },
    },
}
