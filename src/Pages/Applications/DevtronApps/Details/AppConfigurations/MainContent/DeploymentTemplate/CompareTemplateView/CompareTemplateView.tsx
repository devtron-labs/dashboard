import { CodeEditor, MODES, SelectPicker, SelectPickerVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { CompareTemplateViewProps } from './types'

const CompareFromApprovalSelector = importComponentFromFELibrary('CompareFromApprovalSelector', null, 'function')

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
}: CompareTemplateViewProps) => {
    const renderActiveEditorHeader = () => (
        <div className="flexbox dc__content-space w-100 dc__gap-8 dc__align-items-center">
            <div className="flexbox dc__gap-8 dc__align-items-center">
                {!readOnly && <ICPencil className="icon-dim-16 dc__no-shrink" />}

                {/* FIXME: In case of draft and override would be different */}
                {currentEditorSelectedChart && (
                    <span className="cn-9 fs-12 fw-6 lh-20">
                        Base deployment template (v{currentEditorSelectedChart.version})
                    </span>
                )}
            </div>
            {/* TODO: Add override */}
        </div>
    )

    return (
        <div className="flexbox-col flex-grow-1 dc__border-top-n1 dc__border-bottom-imp">
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
                <CodeEditor.Header className="w-100 p-0-imp" hideDefaultSplitHeader>
                    <div className="flex column">
                        <div className="bcn-1 dc__border-bottom flex left w-100 p-0-imp">
                            <div className="flexbox px-16 py-6 w-100 dc__border-right">
                                <span className="cn-9 fs-12 fw-4 lh-20">Compare with:</span>

                                <SelectPicker
                                    inputId="compare-with-template-selector"
                                    options={compareWithOptions}
                                    value={selectedCompareWithOption}
                                    onChange={handleCompareWithOptionChange}
                                    variant={SelectPickerVariantType.BORDER_LESS}
                                />
                            </div>

                            <div className="flexbox px-16 py-6 w-100">
                                {/* TODO: First handling normal compare */}
                                {isApprovalView && CompareFromApprovalSelector ? (
                                    <CompareFromApprovalSelector
                                        selectedOptionValue={compareFromSelectedOptionValue}
                                        handleCompareFromOptionSelection={handleCompareFromOptionSelection}
                                        draftChartVersion={draftChartVersion || ''}
                                        currentEditorChartVersion={currentEditorSelectedChart?.version || ''}
                                    />
                                ) : (
                                    renderActiveEditorHeader()
                                )}
                            </div>
                        </div>

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
                    </div>
                </CodeEditor.Header>
            </CodeEditor>
        </div>
    )
}

export default CompareTemplateView
