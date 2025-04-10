/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useContext } from 'react'

import { CustomInput } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { MountPathMap } from '../ciPipeline/types'
import { pipelineContext } from '../workflowEditor/workflowEditor'

const MountFromHost = () => {
    const { selectedTaskIndex, formData, setFormData, activeStageName, formDataErrorObj } = useContext(pipelineContext)
    const addMountDirectoryfromHost = () => {
        const _formData = { ...formData }

        if (!_formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap = []
        }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap.unshift({
            filePathOnDisk: '',
            filePathOnContainer: '',
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
            <div className="row-container mb-12">
                <div className="fw-6 fs-13 lh-32 cn-7 " />
                <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32" onClick={addMountDirectoryfromHost}>
                    <Add className="add-icon mt-6" />
                    Add mapping
                </div>
            </div>
            {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap?.map(
                (mountPathMap, index) => {
                    const errorObj =
                        formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail?.mountPathMap?.[
                            index
                        ]
                    return (
                        <>
                            <div className="mount-row mb-4 mt-4">
                                <div className="fw-6 fs-13 lh-32 cn-7 " />
                                <CustomInput
                                    borderRadiusConfig={{
                                        right: false,
                                    }}
                                    placeholder="File path on Host"
                                    onChange={(e) => handleMountPath(e, index)}
                                    value={mountPathMap[MountPathMap.FILEPATHONDISK]}
                                    name={MountPathMap.FILEPATHONDISK}
                                />
                                <div className="flex bw-1 en-2">:</div>
                                <CustomInput
                                    borderRadiusConfig={{
                                        left: false,
                                    }}
                                    placeholder="File path on container"
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
                            <div className="pl-220">
                                {errorObj && !errorObj.isValid && (
                                    <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                        <span>{errorObj.message}</span>
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
