import React, { useState } from 'react';
import { SourceTypeMap } from '../../config';
import { ReactComponent as Webhook } from '../../assets/icons/ic-CIWebhook.svg';
import { ReactComponent as Copy } from '../../assets/icons/ic-copy.svg';
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg';
import ReactSelect from 'react-select';
import { styles, menuList, DropdownIndicator } from '../charts/charts.util';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';

export function ConfigureWebhook({ materials, copySecretKey, copyWebhookURL }) {
    const [showAddFilters, setAddFilters] = useState(false)
    let material = materials.map((mat)=> mat)
    let materialId = material.map(m=>m.id)
    let webhookEvents = material.map(m=>m.webhookEvents)
    
    console.log(material.map(m=>m))
    const selectr = webhookEvents ? webhookEvents.map((s)=>s) : ""
    console.log(selectr)
    

    function handleAddFilter() {
        setAddFilters(true)
    }

    if (materials.length === 1 && materials[0].type === SourceTypeMap.PullRequest) {
        return <>
            <div className="pull-request-info bcb-1 bw-1 eb-5 br-4 mt-16">
                <Info className="icon-dim-20" />
                <p className="fs-13 cn-9 m-0">
                    <span className="fw-6 mr-5">Info:</span>
                    This will merge the source and target branches locally to build an image. No changes will be pushed to your remote git repository.
                </p>
            </div>
            <div className="bcn-1 pl-16 pr-16 pt-12 pb-12 cn-9 br-5 mt-16">
                <div className="configure-ci-webhook flex left">
                    <Webhook className="icon-dim-24" />
                    <div>
                        <p className="fs-13 fw-6 m-0">Pre Requisite: Configure Webhook</p>
                        <p className="fs-13 m-0">Use below details to add a webhook to the git repository.</p>
                    </div>
                </div>
                <div className="flex left fs-12 fw-6 mt-12">
                    <div className="bcn-0 pt-6 pb-6 pl-12 pr-12 pt-6 pb-2 br-4 bw-1 en-2 mr-12 flex left">Click to copy webhook URL
                        <Copy className="icon-dim-16 ml-4 cursor" onClick={copyWebhookURL} />
                    </div>
                    <div className="bcn-0 pt-6 pb-6 pl-12 pr-12 pt-6 pb-2 br-4 bw-1 en-2 flex left">Click to copy secret key
                        <Copy className="icon-dim-16 ml-4 cursor" onClick={copySecretKey} />
                    </div>
                </div>
            </div>
            <div >
                <p className="mt-16 mb-16 fs-13 cn-7">Build pull requests which match below filters only</p>
                <div className="pull-request-fillter mb-16">
                    <ReactSelect
                        className="w-200"
                        autoFocus
                        components={{
                            DropdownIndicator,
                        }}
                        tabIndex="1"
                        placeholder="Select Project"
                        styles={{
                            ...styles,
                            ...menuList,
                        }}
                    // onChange={(selected) => { this.props.handleProjectChange(parseInt((selected as any).value)) }}
                    // options={}
                    />
                    <input type="text" className="form__input" placeholder="Enter target branch" />
                </div>
                <div className="pull-request-fillter mb-16">
                    <input type="text" className="form__input" value="Source branch (regex)" disabled placeholder="" />
                    <input type="text" className="form__input" placeholder="Enter target branch" />
                </div>
                {showAddFilters ?
                    <div className="pull-request-fillter mb-16">
                        <ReactSelect
                            className="w-200"
                            autoFocus
                            components={{
                                DropdownIndicator,
                            }}
                            tabIndex="1"
                            placeholder="Select Project"
                            styles={{
                                ...styles,
                                ...menuList,
                            }}
                        // onChange={(selected) => { this.props.handleProjectChange(parseInt((selected as any).value)) }}
                        // options={projects}
                        />
                        <input type="text" className="form__input" placeholder="Enter target branch" />
                    </div> : null}

                {/* <div className="pull-request-fillter">
                    <input type="text" className="form__input" value="Target branch (regex)" disabled placeholder="" />
                    <input type="text" className="form__input" placeholder="Enter Source branch" />
                </div> */}
                <div className="cb-5 fw-6 fs-14 cursor" onClick={handleAddFilter}>
                    <Add className="icon-dim-20 mr-5 fs-14 fcb-5 mr-12 vertical-align-bottom " />Add Filter
                </div>
            </div>
        </>
    }
    return null;
} 