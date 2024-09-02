import { ComponentSizeType, ButtonStyleType, ButtonVariantType, Button } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICCube } from '@Icons/ic-cube.svg'

const BUTTON_TEXT = 'Hello world'

const ButtonPage = () => (
    <div className="flex left column dc__gap-12 p-20">
        {Object.keys(ButtonVariantType).map((buttonVariant) =>
            Object.keys(ComponentSizeType).map((size) => (
                <div className="flex column left dc__gap-8">
                    <h3 className="m-0 dc__capitalize">
                        Variant: {buttonVariant}; size: {size}
                    </h3>
                    {Object.keys(ButtonStyleType).map((style) =>
                        [1, 2].map((id) => (
                            <div className="flex left dc__gap-12">
                                <h5 className="w-200 m-0">{style}</h5>
                                <Button
                                    text={BUTTON_TEXT}
                                    variant={ButtonVariantType[buttonVariant]}
                                    size={ComponentSizeType[size]}
                                    startIcon={id % 2 === 0 ? <ICCube /> : null}
                                    endIcon={id % 2 === 0 ? <ICCube /> : null}
                                    style={ButtonStyleType[style]}
                                    disabled={id % 2 === 0}
                                    isLoading={id % 2 === 0}
                                />
                            </div>
                        )),
                    )}
                </div>
            )),
        )}
    </div>
)

export default ButtonPage
