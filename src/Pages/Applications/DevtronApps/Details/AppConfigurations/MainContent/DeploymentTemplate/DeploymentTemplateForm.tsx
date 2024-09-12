import { CodeEditor, ConfigurationType, MODES, noop } from '@devtron-labs/devtron-fe-common-lib'
import DeploymentTemplateGUIView from '@Components/deploymentConfig/DeploymentTemplateView/DeploymentTemplateGUIView'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '@Components/deploymentConfig/constants'
import { DeploymentTemplateFormProps } from './types'

const DeploymentTemplateForm = ({
    editMode,
    hideLockedKeys,
    lockedConfigKeysWithLockType,
    readOnly,
    selectedChart,
    guiSchema,
    schema,
    isUnSet,
    wasGuiOrHideLockedKeysEdited,
    handleEnableWasGuiOrHideLockedKeysEdited,
    handleChangeToYAMLMode,
    editorOnChange,
    editedDocument,
    uneditedDocument,
}: DeploymentTemplateFormProps) => {
    if (editMode === ConfigurationType.GUI) {
        return (
            <DeploymentTemplateGUIView
                // NOTE: This is with locked keys so original value is passed
                uneditedDocument={uneditedDocument}
                editedDocument={editedDocument}
                value={editedDocument}
                readOnly={readOnly}
                hideLockedKeys={hideLockedKeys}
                editorOnChange={editorOnChange}
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                isUnSet={isUnSet}
                selectedChart={selectedChart}
                guiSchema={guiSchema}
                wasGuiOrHideLockedKeysEdited={wasGuiOrHideLockedKeysEdited}
                handleEnableWasGuiOrHideLockedKeysEdited={handleEnableWasGuiOrHideLockedKeysEdited}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
                rootClassName="flexbox-col flex-grow-1"
            />
        )
    }

    return (
        <CodeEditor
            defaultValue={uneditedDocument}
            value={editedDocument}
            chartVersion={selectedChart?.version.replace(/\./g, '-')}
            onChange={readOnly ? noop : editorOnChange}
            mode={MODES.YAML}
            validatorSchema={schema}
            readOnly={readOnly}
            noParsing
            height="100%"
        >
            {isUnSet && <CodeEditor.Warning text={DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning} />}
        </CodeEditor>
    )
}

export default DeploymentTemplateForm
