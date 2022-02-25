import React, { useEffect, useState } from 'react';
import { useKeyDown } from '../common';
import CodeEditor from '../CodeEditor/CodeEditor';
import checkGreen from '../../assets/icons/misc/checkGreen.svg';
import arrowSquareout from '../../assets/icons/misc/arrowSquareOut.svg';
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails';
import './deploymentConfig.scss';
import { modes } from '../../../src/config/constants';

interface Readme {
    readme: any;
    value: string;
    handleClose: any;
    loading: boolean;
    height?: number;
    onChange: any;
    schema?: any;
    readOnly?: boolean;
    defaultValue?: string;
}

function ReadmeConfig({ readme, value, handleClose, loading, height, onChange, schema, readOnly, defaultValue }:Readme) {
    const key = useKeyDown();
    const [tempForm, setTempForm] = useState();
    useEffect(() => {
        if (key.join().includes('Escape')) {
            handleClose();
        }
    }, [key.join()]);

    const handleReadmeConfig = () => {
        handleClose();
        onChange(tempForm);
    };

    return (
        <div className="advanced-config-readme">
            <div className="container-top">
                <div className="infobar flexbox mr-10">
                    <h5>
                        <img src={checkGreen} alt="add-worflow" className="icon-dim-18 mr-5" />
                        Changes made to the yaml will be retained when you exit the README.
                    </h5>
                </div>
                <button className="cta flex" onClick={handleReadmeConfig}>
                    <img src={arrowSquareout} alt="add-worflow" className="icon-dim-18 mt-3 mr-3" />
                    Done
                </button>
            </div>
            <div className="config-editor">
                <div>
                    <div className="readme pl-16 pt-10 pr-16 pb-10 flexbox">
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
                        mode= "yaml"
                        loading={loading}
                    >
                        <CodeEditor.Header>
                        <h5>{modes.yaml.toUpperCase()}</h5>
                            <CodeEditor.ValidationError />
                        </CodeEditor.Header>
                    </CodeEditor>
                </div>
            </div>
        </div>
    );
}

export default ReadmeConfig;
