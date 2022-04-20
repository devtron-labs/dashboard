import React from 'react'
import { FormType } from '../ciPipeline/types'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'

enum MountPathMap {
    FILEPATHONDISK = 'filePathOnDisk',
    FILEPATHONCONTAINER= 'filePathOnContainer'
}

function MountFromHost({
    formData,
    activeStageName,
    selectedTaskIndex,
    setFormData,
}: {
    formData: FormType
    activeStageName: string
    selectedTaskIndex: number
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
}) {
    const addMountDirectoryfromHost = () => {
        const _formData = { ...formData }

        if (!_formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap = []
        }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap.push({
            filePathOnDisk: null,
            filePathOnContainer : null
        }
        )
        setFormData(_formData)
    }

    const deleteMountPath = (index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap.splice(index, 1)
        setFormData(_formData)
    }
    const handleMountPath = (e, index) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap[index][e.target.name] =
            e.target.value
        setFormData(_formData)
    }

    return (
        <>
            <div className="row-container mb-10">
                <label className="fw-6 fs-13 cn-7 label-width"></label>
                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit" onClick={addMountDirectoryfromHost}>
                    <Add className="add-icon" />
                    Add mapping
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap?.map(
                (mountPathMap, index) => {
                    return (
                        <div className="mount-row mb-10">
                           <label className="fw-6 fs-13 cn-7 label-width"></label>
                            <input
                                className="bcn-1 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                                autoComplete="off"
                                placeholder="File path on Host"
                                type="text"
                                onChange={(e) => handleMountPath(e, index)}
                                value={mountPathMap[MountPathMap.FILEPATHONDISK]}
                                name={MountPathMap.FILEPATHONDISK}
                            />
                            <div className="flex bw-1 en-2">:</div>
                            <input
                                className="bcn-1 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                                autoComplete="off"
                                placeholder="File path on container"
                                type="text"
                                onChange={(e) => handleMountPath(e, index)}
                                value={mountPathMap[MountPathMap.FILEPATHONCONTAINER]}
                                name={MountPathMap.FILEPATHONCONTAINER}
                            />
                             <Close
                            className="icon-dim-24 pointer mt-6 ml-6"
                            onClick={() => {
                                deleteMountPath(index)
                            }}
                        />
                        </div>
                    )
                },
            )}
        </>
    )
}

export default MountFromHost
