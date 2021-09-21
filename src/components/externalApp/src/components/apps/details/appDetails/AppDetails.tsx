import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import ResourceTreeNodes from '../../../../../../app/ResourceTreeNodes';
// import { multiSelectStyles } from '../../../common/MultiSelect/MutiSelectCustomisation';
import '../../../../../css/base.scss';
import '../../../../../css/formulae.scss';

export default function AppDetails() {

    const EnvSelector = () => {
        return <div className="flex left mt-16 ml-24 mr-24 mb-16 top">
            <div style={{ width: 'clamp( 100px, 30%, 200px )', position: 'relative' }}>
                <svg
                    viewBox="0 0 200 40"
                    preserveAspectRatio="none"
                    style={{ display: 'flex', justifyContent: 'left' }}
                >
                    <path d="M0 20 L200 20 Z" strokeWidth="1" stroke="#0066cc" />
                    <path d="M0 10 L0, 30" strokeWidth="2" stroke="#0066cc" />
                </svg>
                <div
                    className="bcb-5 br-10 cn-0 pl-8 pr-8"
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                    ENV
            </div>
            </div>
            <div style={{ width: '200px' }}>
                <Select
                    placeholder='Select Environment'
                    closeMenuOnSelect
                    components={{ IndicatorSeparator: null }}
                    styles={{
                        // ...multiSelectStyles,
                        control: (base, state) => ({ ...base, border: '1px solid #0066cc', backgroundColor: 'transparent' }),
                        singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' })
                    }}
                    isSearchable={false}
                />
            </div>

        </div>
    }

    const deploymentStatus = () => {
        return <div className="ml-24 mr-24" style={{
            display: 'grid',
            gridTemplateColumns: '50% 50%',
            minHeight: '92px',
            gridGap: "16px"
        }}>
            <div className="bcn-0 br-8 p-16">
                <div className="cn-9 fw-6">Config Apply</div>
                <div className="cg-5 fw-6 fs-14 cursor">Success</div>
                <div>Last update <span className="fw-6"> 12 mins ago </span> <span className="cb-5">Details</span></div>
            </div>
            <div className="bcn-0 br-8 pt-16 pl-16 pb-16 mr-16">
                <div className="cn-9 fw-6">Application status</div>
                <div className="cg-5 fw-6 fs-14 cursor">Healthy</div>
                <div>The active service is serving traffic to the current pod spec</div>
            </div>
        </div>
    }

    const ResourceTreeNodes = () => {
        return <div className="bcn-0 mt-16 pl-24 pt-16 "
            style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '270px 1fr',
                height: '700px',
                maxHeight: '700px',
                overflow: 'hidden',
                gridTemplateRows: '72px 1fr',
            }}>
            <div>
                <input className="en-2 bw-1 w-100 pt-4 pb-4 pl-8 pr-8 br-4" type="search" placeholder="Search Objects"/>
            </div>

        </div>
    }

    return (<div style={{ overflowY: "auto", height: "100%" }}>
        {EnvSelector()}
        {deploymentStatus()}
        {ResourceTreeNodes()}
    </div>


    )
}

