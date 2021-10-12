import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import ResourceTreeNodes from '../resourceTreeNode/ResourceTreeNode';
import EventsLogsTabsModal from '../eventsLogsTabs/EventsLogsTabs';
// import { multiSelectStyles } from '../../../common/MultiSelect/MutiSelectCustomisation';
import '../../../../../css/base.scss';
import '../../../../../css/formulae.scss';
import ExternalAppScaleModal from '../externalAppScaleModal/ExternalScalePodModal';
import { DeploymentStatusModal } from '../DeploymentStatusModal';
import './appDetail.css'
import CodeEditor from '../../../../../../CodeEditor/CodeEditor';
import { EventsLogsTabSelector} from '../eventsLogsTabs/EventsLogsTabs'
import { ReactComponent as Object } from '../../../../assets/icons/ic-object.svg';


export default function AppDetails() {

    const [showhiberbateConfirmationModal, setshowHibernateConfirmationModal] = useState(false);
    const [ showResourceTreeNode, setShowResourceTreeNode] = useState(false)

    const EnvironmentSelector = () => {
        return <div className="flex flex-justify mt-16 ml-24 mr-24 mb-16">
            <div className="flex left top w-100">
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
            <button className="cta pb-16" onClick={() => setshowHibernateConfirmationModal(true)}>
                Scale Pd To 0
            </button>
            {showhiberbateConfirmationModal && <ExternalAppScaleModal onClose={() => setshowHibernateConfirmationModal(false)} />}
        </div>
    }

    function ResourceTreeTabs() {
        const [showTabDetails, setShowTabDetails] = useState(false)
    
        function toggleShowDetail() {
            setShowTabDetails(!showTabDetails)
        }
    
        return <div className="mt-16">
            <div className=" flex left ">
                <div className="fs-13 w-200 cn-9 fw-6 br-8 pt-8 pb-8 pl-24 pr-16 cursor flex left mr-8"><Object /> K8s Resources</div>
                <div onClick={toggleShowDetail} className="fs-13 bcn-0 w-200 en-2 bw-1 cn-9 flex left  fw-6 br-8 pt-8 pb-8 pl-16 pr-16 cursor"><Object />Logs Analzer</div>
            </div>
            {showTabDetails && <div className="bcn-0">
                <EventsLogsTabSelector />
            </div>
            }
        </div>
    }


    return (<div style={{ overflowY: "auto", height: "100%" }}>
        <EnvironmentSelector />
        <DeploymentStatusModal />
        <ResourceTreeTabs />

      { showResourceTreeNode &&  <ResourceTreeNodes
      showResourceTreeNode={showResourceTreeNode}
      setShowResourceTreeNode={setShowResourceTreeNode}
      />}
        <EventsLogsTabsModal />
       

    </div>
    )
}

