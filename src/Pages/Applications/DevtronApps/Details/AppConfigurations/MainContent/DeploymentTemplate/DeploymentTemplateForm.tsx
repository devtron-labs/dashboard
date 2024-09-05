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
import DeploymentTemplateEditor from './DeploymentTemplateEditor'

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

    const { editedDocument, isResolvingVariables, uneditedDocumentWithoutLockedKeys, uneditedDocument } =
        useDeploymentTemplateComputedData({
            resolveScopedVariables,
            hideLockedKeys,
        })

    const formKey = getDeploymentTemplateEditorKey({
        hideLockedKeys,
        resolveScopedVariables,
        isResolvingVariables,
    })

    if (isResolvingVariables) {
        return (
            <div className="flex h-100 dc__overflow-scroll">
                <Progressing pageLoader />
            </div>
        )
    }

    if (editMode === ConfigurationType.GUI) {
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
                key={`${formKey}-gui-view`}
            />
        )
    }

    return (
        <DeploymentTemplateEditor
            editedDocument={editedDocument}
            uneditedDocument={uneditedDocument}
            showDiff={false}
            readOnly={readOnly}
            key={`${formKey}-gui-view`}
        />
    )
}

export default DeploymentTemplateForm
