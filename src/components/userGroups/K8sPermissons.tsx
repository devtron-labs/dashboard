import React, { useEffect, useState } from 'react'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import K8sPermissionModal from './K8sPermissionModal'
import { ActionTypes, OptionType } from './userGroups.types'
import { ReactComponent as Clone } from '../../assets/icons/ic-copy.svg'
import { ReactComponent as Delete } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'


const headerOptions = ['CLUSTER', 'API GROUP', 'KIND', 'NAMESPACE', 'OBJECT', 'ROLE']

const cluster = ['dmxkd', 'nxjnmsjxm', 'dcxnjdn', 'jndcjnxdj', 'undc']
const apiGroup = ['item', 'dcdc', 'heheh', 'sjnd']
const possibleRole = [ActionTypes.VIEW, ActionTypes.ADMIN, ActionTypes.MANAGER]

export default function K8sPermissons({ k8sPermission, setK8sPermission }) {
    const [toggleModal, setToggleModal] = useState<boolean>()
    const [tempPermission, setTempPermission] = useState()
    const openModal = () => {
        setToggleModal(true)
    }

    const editPermission = (permissions) => {
        setToggleModal(true)
        setTempPermission(permissions)
    }

    const creatPermission = () => {
        setToggleModal(true)
        setTempPermission(null)
    }

    const deletePermission = (index) => {
        k8sPermission.splice(index, 1)
        setK8sPermission([...k8sPermission]);
    }
    

    return (
        <>
            <div className="anchor pointer flex left mt-16 fs-13 fw-6" onClick={creatPermission}>
                <AddIcon className="add-svg mr-12" /> Add permission
            </div>
            {k8sPermission.length ? (
                <div className="mt-16">
                    <div className="kubernetes-header dc__border-bottom fw-6 pt-8 pb-8">
                        {headerOptions.map((header) => (
                            <span>{header}</span>
                        ))}
                    </div>
                    {k8sPermission?.map((element,index) => {
                        return (
                            <div className="kubernetes-header pt-12 pb-12 cn-9 dc__border-bottom-n1">
                                <span className='dc__truncate-text'>{element.cluster.label}</span>
                                <span className='dc__truncate-text'>{element.group.label}</span>
                                <span className='dc__truncate-text'>{element.kind.label}</span>
                                <span className='dc__truncate-text'>{element.namespace.label}</span>
                                <span className='dc__truncate-text'>
                                    {element.resource.length > 1
                                        ? element.resource.length + 'objects'
                                        : element.resource[0].label}
                                </span>
                                <span className='dc__truncate-text'>{element.action.label}</span>
                                <span>
                                    <Clone className='icon-dim-16 cursor mr-8' onClick={() => editPermission(element)}/>
                                    <Edit className='icon-dim-16 cursor mr-8' onClick={() => editPermission(element)} />
                                    <Delete className='icon-dim-16 cursor' onClick={() => deletePermission(index)}/>
                                </span>
                            </div>
                        )
                    })}
                </div>
            ) : null}
            {toggleModal && (
                <K8sPermissionModal
                    k8sPermission={tempPermission}
                    setK8sPermission={setK8sPermission}
                    close={setToggleModal}
                />
            )}
        </>
    )
}
