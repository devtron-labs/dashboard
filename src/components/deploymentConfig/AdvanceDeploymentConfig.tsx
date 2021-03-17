import React, { Component } from 'react';
import ReactSelect from 'react-select';
import CodeEditor from '../CodeEditor/CodeEditor';

interface AdvanceDeploymentConfigProps {
    valuesOverride: any;
    chartVersions: {
        id: number;
        version: string;
    }[];
    selectedChart: {
        id: number;
        version: string;
    }
    selectChart: (chart) => void;
    handleValuesOverride: (str) => void;
}
export class AdvanceDeploymentConfig extends Component<AdvanceDeploymentConfigProps, {}> {
    render() {
        return <div>
            <div className="form__row">
                <div className="form__label">Chart version</div>
                <ReactSelect options={this.props.chartVersions}
                    isMulti={false}
                    getOptionLabel={option => `${option.version}`}
                    getOptionValue={option => `${option.id}`}
                    value={this.props.selectedChart}
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
                    onChange={this.props.selectChart}
                />
            </div>
            <div className="form__row form__row--code-editor-container">
                <CodeEditor value={this.props.valuesOverride}
                    height={500}
                    mode={'yaml'}
                    onChange={this.props.handleValuesOverride}>
                    <CodeEditor.Header >
                        <CodeEditor.LanguageChanger />
                        <CodeEditor.ValidationError />
                    </CodeEditor.Header>
                </CodeEditor>
            </div>
        </div>
    }
}
