import { Button, ButtonStyleType, ButtonVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentTemplateEditorHeaderProps } from './types'

// TODO: Check if can move dialogs here instead of in the parent component
const OverrideTemplateButton = ({
    isOverridden,
    handleOverride,
}: Pick<DeploymentTemplateEditorHeaderProps, 'isOverridden' | 'handleOverride'>) => (
    <Button
        variant={ButtonVariantType.text}
        text={isOverridden ? 'Delete override' : 'Allow override'}
        onClick={handleOverride}
        dataTestId={`action-override-${isOverridden ? 'delete' : 'allow'}`}
        style={isOverridden ? ButtonStyleType.negative : ButtonStyleType.default}
    />
)

export default OverrideTemplateButton
