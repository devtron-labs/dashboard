import React, { useContext, useRef } from 'react'
import { DeploymentConfigContextType, DeploymentTemplateReadOnlyEditorViewProps } from '../types'
import { BASIC_FIELDS, DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '../constants'
import { Progressing, Toggle } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { DEPLOYMENT, MODES, ROLLOUT_DEPLOYMENT } from '../../../config'
import { MarkDown } from '../../charts/discoverChartDetail/DiscoverChartDetails'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as WarningIcon } from '../../../assets/icons/ic-warning.svg'
import { DeploymentConfigContext } from '../DeploymentConfig'

export default function DeploymentTemplateReadOnlyEditorView({
    value,
    isEnvOverride,
}: DeploymentTemplateReadOnlyEditorViewProps) {
    const envVariableSectionRef = useRef(null)
    const { isUnSet, state } = useContext<DeploymentConfigContextType>(DeploymentConfigContext)

    const renderLabel = (title: string, description: string, isMandatory?: boolean): JSX.Element => {
        return (
            <label className="cn-7 mb-0 lh-32">
                <Tippy
                    className="default-tt"
                    arrow={false}
                    content={<span className="dc__mxw-200 dc__block fw-4">{description}</span>}
                    interactive={true}
                >
                    <span className="text-underline-dashed">
                        {title}
                        {isMandatory && <span className="cr-5"> *</span>}
                    </span>
                </Tippy>
            </label>
        )
    }

    const renderCodeEditor = (): JSX.Element => {
        return (
            <div className="form__row--code-editor-container dc__border-top dc__border-bottom read-only-mode">
                <CodeEditor
                    value={value}
                    mode={MODES.YAML}
                    validatorSchema={state.schema}
                    loading={state.chartConfigLoading || value === undefined || value === null}
                    height={isEnvOverride ? 'calc(100vh - 268px)' : 'calc(100vh - 238px)'}
                    readOnly={true}
                />
            </div>
        )
    }

    return state.yamlMode ||
        (state.selectedChart?.name !== ROLLOUT_DEPLOYMENT && state.selectedChart?.name !== DEPLOYMENT) ? (
        <>
            {state.showReadme ? (
                <>
                    <div className="dt-readme dc__border-right dc__border-bottom-imp">
                        <div className="code-editor__header flex left fs-12 fw-6 cn-9">Readme</div>
                        {state.chartConfigLoading ? (
                            <Progressing pageLoader />
                        ) : (
                            <MarkDown markdown={state.readme} className="dt-readme-markdown" />
                        )}
                    </div>
                    {renderCodeEditor()}
                </>
            ) : (
                renderCodeEditor()
            )}
        </>
    ) : (
        <>
            {isUnSet && (
                <div className="bcy-1 fs-12 fw-4 cn-9 en-2 bw-1 dc__no-left-border dc__no-right-border flexbox pt-8 pr-16 pb-8 pl-16 h-32 lh-16">
                    <WarningIcon className="warning-icon-y7 icon-dim-16 mr-8" />
                    {DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning}
                </div>
            )}
            <div
                className={`form__row--gui-container pt-20 pr-20 pl-20 scrollable mb-0-imp ${
                    !isUnSet ? ' gui dc__border-top' : ' gui-with-warning'
                } read-only-mode`}
            >
                {state.chartConfigLoading || !value ? (
                    <div className="flex h-100">
                        <Progressing pageLoader />
                    </div>
                ) : (
                    <div className="w-650-px">
                        <div className="fw-6 fs-14 cn-9 mb-12">Container Port</div>
                        <div className="row-container mb-16">
                            {renderLabel('Port', 'Port for the container', true)}
                            <div>
                                <input
                                    type="text"
                                    name={BASIC_FIELDS.PORT}
                                    value={state.basicFieldValues?.[BASIC_FIELDS.PORT]}
                                    className="w-200 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                    data-testid="containerport-textbox"
                                    readOnly={true}
                                    autoComplete="off"
                                />
                                {state.basicFieldValuesErrorObj?.port && !state.basicFieldValuesErrorObj.port.isValid && (
                                    <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                        <span>{state.basicFieldValuesErrorObj.port.message}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div
                            className={`row-container ${
                                state.basicFieldValues?.[BASIC_FIELDS.ENABLED] ? ' mb-8' : ' mb-16'
                            }`}
                        >
                            <label className="fw-6 fs-14 cn-9 mb-8">HTTP Requests Routes</label>
                            <div
                                className="mt-4"
                                data-testid="httprequests-routes-toggle"
                                style={{ width: '32px', height: '20px' }}
                            >
                                <Toggle
                                    selected={state.basicFieldValues?.[BASIC_FIELDS.ENABLED]}
                                    disabled={true}
                                />
                            </div>
                        </div>
                        {state.basicFieldValues?.[BASIC_FIELDS.ENABLED] && (
                            <div className="mb-12">
                                <div className="row-container mb-12">
                                    {renderLabel('Host', 'Host name')}
                                    <input
                                        type="text"
                                        data-testid="httprequests-routes-host-textbox"
                                        name={BASIC_FIELDS.HOST}
                                        value={state.basicFieldValues?.[BASIC_FIELDS.HOSTS]?.[0][BASIC_FIELDS.HOST]}
                                        className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                        readOnly={true}
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="row-container mb-4">
                                    {renderLabel('Path', 'Path where this component will listen for HTTP requests')}
                                    <div
                                        data-testid="httprequests-routes-addpath-button"
                                        className="pointer cb-5 fw-6 fs-13 flexbox lh-32 w-120"
                                        data-name={BASIC_FIELDS.PATH}
                                    >
                                        <Add className="icon-dim-20 fcb-5 mt-6 mr-6" />
                                        Add path
                                    </div>
                                </div>
                                {state.basicFieldValues?.[BASIC_FIELDS.HOSTS]?.[0]?.[BASIC_FIELDS.PATHS]?.map(
                                    (path: string, index: number) => (
                                        <div className="row-container mb-4" key={`${BASIC_FIELDS.PATH}-${index}`}>
                                            <div />
                                            <input
                                                type="text"
                                                data-testid="httprequests-routes-path-textbox"
                                                name={BASIC_FIELDS.PATH}
                                                data-index={index}
                                                value={path}
                                                className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                                readOnly={true}
                                                autoComplete="off"
                                            />
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                        <div className="fw-6 fs-14 cn-9 mb-8">Resources (CPU & RAM)</div>
                        <div className="row-container mb-8">
                            {renderLabel('CPU', 'CPU available to the application', true)}
                            <div>
                                <input
                                    type="text"
                                    data-testid="resources-cpu-textbox"
                                    name={BASIC_FIELDS.RESOURCES_CPU}
                                    value={
                                        state.basicFieldValues?.[BASIC_FIELDS.RESOURCES][BASIC_FIELDS.LIMITS][
                                            BASIC_FIELDS.CPU
                                        ]
                                    }
                                    className="w-200 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                    readOnly={true}
                                    autoComplete="off"
                                />
                                {state.basicFieldValuesErrorObj?.cpu && !state.basicFieldValuesErrorObj.cpu.isValid && (
                                    <span className="flexbox cr-5 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                        <span>{state.basicFieldValuesErrorObj.cpu.message}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="row-container mb-16">
                            {renderLabel('Memory', 'Memory available to the application', true)}
                            <div>
                                <input
                                    data-testid="resources-memory-textbox"
                                    type="text"
                                    name={BASIC_FIELDS.RESOURCES_MEMORY}
                                    value={
                                        state.basicFieldValues?.[BASIC_FIELDS.RESOURCES][BASIC_FIELDS.LIMITS][
                                            BASIC_FIELDS.MEMORY
                                        ]
                                    }
                                    className="w-200 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                    readOnly={true}
                                    autoComplete="off"
                                />
                                {state.basicFieldValuesErrorObj?.memory &&
                                    !state.basicFieldValuesErrorObj.memory.isValid && (
                                        <span className="flexbox cr-5 fw-5 fs-11 flexbox">
                                            <AlertTriangle className="icon-dim-14 mr-5 mt-2" />
                                            <span>{state.basicFieldValuesErrorObj.memory.message}</span>
                                        </span>
                                    )}
                            </div>
                        </div>
                        <div className="fw-6 fs-14 cn-9 mb-8">Environment Variables</div>
                        <div className="row-container mb-4">
                            {renderLabel(
                                'Name/Value',
                                'Set environment variables as name:value for containers that run in the Pod.',
                            )}
                            <div
                                className="pointer cb-5 fw-6 fs-13 flexbox lh-32 w-120"
                                data-testid="environment-variable-addvariable-button"
                                data-name={BASIC_FIELDS.ENV_VARIABLES}
                            >
                                <Add className="icon-dim-20 fcb-5 mt-6 mr-6" />
                                Add variable
                            </div>
                        </div>
                        {state.basicFieldValues?.[BASIC_FIELDS.ENV_VARIABLES]?.map(
                            (envVariable: string, index: number) => (
                                <div className="row-container mb-4" key={`${BASIC_FIELDS.ENV_VARIABLES}-${index}`}>
                                    <div />
                                    <div>
                                        <input
                                            type="text"
                                            data-testid="environment-variable-name"
                                            name={`${BASIC_FIELDS.ENV_VARIABLES}_${BASIC_FIELDS.NAME}-${index}`}
                                            data-index={index}
                                            value={envVariable[BASIC_FIELDS.NAME]}
                                            className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5 dc__no-bottom-radius"
                                            placeholder={BASIC_FIELDS.NAME}
                                            readOnly={true}
                                            autoComplete="off"
                                        />
                                        <textarea
                                            data-testid="environment-variable-value"
                                            name={`${BASIC_FIELDS.ENV_VARIABLES}_${BASIC_FIELDS.VALUE}-${index}`}
                                            data-index={index}
                                            value={envVariable[BASIC_FIELDS.VALUE]}
                                            className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5 dc__no-top-radius dc__no-top-border"
                                            rows={2}
                                            placeholder={BASIC_FIELDS.VALUE}
                                            readOnly={true}
                                        />
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}
                <div ref={envVariableSectionRef}></div>
            </div>
        </>
    )
}
