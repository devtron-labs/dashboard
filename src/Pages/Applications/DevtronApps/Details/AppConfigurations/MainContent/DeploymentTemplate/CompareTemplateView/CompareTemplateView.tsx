import { CodeEditor, MODES } from '@devtron-labs/devtron-fe-common-lib'
import { CompareTemplateViewProps } from './types'
import DeploymentTemplateEditorHeader from '../DeploymentTemplateEditorHeader'

const CompareTemplateView = ({
    schema,
    isLoading,
    currentEditorTemplate,
    currentEditorSelectedChart,
    editorOnChange,
    compareWithEditorTemplate,
    readOnly,
    compareWithOptions,
    handleCompareWithOptionChange,
    selectedCompareWithOption,
    isApprovalView,
    compareFromSelectedOptionValue,
    handleCompareFromOptionSelection,
    draftChartVersion,
    isUnSet,
    isCurrentEditorOverridden,
    handleOverride,
    environmentName,
    latestDraft,
}: CompareTemplateViewProps) => (
    <div className="flexbox-col flex-grow-1 dc__border-top-n1 dc__border-bottom-imp dc__overflow-scroll">
        <CodeEditor
            defaultValue={compareWithEditorTemplate}
            value={currentEditorTemplate}
            chartVersion={currentEditorSelectedChart?.version.replace(/\./g, '-')}
            onChange={editorOnChange}
            mode={MODES.YAML}
            validatorSchema={schema}
            loading={isLoading}
            height="100%"
            diffView
            readOnly={readOnly}
            noParsing
            key={`compare-template-mode-${selectedCompareWithOption.value}`}
        >
            <DeploymentTemplateEditorHeader
                showReadMe={false}
                isCompareView
                readOnly={readOnly}
                isUnSet={isUnSet}
                selectedChartVersion={currentEditorSelectedChart?.version || ''}
                isOverridden={isCurrentEditorOverridden}
                handleOverride={handleOverride}
                showOverrideButton={!isApprovalView}
                environmentName={environmentName}
                latestDraft={latestDraft}
                handleCompareWithOptionChange={handleCompareWithOptionChange}
                selectedCompareWithOption={selectedCompareWithOption}
                compareWithOptions={compareWithOptions}
                isApprovalView={isApprovalView}
                compareFromSelectedOptionValue={compareFromSelectedOptionValue}
                handleCompareFromOptionSelection={handleCompareFromOptionSelection}
                draftChartVersion={draftChartVersion || ''}
            />
            {/* {isDeleteDraftState && (
                            <div className="code-editor__header flex left w-100 p-0-imp">
                                <div className="bcr-1 pt-8 pb-8 pl-16 pr-16">
                                    <div className="fs-12 fw-4 cn-7 lh-16">Configuration</div>
                                    <div className="fs-13 fw-4 cn-9 lh-20">Override base</div>
                                </div>
                                <div className="bcg-1 pt-8 pb-8 pl-16 pr-16">
                                    <div className="fs-12 fw-4 cn-7 lh-16">Configuration</div>
                                    <div className="fs-13 fw-4 cn-9 lh-20">Inherit from base</div>
                                </div>
                            </div>
                        )} */}
        </CodeEditor>
    </div>
)

export default CompareTemplateView
