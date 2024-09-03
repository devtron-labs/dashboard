import { ComponentSizeType, Button, ButtonStyleType, ButtonVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICCube } from '@Icons/ic-cube.svg'
// import { Button, ButtonStyleType, ButtonVariantType } from '@Pages/Shared/Button'

const BUTTON_TEXT = 'Hello world'

const ButtonPage = () => (
    <div className="flex left column dc__gap-12 p-20">
        <h1>800 variants of button</h1>
        {Object.keys(ButtonVariantType).map((buttonVariant) =>
            Object.keys(ComponentSizeType).map((size) => (
                <div className="dc__border p-8 ">
                    <h3 className="mt-0 dc__capitalize">
                        Variant: {buttonVariant}; size: {size}
                    </h3>
                    <div className="flex left dc__gap-8 flex-wrap">
                        {Object.keys(ButtonStyleType).map((style) => (
                            <div className="flex column left dc__gap-12">
                                <h5 className="w-200 m-0">{style}</h5>
                                <Button
                                    text={BUTTON_TEXT}
                                    variant={ButtonVariantType[buttonVariant]}
                                    size={ComponentSizeType[size]}
                                    style={ButtonStyleType[style]}
                                />
                                <Button
                                    text={BUTTON_TEXT}
                                    variant={ButtonVariantType[buttonVariant]}
                                    size={ComponentSizeType[size]}
                                    style={ButtonStyleType[style]}
                                    disabled
                                />
                                <Button
                                    text={BUTTON_TEXT}
                                    variant={ButtonVariantType[buttonVariant]}
                                    size={ComponentSizeType[size]}
                                    style={ButtonStyleType[style]}
                                    isLoading
                                />
                                <Button
                                    text={BUTTON_TEXT}
                                    variant={ButtonVariantType[buttonVariant]}
                                    size={ComponentSizeType[size]}
                                    startIcon={<ICCube />}
                                    style={ButtonStyleType[style]}
                                />
                                <Button
                                    text={BUTTON_TEXT}
                                    variant={ButtonVariantType[buttonVariant]}
                                    size={ComponentSizeType[size]}
                                    endIcon={<ICCube />}
                                    style={ButtonStyleType[style]}
                                />
                                <Button
                                    text={BUTTON_TEXT}
                                    variant={ButtonVariantType[buttonVariant]}
                                    size={ComponentSizeType[size]}
                                    startIcon={<ICCube />}
                                    endIcon={<ICCube />}
                                    style={ButtonStyleType[style]}
                                    disabled
                                />
                                <Button
                                    text="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
                                    variant={ButtonVariantType[buttonVariant]}
                                    size={ComponentSizeType[size]}
                                    startIcon={<ICCube />}
                                    endIcon={<ICCube />}
                                    style={ButtonStyleType[style]}
                                />
                                <Button
                                    text="With Tippy"
                                    variant={ButtonVariantType[buttonVariant]}
                                    size={ComponentSizeType[size]}
                                    startIcon={<ICCube />}
                                    endIcon={<ICCube />}
                                    style={ButtonStyleType[style]}
                                    showTippy
                                    tippyContent="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )),
        )}
    </div>
)

export default ButtonPage
