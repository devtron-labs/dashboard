import React, { useContext } from 'react'
import { FormErrorObjectType, FormType } from '../ciPipeline/types'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ciPipelineContext } from './CIPipeline'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'

enum MountPathMap {
    FILEPATHONDISK = 'filePathOnDisk',
    FILEPATHONCONTAINER = 'filePathOnContainer',
}

function MountFromHost() {
    const {
        selectedTaskIndex,
        formData,
        setFormData,
        activeStageName,
        formDataErrorObj,
    }: {
        selectedTaskIndex: number
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        activeStageName: string
        formDataErrorObj: FormErrorObjectType
    } = useContext(ciPipelineContext)
    const addMountDirectoryfromHost = () => {
        const _formData = { ...formData }

        if (!_formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap = []
        }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap.push({
            filePathOnDisk: null,
            filePathOnContainer: null,
        })
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
                        <>
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
                            <div className="pl-200 mb-20">
                                {formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail
                                    ?.mountPathMap &&
                                    formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                        .mountPathMap[index] &&
                                    !formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                        .mountPathMap[index].isValid && (
                                        <span className="flexbox cr-5 mb-4 mt-4 fw-5 fs-11 flexbox">
                                            <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                            <span>
                                                {
                                                    formDataErrorObj[activeStageName].steps[selectedTaskIndex]
                                                        .inlineStepDetail.mountPathMap[index].message
                                                }
                                            </span>
                                        </span>
                                    )}
                            </div>
                        </>
                    )
                },
            )}
        </>
    )
}

export default MountFromHost
