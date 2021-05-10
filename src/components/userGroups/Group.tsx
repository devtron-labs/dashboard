
import React, { useState, useEffect } from 'react'
import { showError, Progressing, removeItemsFromArray, mapByKey, DeleteDialog } from '../common'
import { ResizableTextarea } from '../configMaps/ConfigMap'
import { saveGroup, deleteGroup } from './userGroup.service';

import { DirectPermissionsRoleFilter, ChartGroupPermissionsFilter, EntityTypes, ActionTypes, APIRoleFilter, CreateGroup } from './userGroups.types'
import './UserGroup.scss';
import { toast } from 'react-toastify'
import { DirectPermission, ChartPermission, useUserGroupContext } from './UserGroup'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg';

export default function GroupForm({ id = null, index = null, groupData = null, updateCallback, deleteCallback, createCallback, cancelCallback }) {
    // id null is for create
    const emptyDirectPermission: DirectPermissionsRoleFilter = {
        entity: EntityTypes.DIRECT,
        entityName: [],
        environment: [],
        team: null,
        action:
        {
            label: "",
            value: ActionTypes.VIEW
        }
    }
    const { appsList, fetchAppList, projectsList, environmentsList } = useUserGroupContext()
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({ entity: EntityTypes.CHART_GROUP, action: ActionTypes.VIEW, entityName: [] })
    const [submitting, setSubmitting] = useState(false)
    const [name, setName] = useState({ value: "", error: "" })
    const [description, setDescription] = useState("")
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false)

    function isFormComplete(): boolean {
        let isComplete: boolean = true
        const tempPermissions = directPermission.reduce((agg, curr) => {
            if (curr.team && curr.entityName.length === 0) {
                isComplete = false
                curr.entityNameError = 'Applications are mandatory'
            }
            if (curr.team && curr.environment.length === 0) {
                isComplete = false
                curr.environmentError = 'Environments are mandatory'
            }
            agg.push(curr)
            return agg
        }, [])

        if (!isComplete) {
            setDirectPermission(tempPermissions)
        }

        return isComplete
    }

    async function handleSubmit(e) {
        if (!name.value) {
            setName(name => ({ ...name, error: 'Group name is mandatory' }))
            return
        }
        if (!isFormComplete()) {
            return;
        }
        setSubmitting(true)
        const payload: CreateGroup = {
            id: id || 0,
            name: name.value,
            description,
            roleFilters: [
                ...directPermission
                    .filter(
                        (permission) =>
                            permission.team?.value && permission.environment.length && permission.entityName.length,
                    )
                    .map((permission) => ({
                        ...permission,
                        action: permission.action.value,
                        team: permission.team.value,
                        environment: permission.environment.find((env) => env.value === '*')
                            ? ''
                            : permission.environment.map((env) => env.value).join(','),
                        entityName: permission.entityName.find((entity) => entity.value === '*')
                            ? ''
                            : permission.entityName.map((entity) => entity.value).join(','),
                    })),
                {
                    ...chartPermission,
                    team: '',
                    environment: '',
                    entityName: chartPermission.entityName.map((entity) => entity.value).join(','),
                },
            ],
        };

        try {
            const { result } = await saveGroup(payload)
            if (id) {
                updateCallback(index, result)
                toast.success('Group updated')
            }
            else {
                createCallback(result)
                toast.success('Group createed')
            }
        }
        catch (err) {
            showError(err)
        }
        finally {
            setSubmitting(false)
        }
    }
    useEffect(() => {
        if (!groupData) {
            setDirectPermission([emptyDirectPermission])
            return
        }
        populateDataFromAPI(groupData)
    }, [groupData])

    async function populateDataFromAPI(data: CreateGroup) {
        const { roleFilters, id, name, description } = (data)
        const allProjects = roleFilters.map(roleFilter => roleFilter.team).filter(Boolean)
        const projectsMap = mapByKey(projectsList, 'name')
        const allProjectIds = allProjects.map(p => projectsMap.get(p).id)
        const uniqueProjectIds = Array.from(new Set(allProjectIds))
        await fetchAppList(uniqueProjectIds)
        const directPermissions: DirectPermissionsRoleFilter[] = roleFilters
            ?.filter(roleFilter => roleFilter.entity === EntityTypes.DIRECT)
            ?.map(directRolefilter => {
                const projectId = projectsMap.get(directRolefilter.team).id;
                return {
                    ...directRolefilter,
                    action: { label: directRolefilter.action, value: directRolefilter.action },
                    team: { label: directRolefilter.team, value: directRolefilter.team },
                    entity: EntityTypes.DIRECT,
                    entityName: directRolefilter?.entityName
                        ? directRolefilter.entityName.split(',').map((entity) => ({ value: entity, label: entity }))
                        : [
                            { label: 'All applications', value: '*' },
                            ...(appsList.get(projectId)?.result || []).map((app) => ({
                                label: app.name,
                                value: app.name,
                            })),
                        ],
                    environment: directRolefilter.environment
                        ? directRolefilter.environment
                            .split(',')
                            .map((directRole) => ({ value: directRole, label: directRole }))
                        : [
                            { label: 'All environments', value: '*' },
                            ...environmentsList.map((env) => ({
                                label: env.environment_name,
                                value: env.environment_name,
                            })),
                        ],
                } as DirectPermissionsRoleFilter;
            })
        if (directPermissions.length > 0) {
            setDirectPermission(directPermissions)
        }
        else {
            setDirectPermission([emptyDirectPermission])
        }

        setName({ value: name, error: "" })
        setDescription(description)

        const tempChartPermission: APIRoleFilter = roleFilters?.find(roleFilter => roleFilter.entity === EntityTypes.CHART_GROUP)
        if (tempChartPermission) {
            const chartPermission: ChartGroupPermissionsFilter = {
                entity: EntityTypes.CHART_GROUP,
                entityName: tempChartPermission?.entityName.split(",")?.map(entity => ({ value: entity, label: entity })) || [],
                action: tempChartPermission.action === '*' ? ActionTypes.ADMIN : tempChartPermission.action
            }

            setChartPermission(chartPermission)
        }
    }

    function handleDirectPermissionChange(index, selectedValue, actionMeta) {
        const { action, option, name } = actionMeta
        const tempPermissions = [...directPermission]
        if (name === 'entityName') {
            const { label, value } = option;
            if (value === '*') {
                if (action === 'select-option') {
                    const projectId = projectsList.find(
                        (project) => project.name === tempPermissions[index]['team'].value,
                    ).id;
                    tempPermissions[index][name] = [
                        { label: 'Select all', value: '*' },
                        ...appsList.get(projectId).result.map((app) => ({ label: app.name, value: app.name })),
                    ];
                    tempPermissions[index]['entityNameError'] = null;
                } else {
                    tempPermissions[index][name] = [];
                }
            } else {
                tempPermissions[index][name] = selectedValue.filter(({ value, label }) => value !== '*');
                tempPermissions[index]['entityNameError'] = null;
            }
        } else if (name === 'environment') {
            const { label, value } = option;
            if (value === '*') {
                if (action === 'select-option') {
                    // check all environments
                    tempPermissions[index][name] = [
                        { label: 'All environments', value: '*' },
                        ...environmentsList.map((env) => ({
                            label: env.environment_name,
                            value: env.environment_name,
                        })),
                    ];
                    tempPermissions[index]['environmentError'] = null;
                } else {
                    // uncheck all environments
                    tempPermissions[index][name] = [];
                }
            } else {
                tempPermissions[index][name] = selectedValue.filter(({ value, label }) => value !== '*');
                tempPermissions[index]['environmentError'] = null;
            }
        } else if (name === 'team') {
            tempPermissions[index][name] = selectedValue;
            const projectId = projectsList.find((project) => project.name === tempPermissions[index]['team'].value).id;
            tempPermissions[index]['entityName'] = [];
            tempPermissions[index]['environment'] = [];
            fetchAppList([projectId]);
        } else {
            tempPermissions[index][name] = selectedValue;
        }
        setDirectPermission(tempPermissions)
    }

    async function handleDelete() {
        setSubmitting(true)
        try {
            await deleteGroup(id)
            toast.success('Group deleted')
            deleteCallback(index)
        }
        catch (err) {
            showError(err)
        }
        finally {
            setSubmitting(false)
        }
    }

    function removeDirectPermissionRow(index) {
        if (index === 0 && directPermission.length === 1) {
            setDirectPermission([emptyDirectPermission])
        }
        else {
            setDirectPermission(permission => removeItemsFromArray(permission, index, 1))
        }
    }

    return (
        <div className="user-form">
            <label className="form__label">Group name*</label>
            {name.error && <label className="form__error">{name.error}</label>}
            <input type="text" className="form__input mb-16" disabled={!!id} value={name.value} onChange={e => setName({ value: e.target.value, error: '' })} />
            <label htmlFor="" className="form__label">Description</label>
            <ResizableTextarea
                name=""
                maxHeight={300}
                className="w-100"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            <fieldset>
                <legend>Direct permissions</legend>
                <div className="w-100 mb-26" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 24px', gridGap: '16px', alignItems: 'center' }}>
                    <label className="bold">Project</label>
                    <label className="bold">Environment</label>
                    <label className="bold">Application</label>
                    <label className="bold">Role</label>
                    <span />
                    {directPermission.map((permission, idx) =>
                        <DirectPermission
                            index={idx}
                            key={idx}
                            permission={permission}
                            removeRow={removeDirectPermissionRow}
                            handleDirectPermissionChange={(value, actionMeta) => handleDirectPermissionChange(idx, value, actionMeta)}
                        />)}
                </div>
                <b className="anchor pointer flex left" style={{ width: '90px' }} onClick={e => setDirectPermission(permission => [...permission, emptyDirectPermission])}><AddIcon className="add-svg mr-12" /> Add row</b>
            </fieldset>
            <ChartPermission chartPermission={chartPermission} setChartPermission={setChartPermission} />
            <div className="flex right mt-32">
                {id && <button className="cta delete" style={{ marginRight: 'auto' }} onClick={e => setDeleteConfirmationModal(true)}>Delete</button>}
                <button disabled={submitting} onClick={cancelCallback} type="button" className="cta cancel mr-16">Cancel</button>
                <button disabled={submitting} type="button" className="cta" onClick={handleSubmit}>{submitting ? <Progressing /> : 'Save'}</button>
            </div>
            {deleteConfirmationModal && <DeleteDialog title={`Delete group '${name.value}'?`}
                description={'Deleting this group will revoke permissions from users added to this group.'}
                closeDelete={() => setDeleteConfirmationModal(false)}
                delete={handleDelete} />}
        </div>
    )
}