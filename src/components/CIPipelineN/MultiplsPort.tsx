import React, { useContext } from 'react'
import { FormType } from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ciPipelineContext } from './CIPipeline'

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
            portOnLocal: null,
            portOnContainer: null,
        })
        setFormData(_formData)
    }

    const handlePort = (e, index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap[index][e.target.name] =
            e.target.value
        setFormData(_formData)
    }

    const deleteMultiplePort = (index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap.splice(index, 1)
        setFormData(_formData)
    }

    return (
        <div>
            <div className="row-container mb-10">
                <label className="fw-6 fs-13 cn-7 label-width">Port mapping</label>{' '}
                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit" onClick={addMultiplePort}>
                    <Add className="add-icon" />
                    Add port
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap.map((elm, index) => {
                return (
                    <div className="custom-input__port-map pl-200 pb-20 ">
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder="Port"
                            type="text"
                            onChange={(e) => handlePort(e, index)}
                            name={PortMap.PORTONLOCAL}
                            value={elm[PortMap.PORTONLOCAL]}
                        />
                        <div className="flex">:</div>
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
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
            })}
        </div>
    )
}

export default MultiplePort
