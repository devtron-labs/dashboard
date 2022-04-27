import React, { useContext } from 'react'
import { BuildStageVariable, ConfigurationType, DOCUMENTATION, TriggerType } from '../../config'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { TaskList } from './TaskList'
import { ciPipelineContext } from './CIPipeline'
import { FormType } from '../ciPipeline/types'
import { Toggle } from '../common'

export function Sidebar() {
    const {
        formData,
        setFormData,
        configurationType,
        setConfigurationType,
        activeStageName,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        configurationType: string
        setConfigurationType: React.Dispatch<React.SetStateAction<string>>
        activeStageName: string
    } = useContext(ciPipelineContext)
    const changeTriggerType = (appCreationType: string): void => {
        const _formData = { ...formData }
        _formData.triggerType = appCreationType
        setFormData(_formData)
    }
    const handleScanToggle = (e): void => {
        let _formData = { ...formData }
        _formData.scanEnabled = !_formData.scanEnabled
        setFormData(_formData)
    }

    const activeStageNameForDescription = () => {
       if(activeStageName !== BuildStageVariable.Build){
           return 'build'
       }else if(activeStageName !== BuildStageVariable.PostBuild){
           return 'post-build'
       }else if(activeStageName !== BuildStageVariable.PreBuild){
           return 'pre-build'
       }
    }

    return (
        <div className="">
            {activeStageName !== BuildStageVariable.Build && (
                <div className="sidebar-action-container sidebar-action-container-border">
                    {configurationType === ConfigurationType.GUI && (
                        <>
                            <div className="text-uppercase fw-6 fs-12 cn-6 mb-10">Tasks (IN ORDER OF EXECUTION)</div>
                            <TaskList />
                        </>
                    )}
                </div>
            )}
            {activeStageName === BuildStageVariable.Build && (
                <div className="sidebar-action-container sidebar-action-container-border">
                    <div className="text-uppercase fw-6 fs-12 cn-6 mb-12">Trigger BUILD PIPELINE</div>
                    <div>
                        <RadioGroup
                            className="no-border"
                            value={formData.triggerType}
                            name="trigger-type"
                            onChange={(event) => {
                                changeTriggerType(event.target.value)
                            }}
                        >
                            <RadioGroupItem value={TriggerType.Auto}>Automatically</RadioGroupItem>
                            <RadioGroupItem value={TriggerType.Manual}>Manually</RadioGroupItem>
                        </RadioGroup>
                    </div>
                </div>
            )}
               {activeStageName === BuildStageVariable.PostBuild && (
            <div className="sidebar-action-container sidebar-action-container-border " >
                <div className='en-2 bw-1 br-4 pt-10 pb-10 pl-12 pr-12' style={{display: 'grid', gridTemplateColumns:'auto 32px'}}>
                <div>
                    <p className="fs-13 fw-6 cn-9 mb-4 ">Scan for vulnerabilities</p>
                    <p className="ci-stage__description mb-0">Perform security scan after container image is built.</p>
                </div>
                <div className="mt-4" style={{ width: '32px', height: '20px' }}>
                    <Toggle
                        disabled={window._env_.FORCE_SECURITY_SCANNING && formData.scanEnabled}
                        selected={formData.scanEnabled}
                        onSelect={handleScanToggle}
                    />
                </div>
                </div>
            </div>
            )}
            <div className="sidebar-action-container ">
                <div className="text-uppercase fw-6 fs-13 cn-9 mb-8">📙 Need help?</div>
                <div>
                    <a
                        className="learn-more__href fw-6"
                        href={DOCUMENTATION.PRE_BUILD_TASK}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        Docs: Configure {activeStageNameForDescription() } stage tasks
                    </a>
                </div>
            </div>
        </div>
    )
}
