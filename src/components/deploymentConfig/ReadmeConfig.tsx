import React, { useEffect, useState } from 'react';
import { useKeyDown } from '../common';
import CodeEditor from '../CodeEditor/CodeEditor';
import checkGreen from '../../assets/icons/misc/checkGreen.svg';
import arrowSquareout from '../../assets/icons/misc/arrowSquareOut.svg';
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails';
import './deploymentConfig.scss';
import { MODES } from '../../../src/config/constants';

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
        <div className="advanced-config-readme pt-24 pb-24 pr-24 pl-24 br-8">
            <div className="flex content-space ">
                <div className="infobar flex left bcb-1 eb-2 bw-1 br-4 mr-10 pt-8 pb-8 pr-16 pl-16">
                    <img src={checkGreen} alt="add-worflow" className="icon-dim-18 mr-5" />
                    Changes made to the yaml will be retained when you exit the README.
                </div>
                <button className="done-button cta flex fs-13" onClick={handleReadmeConfig}>
                    <img src={arrowSquareout} alt="add-worflow" className="icon-dim-18 mt-3 mr-3" />
                    Done
                </button>
            </div>
            <div className="en-2 bw-1 br-4 config-editor">
                <div className="readmeEditor">
                    <div className="code-editor__header flex left">
                        <h5>Readme</h5>
                    </div>
                    <div className="readme">
                        <MarkDown markdown={readme} />
                    </div>
                </div>
                <div className="bw-1 br-4 bcn-0">
                    <CodeEditor
                        value={value}
                        defaultValue={defaultValue}
                        height={height}
                        readOnly={readOnly}
                        validatorSchema={schema}
                        onChange={setTempForm}
                        mode={MODES.YAML}
                        loading={loading}
                    >
                        <CodeEditor.Header>
                            <h5>{MODES.YAML.toUpperCase()}</h5>
                            <CodeEditor.ValidationError />
                        </CodeEditor.Header>
                    </CodeEditor>
                </div>
            </div>
        </div>
    );
}

export default ReadmeConfig;
