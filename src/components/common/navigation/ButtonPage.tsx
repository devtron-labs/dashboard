import {
    ComponentSizeType,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ButtonComponentType,
    ButtonProps,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICDeleteInteractive } from '@Icons/ic-delete-interactive.svg'
import { ReactComponent as ICAbort } from '@Icons/ic-abort.svg'
import { LinkProps } from 'react-router-dom'

const BUTTON_TEXT = 'Hello world'

const linkProps: LinkProps = {
    to: '#',
    target: '_blank',
}

const Template = ({ text, icon, ariaLabel }: Pick<ButtonProps, 'text' | 'icon' | 'ariaLabel'>) => (
    <div className="flex left column dc__gap-12 p-20">
        {Object.keys(ButtonComponentType).map((buttonComponent) =>
            Object.keys(ButtonVariantType).map((buttonVariant) =>
                Object.keys(ComponentSizeType).map((size) => (
                    <div className="dc__border p-8 br-4">
                        <div className="mt-0 dc__capitalize">
                            Variant: {ButtonVariantType[buttonVariant]}; size: {ComponentSizeType[size]}; component:{' '}
                            {ButtonComponentType[buttonComponent]}
                        </div>
                        <div className="flex left dc__gap-8 flex-wrap">
                            {Object.keys(ButtonStyleType).map((style) => (
                                <div className="flex column left dc__gap-12">
                                    <div className="w-200 dc__capitalize">{ButtonStyleType[style]}</div>
                                    <Button
                                        variant={ButtonVariantType[buttonVariant]}
                                        size={ComponentSizeType[size]}
                                        style={ButtonStyleType[style]}
                                        dataTestId={`${buttonVariant}-${size}-${style}-1`}
                                        onClick={noop}
                                        component={ButtonComponentType[buttonComponent]}
                                        linkProps={linkProps}
                                        {...(text
                                            ? { text }
                                            : {
                                                  icon,
                                                  ariaLabel,
                                              })}
                                    />
                                    <Button
                                        variant={ButtonVariantType[buttonVariant]}
                                        size={ComponentSizeType[size]}
                                        style={ButtonStyleType[style]}
                                        disabled
                                        dataTestId={`${buttonVariant}-${size}-${style}-2`}
                                        onClick={noop}
                                        component={ButtonComponentType[buttonComponent]}
                                        linkProps={linkProps}
                                        {...(text
                                            ? { text }
                                            : {
                                                  icon,
                                                  ariaLabel,
                                              })}
                                    />
                                    <Button
                                        variant={ButtonVariantType[buttonVariant]}
                                        size={ComponentSizeType[size]}
                                        style={ButtonStyleType[style]}
                                        isLoading
                                        dataTestId={`${buttonVariant}-${size}-${style}-3`}
                                        onClick={noop}
                                        component={ButtonComponentType[buttonComponent]}
                                        linkProps={linkProps}
                                        {...(text
                                            ? { text }
                                            : {
                                                  icon,
                                                  ariaLabel,
                                              })}
                                    />
                                    <Button
                                        variant={ButtonVariantType[buttonVariant]}
                                        size={ComponentSizeType[size]}
                                        style={ButtonStyleType[style]}
                                        dataTestId={`${buttonVariant}-${size}-${style}-4`}
                                        onClick={noop}
                                        component={ButtonComponentType[buttonComponent]}
                                        linkProps={linkProps}
                                        {...(text
                                            ? {
                                                  text,
                                                  startIcon: <ICDeleteInteractive />,
                                              }
                                            : {
                                                  icon,
                                                  ariaLabel,
                                              })}
                                    />
                                    <Button
                                        variant={ButtonVariantType[buttonVariant]}
                                        size={ComponentSizeType[size]}
                                        style={ButtonStyleType[style]}
                                        dataTestId={`${buttonVariant}-${size}-${style}-5`}
                                        onClick={noop}
                                        component={ButtonComponentType[buttonComponent]}
                                        linkProps={linkProps}
                                        {...(text
                                            ? {
                                                  text,
                                                  endIcon: <ICDeleteInteractive />,
                                              }
                                            : {
                                                  icon,
                                                  ariaLabel,
                                              })}
                                    />
                                    <Button
                                        variant={ButtonVariantType[buttonVariant]}
                                        size={ComponentSizeType[size]}
                                        style={ButtonStyleType[style]}
                                        disabled
                                        dataTestId={`${buttonVariant}-${size}-${style}-6`}
                                        onClick={noop}
                                        component={ButtonComponentType[buttonComponent]}
                                        linkProps={linkProps}
                                        {...(text
                                            ? {
                                                  text,
                                                  startIcon: <ICDeleteInteractive />,
                                                  endIcon: <ICDeleteInteractive />,
                                              }
                                            : {
                                                  icon,
                                                  ariaLabel,
                                              })}
                                    />
                                    <Button
                                        variant={ButtonVariantType[buttonVariant]}
                                        size={ComponentSizeType[size]}
                                        style={ButtonStyleType[style]}
                                        showTooltip
                                        tooltipProps={{
                                            content:
                                                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
                                        }}
                                        dataTestId={`${buttonVariant}-${size}-${style}-7`}
                                        onClick={noop}
                                        component={ButtonComponentType[buttonComponent]}
                                        linkProps={linkProps}
                                        {...(text
                                            ? {
                                                  text,
                                                  startIcon: <ICDeleteInteractive />,
                                                  endIcon: <ICDeleteInteractive />,
                                              }
                                            : {
                                                  icon,
                                                  ariaLabel,
                                              })}
                                    />
                                    <Button
                                        variant={ButtonVariantType[buttonVariant]}
                                        size={ComponentSizeType[size]}
                                        style={ButtonStyleType[style]}
                                        dataTestId={`${buttonVariant}-${size}-${style}-8`}
                                        onClick={noop}
                                        component={ButtonComponentType[buttonComponent]}
                                        linkProps={linkProps}
                                        {...(text
                                            ? {
                                                  text,
                                                  startIcon: <ICDeleteInteractive />,
                                                  endIcon: <ICDeleteInteractive />,
                                              }
                                            : {
                                                  icon,
                                                  ariaLabel,
                                              })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )),
            ),
        )}
    </div>
)

export const Default = () => <Template text={BUTTON_TEXT} />

export const StrokeIconButton = () => <Template icon={<ICDeleteInteractive />} ariaLabel={BUTTON_TEXT} />

export const FillIconButton = () => <Template icon={<ICAbort />} ariaLabel={BUTTON_TEXT} />

const ButtonPage = () => (
    <div className="flex left column dc__gap-12 p-20">
        <div className="dc__border-n1 p-8 br-4">
            <h2 className="mt-0">Stroke Icon Button</h2>
            <StrokeIconButton />
        </div>
        <div className="dc__border-n1 p-8 br-4">
            <h2 className="mt-0">Fill Icon Button</h2>
            <FillIconButton />
        </div>
        <div className="dc__border-n1 p-8 br-4">
            <h2 className="mt-0">Buttons</h2>
            <Default />
        </div>
    </div>
)

export default ButtonPage
