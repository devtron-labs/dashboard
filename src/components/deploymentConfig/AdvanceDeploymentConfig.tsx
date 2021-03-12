import React, { Component } from 'react';
import ReactSelect from 'react-select';
import CodeEditor from '../CodeEditor/CodeEditor';
import YAML from 'yaml';
import { DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem } from '../common'

interface AdvanceDeploymentConfigProps {
    advancedConfigTab: 'json' | 'yaml';
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
    setAdvancedConfigTab: (value: 'json' | 'yaml') => void;
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
            {console.log(this.props.valuesOverride)}
            <div className="form__row form__row--code-editor-container">
                {/* <CodeEditor value={YAML.parse(this.props.valuesOverride, { indent: 2 })}
                    onChange={this.props.handleValuesOverride}
                    mode="yaml">
                    <CodeEditor.Header>
                        <CodeEditor.LanguageChanger />
                        <CodeEditor.ValidationError />
                    </CodeEditor.Header>
                </CodeEditor> */}
                <CodeEditor value={YAML.stringify(this.props.valuesOverride, { indent: 2 })}
                    height={300}
                    mode='json'
                    onChange={this.props.handleValuesOverride}>
                    <CodeEditor.Header >
                        <Switch value={this.props.advancedConfigTab} name="advanced-config" onChange={(event) => { this.props.setAdvancedConfigTab(event.target.value) }}>
                            <SwitchItem value={'json'}> JSON  </SwitchItem>
                            <SwitchItem value={'yaml'}>  YAML</SwitchItem>
                        </Switch>
                        <CodeEditor.ValidationError />
                    </CodeEditor.Header>
                </CodeEditor>
            </div>

        </div>
    }
}
