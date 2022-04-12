import React from 'react'
import { FormType, PluginVariableType, VariableFieldType } from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'

function OutputDirectoryPath({
    type,
    selectedTaskIndex,
    formData,
    setFormData,
    activeStageName,
}: {
    type: PluginVariableType
    selectedTaskIndex: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    activeStageName: string
}) {

    const addOutputDirectoryPath = (): void => {
        const _formData = { ...formData }

        if(!_formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath){
            _formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath = []
        }
        _formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath.push('')
        setFormData(_formData)
    }

    const handleStoreArtifact = (ev, index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath[index] = ev.target.value
        setFormData(_formData)
    }

    const deleteOutputDirectory = (index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath.splice(index, 1)
        setFormData(_formData)
    }
    
    return (
        <div>
            <div className="row-container mb-10">
                <label className="fw-6 fs-13 cn-7 label-width">Output directory path</label>
                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit" onClick={addOutputDirectoryPath}>
                    <Add className="add-icon" />
                    Add path
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath?.map((elm, index) => {
                return (
                    <div className='custom-script__output-directory pl-200 pb-20'>
                        {' '}
                        <input
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder="Enter directory path"
                            type="text"
                            value={elm}
                            onChange={(e) =>handleStoreArtifact(e, index)}
                        />
                        <Close
                            className="icon-dim-24 pointer mt-6 ml-6"
                            onClick={() => {
                                deleteOutputDirectory(index)
                            }}
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default OutputDirectoryPath
