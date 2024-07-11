/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState } from 'react'
import { useKeyDown } from '../common'
import checkGreen from '../../assets/icons/misc/checkGreen.svg'
import arrowSquareout from '../../assets/icons/misc/arrowSquareOut.svg'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails'
import './deploymentConfig.scss'
import { MODES } from '../../config/constants'
import { CodeEditor } from '@devtron-labs/devtron-fe-common-lib'

interface Readme {
    readme: any
    value: string
    handleClose: any
    loading: boolean
    onChange: any
    schema?: any
    readOnly?: boolean
    defaultValue?: string
}

const ReadmeConfig = ({ readme, value, handleClose, loading, onChange, schema, readOnly, defaultValue }: Readme) => {
    const key = useKeyDown()
    const [tempForm, setTempForm] = useState()
    useEffect(() => {
        if (key.join().includes('Escape')) {
            handleClose()
        }
    }, [key.join()])

    const handleReadmeConfig = () => {
        handleClose()
        onChange(tempForm)
    }

    return (
        <div className="advanced-config-readme pt-24 pb-24 pr-24 pl-24 br-8">
            <div className="flex dc__content-space ">
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
                <div className="bw-1 br-4 bcn-0 code-editor">
                    <CodeEditor
                        value={value}
                        defaultValue={defaultValue}
                        height="calc(100% - 42px)"
                        readOnly={readOnly}
                        validatorSchema={schema}
                        onChange={setTempForm}
                        mode={MODES.YAML}
                        loading={loading || !value}
                    >
                        <CodeEditor.Header>
                            <h5>{MODES.YAML.toUpperCase()}</h5>
                            <CodeEditor.ValidationError />
                        </CodeEditor.Header>
                    </CodeEditor>
                </div>
            </div>
        </div>
    )
}

export default ReadmeConfig
