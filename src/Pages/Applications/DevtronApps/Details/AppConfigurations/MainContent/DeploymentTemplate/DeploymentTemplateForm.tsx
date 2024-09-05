import {
    ConfigurationType,
    getDeploymentTemplateEditorKey,
    Progressing,
    useDeploymentTemplateComputedData as useCommonDeploymentTemplateComputedData,
    useDeploymentTemplateContext,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import DeploymentTemplateGUIView from '@Components/deploymentConfig/DeploymentTemplateView/DeploymentTemplateGUIView'
import { DeploymentTemplateFormProps } from './types'

const useDeploymentTemplateComputedData = importComponentFromFELibrary(
    'useDeploymentTemplateComputedData',
    useCommonDeploymentTemplateComputedData,
    'function',
)

const DeploymentTemplateForm = ({
    editMode,
    hideLockedKeys,
    lockedConfigKeysWithLockType,
    readOnly,
    resolveScopedVariables,
}: DeploymentTemplateFormProps) => {
    const { editorOnChange } = useDeploymentTemplateContext()

    const { editedDocument, isResolvingVariables, uneditedDocumentWithoutLockedKeys } =
        useDeploymentTemplateComputedData({
            resolveScopedVariables,
            hideLockedKeys,
        })

    if (editMode === ConfigurationType.GUI) {
        if (isResolvingVariables) {
            return (
                <div className="flex h-100 dc__overflow-scroll">
                    <Progressing pageLoader />
                </div>
            )
        }

        const formKey = getDeploymentTemplateEditorKey({
            hideLockedKeys,
            resolveScopedVariables,
            isResolvingVariables,
        })

        return (
            <DeploymentTemplateGUIView
                uneditedDocument={uneditedDocumentWithoutLockedKeys}
                editedDocument={editedDocument}
                value={editedDocument}
                // TODO: Look into this later for readme, etc
                readOnly={readOnly}
                // TODO: Look into this later
                hideLockedKeys={hideLockedKeys}
                editorOnChange={editorOnChange}
                // TODO: Look into this later
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                key={formKey}
            />
        )
    }

    // TODO: Add support for YAML editor

    return null
}

export default DeploymentTemplateForm
