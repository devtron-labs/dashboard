import React, { useContext } from 'react'
import { TaskFieldDescription, TaskFieldLabel } from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import TaskFieldTippyDescription from './TaskFieldTippyDescription'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { CustomInput } from '@devtron-labs/devtron-fe-common-lib'

function OutputDirectoryPath() {
    const {
        selectedTaskIndex,
        formData,
        setFormData,
        activeStageName,
    } = useContext(pipelineContext)

    const addOutputDirectoryPath = (): void => {
        const _formData = { ...formData }

        if (!_formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath) {
            _formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath = []
        }
        _formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath.unshift('')
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
        <div className="mb-12">
            <div className="row-container">
                <TaskFieldTippyDescription
                    taskField={TaskFieldLabel.OUTPUTDIRECTORYPATH}
                    contentDescription={TaskFieldDescription.OUTPUTDIRECTORYPATH}
                />
                <div
                    data-testid="output-directory-path-add-path-button"
                    className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32"
                    onClick={addOutputDirectoryPath}
                >
                    <Add className="add-icon mt-6" />
                    Add path
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath?.map((elm, index) => {
                return (
                    <div className="custom-script__output-directory pl-220 mt-8" key={`output-directory-${index}`}>
                        <CustomInput
                            data-testid="output-directory-path-add-path-textbox"
                            rootClassName="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                            placeholder="Enter directory path"
                            value={elm}
                            onChange={(e) => handleStoreArtifact(e, index)}
                            name="directory-path"
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
