import { CodeEditor, MODES, noop, useDeploymentTemplateContext } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentTemplateEditorProps } from './types'

const DeploymentTemplateEditor = ({
    editedDocument,
    uneditedDocument,
    showDiff,
    readOnly,
}: DeploymentTemplateEditorProps) => {
    const { state, editorOnChange } = useDeploymentTemplateContext()

    return (
        <CodeEditor
            defaultValue={uneditedDocument}
            value={editedDocument}
            chartVersion={state.selectedChart?.version.replace(/\./g, '-')}
            onChange={readOnly ? noop : editorOnChange}
            mode={MODES.YAML}
            validatorSchema={state.schema}
            // TODO: Look into this later
            height="calc(100vh - 272px)"
            diffView={showDiff}
            readOnly={readOnly}
            noParsing
        />
    )
}

export default DeploymentTemplateEditor
