import { useState } from 'react'
import {
    BaseConfirmationModal,
    Button,
    ButtonVariantType,
    ConfirmationModal,
    ConfirmationModalProps,
    ConfirmationModalProvider,
    ConfirmationModalVariantType,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import type { Meta, StoryObj } from '@storybook/react'

const TITLE = 'Title'
const SUB_TITLE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus.'
const VARIANTS = Object.values(ConfirmationModalVariantType)

type BaseComponentPropsType = Omit<ConfirmationModalProps, 'handleClose' | 'showConfirmationModal'>

const BaseComponent = ({
    title,
    subtitle,
    Icon,
    variant,
    buttonConfig,
    confirmationConfig,
    children,
}: BaseComponentPropsType) => {
    const [showDialog, setShowDialog] = useState<boolean>(false)
    const handleOpen = () => setShowDialog(true)
    const handleClose = () => setShowDialog(false)

    return (
        <ConfirmationModalProvider>
            <Button
                dataTestId="open-modal"
                text={`Open ${variant} modal`}
                onClick={handleOpen}
                variant={ButtonVariantType.text}
            />

            {showDialog && (
                <ConfirmationModal
                    title={title}
                    subtitle={subtitle}
                    confirmationConfig={confirmationConfig}
                    handleClose={handleClose}
                    // If variant is custom then can provide icon
                    {...(variant === ConfirmationModalVariantType.custom
                        ? {
                              variant: ConfirmationModalVariantType.custom,
                              Icon,
                              buttonConfig,
                          }
                        : {
                              variant,
                              buttonConfig,
                          })}
                >
                    {children}
                </ConfirmationModal>
            )}

            <BaseConfirmationModal />
        </ConfirmationModalProvider>
    )
}

const meta = {
    component: BaseComponent,
    argTypes: {
        variant: {
            options: VARIANTS.filter((variant) => variant !== ConfirmationModalVariantType.custom),
            control: { type: 'radio' },
        },
    },
} satisfies Meta<ConfirmationModalProps>

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        title: TITLE,
        subtitle: SUB_TITLE,
        variant: ConfirmationModalVariantType.info,
        buttonConfig: {
            primaryButtonConfig: {
                isLoading: false,
                text: 'Button',
                onClick: () => {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Primary button clicked',
                    })
                },
            },
            secondaryButtonConfig: {
                text: 'Button',
                onClick: () => {
                    ToastManager.showToast({
                        variant: ToastVariantType.info,
                        description: 'Secondary button clicked',
                    })
                },
            },
        },
    } satisfies BaseComponentPropsType,
}

export const WithConfirmationInput: Story = {
    args: {
        ...Default.args,
        variant: ConfirmationModalVariantType.delete,
        confirmationConfig: {
            identifier: 'Confirm me',
            confirmationKeyword: 'Confirm me',
        },
    } satisfies BaseComponentPropsType,
}

export default meta
