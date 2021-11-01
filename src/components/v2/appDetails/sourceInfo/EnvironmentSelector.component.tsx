import React, { useState } from 'react'
import Select, { components } from 'react-select';
import { multiSelectStyles, SingleSelectOption as Option, } from '../../../common'
import ScalePodModalComponent from './ScalePodModal.component';
import './sourceInfo.css';

function EnvironmentSelectorComponent() {
    const [showhiberbateConfirmationModal, setshowHibernateConfirmationModal] = useState(false);

    return (
        <div className="flexbox flex-justify pl-20 pr-20 pt-16 pb-16">
            <div>
                <div className="flexbox">
                    <div style={{ width: 'clamp( 100px, 30%, 200px )', height: '100%', position: 'relative' }}>
                        <svg
                            viewBox="0 0 200 40"
                            preserveAspectRatio="none"
                            style={{ width: '100%', height: '100%', display: 'flex' }}
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
                            // options={Array.isArray(environments) ? environments.map(env => ({ label: env.environmentName, value: env.environmentId })) : []}
                            placeholder='Select Environment'
                            // value={envId ? { value: +envId, label: environmentName } : null}
                            // onChange={(selected, meta) => selectEnvironment((selected as any).value)}
                            closeMenuOnSelect
                            // components={{ IndicatorSeparator: null, Option, DropdownIndicator: disabled ? null : components.DropdownIndicator }}
                            styles={{
                                ...multiSelectStyles,
                                control: (base, state) => ({ ...base, border: '1px solid #0066cc', backgroundColor: 'transparent' }),
                                singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' })
                            }}
                            // isDisabled={disabled}
                            isSearchable={false}
                        />
                    </div>
                </div>
            </div>
            <div >
                <button className="cta pb-16" onClick={() => setshowHibernateConfirmationModal(true)}>
                    Scale Pd To 0
            </button>
            </div>
            {showhiberbateConfirmationModal && <ScalePodModalComponent onClose={() => setshowHibernateConfirmationModal(false)} />}
        </div>
    )
}

export default EnvironmentSelectorComponent
