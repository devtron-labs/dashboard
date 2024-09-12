import { CodeEditor, MODES } from '@devtron-labs/devtron-fe-common-lib'
import { CompareTemplateViewProps } from './types'

const CompareTemplateView = ({
    isLoading,
    currentEditorTemplate,
    schema,
    currentEditorSelectedChartVersion,
    editorOnChange,
}: CompareTemplateViewProps) => (
    <CodeEditor
        loading={isLoading}
        value={currentEditorTemplate}
        validatorSchema={schema}
        chartVersion={currentEditorSelectedChartVersion?.replace(/\./g, '-')}
        mode={MODES.YAML}
        onChange={editorOnChange}
        // TODO: Add readOnly prop
        readOnly
        noParsing
        height="100%"
    >
        <CodeEditor.Header className="w-100 p-0-imp" hideDefaultSplitHeader>
            <div className="code-editor__header flex left w-100 p-0-imp">
                <div className="px-12 py-6 flexbox">
                    {/* TODO: check if can be label */}
                    <span className="cn-9 fs-12 fw-6 lh-20">Compare with:</span>
                    {/* TODO: add inheriting tile */}
                </div>
            </div>
        </CodeEditor.Header>
    </CodeEditor>
)

export default CompareTemplateView
