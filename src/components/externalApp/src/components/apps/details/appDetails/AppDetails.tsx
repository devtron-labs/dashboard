import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import ResourceTreeNodes from '../../resourceTreeNode/ResourceTreeNode';
// import { multiSelectStyles } from '../../../common/MultiSelect/MutiSelectCustomisation';
import '../../../../../css/base.scss';
import '../../../../../css/formulae.scss';
import ExternalAppScaleModal from '../../externalAppScaleModal/ExternalScalePodModal';

export default function AppDetails() {

    const [hiberbateConfirmationModal, setHibernateConfirmationModal] = useState('');
    const [showhiberbateConfirmationModal, setshowHibernateConfirmationModal] = useState(false);
    

    const EnvSelector = () => {
        return <div className=""><div className="flex left mt-16 ml-24 mr-24 mb-16 top">
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
          <button className="cta pb-16" onClick={()=>setshowHibernateConfirmationModal(true)}>
          Scale Pd To 0
      </button>
      { showhiberbateConfirmationModal && <ExternalAppScaleModal onClose={() => setshowHibernateConfirmationModal(false)}/> }

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

    return (<div style={{ overflowY: "auto", height: "100%" }}>
        {EnvSelector()}
        {deploymentStatus()}
        {ResourceTreeNodes()}
    </div>


    )
}

