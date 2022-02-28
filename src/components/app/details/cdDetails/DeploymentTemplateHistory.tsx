import React from 'react'
import CodeEditor from '../../../CodeEditor/CodeEditor';

function DeploymentTemplateHistory({setTempValue}) {
  return (
    <div>
         <div className="en-2 bw-1 br-4 deployment-diff__upper bcn-0 mt-20 mb-16 mr-20 ml-20">
                    <div className="pl-16 pr-16 pt-16">
                        <div className="pb-16">
                            <div className="cn-6">Chart version</div>
                            <div className="cn-9">3.8.0</div>
                        </div>
                        <div className="pb-16">
                            <div className="cn-6">Application metrics</div>
                            <div className="cn-9">Disabled</div>
                        </div>
                        <div className="pb-16">
                            <div className="cn-6">When do you want the pipeline to execute?</div>
                            <div className="cn-9">Manual</div>
                        </div>
                    </div>
                    <div className="pl-16 pr-16 pt-16">
                        <div className="pb-16">
                            <div className="cn-6">Chart version</div>
                            <div className="cn-9">3.8.0</div>
                        </div>
                        <div className="pb-16">
                            <div className="cn-6">Application metrics</div>
                            <div className="cn-9">Disabled</div>
                        </div>
                        <div className="pb-16">
                            <div className="cn-6">When do you want the pipeline to execute?</div>
                            <div className="cn-9">Manual</div>
                        </div>
                    </div>
                </div>
                <div className="form__row form__row--code-editor-container en-2 bw-1 br-4 mr-20 ml-20">
                    <div className="border-bottom br-4 pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">values.yaml</div>
                    <CodeEditor
                        // value={tempValue? tempValue:state ? state.duplicate ? YAML.stringify(state.duplicate, { indent: 2 }) : YAML.stringify(state.data.globalConfig, { indent: 2 }) : ""}
                        onChange={(tempValue) => {
                            setTempValue(tempValue);
                        }}
                        // defaultValue={state && state.data && state.duplicate ? YAML.stringify(state.data.globalConfig, { indent: 2 }) : ""}
                        mode={'yaml'}
                        // validatorSchema={state.data.schema}
                    ></CodeEditor>
                </div>
    </div>
  )
}

export default DeploymentTemplateHistory