import React, { useContext } from 'react'
import { FormType, TaskFieldDescription, TaskFieldLabel } from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ciPipelineContext } from './CIPipeline'
import TaskFieldTippyDescription from './TaskFieldTippyDescription'

enum PortMap {
    PORTONLOCAL = 'portOnLocal',
    PORTONCONTAINER = 'portOnContainer',
}

function MultiplePort() {
    const {
        selectedTaskIndex,
        formData,
        setFormData,
        activeStageName,
    }: {
        selectedTaskIndex: number
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        activeStageName: string
    } = useContext(ciPipelineContext)
    const addMultiplePort = (): void => {
        const _formData = { ...formData }

        if (!_formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap = []
        }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap.push({
            portOnLocal: undefined,
            portOnContainer: undefined,
        })
        setFormData(_formData)
    }

    const handlePort = (e, index) => {
        const _formData = { ...formData }
        console.log(e.target.value)
        if (e.target.value === undefined) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap = []
        } else {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap[index][e.target.name] =
            e.target.value ? parseInt(e.target.value) : undefined
        }
        setFormData(_formData)
    }

    const deleteMultiplePort = (index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap.splice(index, 1)
        console.log(_formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap)

        setFormData(_formData)
    }

    return (
        <div>
            <div className="row-container mb-4">
                <TaskFieldTippyDescription
                    taskField={TaskFieldLabel.PORTMAPPING}
                    contentDescription={TaskFieldDescription.PORTMAPPING}
                />
                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32" onClick={addMultiplePort}>
                    <Add className="add-icon mt-6" />
                    Add port
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap?.map((elm, index) => {
                return (
                    elm[PortMap.PORTONLOCAL] !==0 &&
                    elm[PortMap.PORTONCONTAINER] !== 0 && (
                        <div className="custom-input__port-map pl-220 pb-8" key={`multiple-port-${index}`}>
                            <input
                                style={{ width: '80% !important' }}
                                className="w-100 bcn-1 border left-radius-4 pl-10 pr-10 pt-5 pb-5"
                                autoComplete="off"
                                placeholder="Port"
                                type="text"
                                onChange={(e) => handlePort(e, index)}
                                name={PortMap.PORTONLOCAL}
                                value={elm[PortMap.PORTONLOCAL]}
                            />
                            <div className="flex border-top border-bottom">:</div>
                            <input
                                style={{ width: '80% !important' }}
                                className="w-100 bcn-1 border right-radius-4 pl-10 pr-10 pt-5 pb-5"
                                autoComplete="off"
                                placeholder="Port"
                                type="text"
                                onChange={(e) => handlePort(e, index)}
                                name={PortMap.PORTONCONTAINER}
                                value={elm[PortMap.PORTONCONTAINER]}
                            />
                            <Close
                                className="icon-dim-24 pointer mt-6 ml-6"
                                onClick={() => {
                                    deleteMultiplePort(index)
                                }}
                            />
                        </div>
                    )
                )
            })}
        </div>
    )
}

export default MultiplePort
