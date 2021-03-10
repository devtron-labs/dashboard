import React, { Component } from 'react';
import ReactSelect from 'react-select';
import CodeEditor from '../CodeEditor/CodeEditor'
import { AdvanceDeploymentConfigState } from './types'

const DefaultSelectedChart = {
    id: 0,
    version: "",
}
export default class AdvanceDeploymentConfig extends Component<{}, AdvanceDeploymentConfigState> {
    constructor(props) {
        super(props)
    
        this.state = {
             chartVersions: [],
             selectedChart: {
                 ...DefaultSelectedChart
             },
             template: "",
        }
    }

    handleSelectedChart(){

    }

    handleTemplateFormData(resp){

    }
    
    render() {
        return (
            <div>
                <div className="form__row">
            <div className="form__label">Chart version</div>
            <ReactSelect options={this.state.chartVersions}
                isMulti={false}
                getOptionLabel={option => `${option.version}`}
                getOptionValue={option => `${option.id}`}
                value={this.state.selectedChart}
                components={{
                    IndicatorSeparator: null
                }}
                styles={{
                    control: (base, state) => ({
                        ...base,
                        boxShadow: 'none',
                        border: `solid 1px var(--B500)`
                    }),
                    option: (base, state) => {
                        return ({
                            ...base,
                            color: 'var(--N900)',
                            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                        })
                    },
                }}
                onChange={this.handleSelectedChart}
            />
        </div>
            <div className="form__row form__row--code-editor-container">
                <CodeEditor
                    value={this.state.template ? JSON.stringify(this.state.template, null, 2) : ""}
                    onChange={resp =>  this.handleTemplateFormData(resp) }
                    mode="yaml"
                    //loading={this.state.chartConfigLoading}
                >
                    <CodeEditor.Header>
                        <CodeEditor.LanguageChanger />
                        <CodeEditor.ValidationError />
                    </CodeEditor.Header>
                </CodeEditor>
            </div>
                
            </div>
        )
    }
}
