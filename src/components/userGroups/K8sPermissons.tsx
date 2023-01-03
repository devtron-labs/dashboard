import React, { useEffect, useState } from 'react'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import K8sPermissionModal from './K8sPermissionModal'
import { ActionTypes, OptionType } from './userGroups.types'


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
                    {k8sPermission?.map((element) => {
                        return (
                            <div className="kubernetes-header pt-12 pb-12 dc__border-bottom-n1">
                                <span>{element.cluster.label}</span>
                                <span>{element.group.label}</span>
                                <span>{element.kind.label}</span>
                                <span>{element.namespace.label}</span>
                                <span>
                                    {element.resource.length > 1
                                        ? element.resource.length + 'objects'
                                        : element.resource.label}
                                </span>
                                <span>{element.action.label}</span>
                                <span onClick={() => editPermission(element)}>edit</span>
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
