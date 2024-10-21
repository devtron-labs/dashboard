import { Button, ButtonStyleType, ButtonVariantType } from '@Shared/Components'
import { ComponentSizeType } from '@Shared/constants'
import { ToastProps } from './types'

export const ToastContent = ({
    title,
    description,
    buttonProps,
}: Pick<ToastProps, 'title' | 'description' | 'buttonProps'>) => (
    <div className="flexbox-col dc__gap-8 custom-toast__content">
        <div className="flexbox-col dc__gap-4">
            <h3 className="m-0 fs-13 fw-6 lh-20 cn-0 dc__ellipsis-right__2nd-line">{title}</h3>
            <p className="fs-12 fw-4 lh-18 m-0 dc__truncate--clamp-6">{description}</p>
        </div>
        {buttonProps && (
            <Button
                {...buttonProps}
                variant={ButtonVariantType.text}
                size={ComponentSizeType.small}
                style={ButtonStyleType.neutral}
            />
        )}
    </div>
)
