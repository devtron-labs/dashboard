import React, { useEffect, useState } from 'react';
import { useKeyDown } from '../common';
import CodeEditor from '../CodeEditor/CodeEditor';
import checkGreen from '../../assets/icons/misc/checkGreen.svg';
import arrowSquareout from '../../assets/icons/misc/ArrowSquareOut.svg';
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails';
import './deploymentConfig.scss';

interface readme {
    readme: any;
    value: string;
    handleClose: any;
    loading: boolean;
    height?: number;
    onChange: any;
    schema?: any;
    readOnly?: boolean;
    defaultValue?: string;
    mode?: "yaml" | "json" | "shell";
}

function ReadmeConfig({ readme, value, handleClose, loading, height, onChange, schema, readOnly, defaultValue, mode }:readme) {
    const key = useKeyDown();
    const [resp, setTempForm] = useState();
    useEffect(() => {
        if (key.join().includes('Escape')) {
            handleClose();
        }
    }, [key.join()]);

    const handle = () => {
        handleClose();
        onChange(resp);
    };

    return (
        <div className="advanced-config-readme">
            <div className="container-top">
                <div className="infobar">
                    <h5>
                        <img src={checkGreen} alt="add-worflow" className="icon-dim-18 mr-5" />
                        Changes made to the yaml will be retained when you exit the README.
                    </h5>
                </div>
                <button className="cta" onClick={handle}>
                    <img src={arrowSquareout} alt="add-worflow" className="icon-dim-18 mt-3 mr-3" />
                    Done
                </button>
            </div>
            <div className="config-editor">
                <div>
                    <div className="readme">
                        <h5>Readme</h5>
                    </div>
                    <div className="readmeEditor">
                        <MarkDown markdown={readme} />
                    </div>
                </div>
                <div className="codeEditor">
                    <CodeEditor
                        value={value}
                        defaultValue={defaultValue}
                        height={height}
                        readOnly={readOnly}
                        validatorSchema={schema}
                        onChange={setTempForm}
                        mode={mode}
                        loading={loading}
                    >
                        <CodeEditor.Header>
                            <h5>YAML</h5>
                            <CodeEditor.ValidationError />
                        </CodeEditor.Header>
                    </CodeEditor>
                </div>
            </div>
        </div>
    );
}

export default ReadmeConfig;
