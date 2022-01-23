import React, { useState, useEffect, useContext } from 'react';
import { showError, Progressing, DeleteDialog } from '../common';
import { ResizableTextarea } from '../configMaps/ConfigMap';
import { saveGroup, deleteGroup } from './userGroup.service';

import {
    DirectPermissionsRoleFilter,
    ChartGroupPermissionsFilter,
    EntityTypes,
    ActionTypes,
    CreateGroup,
} from './userGroups.types';
import './UserGroup.scss';
import { toast } from 'react-toastify';
import AppPermissions from './AppPermissions';
import { ACCESS_TYPE_MAP, SERVER_MODE } from '../../config';
import { mainContext } from '../common/navigation/NavigationRoutes';

export default function GroupForm({
    id = null,
    index = null,
    groupData = null,
    updateCallback,
    deleteCallback,
    createCallback,
    cancelCallback,
}) {
    // id null is for create
    const { serverMode } = useContext(mainContext);
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([]);
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    });
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState({ value: '', error: '' });
    const [description, setDescription] = useState('');
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);

    function isFormComplete(): boolean {
        let isComplete: boolean = true;
        const tempPermissions = directPermission.reduce((agg, curr) => {
            if (curr.team && curr.entityName.length === 0) {
                isComplete = false;
                curr.entityNameError = 'Applications are mandatory';
            }
            if (curr.team && curr.environment.length === 0) {
                isComplete = false;
                curr.environmentError = 'Environments are mandatory';
            }
            agg.push(curr);
            return agg;
        }, []);

        if (!isComplete) {
            setDirectPermission(tempPermissions);
        }

        return isComplete;
    }

    function getSelectedEnvironments(permission) {
      if (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
          return permission.environment.find((env) => env.value === '*')
              ? ''
              : permission.environment.map((env) => env.value).join(',');
      } else {
          let allFutureCluster = {};
          let envList = '';
          permission.environment.forEach((element) => {
              if (element.clusterName === '' && element.value.startsWith('#')) {
                  const clusterName = element.value.substring(1);
                  allFutureCluster[clusterName] = true;
                  envList += (envList !== '' ? ',' : '') + clusterName + '__*';
              } else if (element.clusterName !== '' && !allFutureCluster[element.clusterName]) {
                  envList += (envList !== '' ? ',' : '') + element.value;
              }
          });
          return envList;
      }
  }

    async function handleSubmit(e) {
        if (!name.value) {
            setName((name) => ({ ...name, error: 'Group name is mandatory' }));
            return;
        }
        if (!isFormComplete()) {
            return;
        }
        setSubmitting(true);
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
                        environment: getSelectedEnvironments(permission),
                        entityName: permission.entityName.find((entity) => entity.value === '*')
                            ? ''
                            : permission.entityName.map((entity) => entity.value).join(','),
                    })),
            ],
        };
        if (serverMode !== SERVER_MODE.EA_ONLY) {
            payload.roleFilters.push({
                ...chartPermission,
                team: '',
                environment: '',
                entityName: chartPermission.entityName.map((entity) => entity.value).join(','),
            });
        }

        try {
            const { result } = await saveGroup(payload);
            if (id) {
                updateCallback(index, result);
                toast.success('Group updated');
            } else {
                createCallback(result);
                toast.success('Group createed');
            }
        } catch (err) {
            showError(err);
        } finally {
            setSubmitting(false);
        }
    }
    useEffect(() => {
        groupData && populateDataFromAPI(groupData);
    }, [groupData]);

    async function populateDataFromAPI(data: CreateGroup) {
        const { id, name, description } = data;
        setName({ value: name, error: '' });
        setDescription(description);
    }

    async function handleDelete() {
        setSubmitting(true);
        try {
            await deleteGroup(id);
            toast.success('Group deleted');
            deleteCallback(index);
        } catch (err) {
            showError(err);
        } finally {
            setSubmitting(false);
        }
    }
    return (
        <div className="user-form">
            <label className="form__label">Group name*</label>
            {name.error && <label className="form__error">{name.error}</label>}
            <input
                type="text"
                className="form__input mb-16"
                disabled={!!id}
                value={name.value}
                onChange={(e) => setName({ value: e.target.value, error: '' })}
            />
            <label htmlFor="" className="form__label">
                Description
            </label>
            <ResizableTextarea
                name=""
                maxHeight={300}
                className="w-100"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <AppPermissions
                data={groupData}
                directPermission={directPermission}
                setDirectPermission={setDirectPermission}
                chartPermission={chartPermission}
                setChartPermission={setChartPermission}
            />
            <div className="flex right mt-32">
                {id && (
                    <button
                        className="cta delete"
                        style={{ marginRight: 'auto' }}
                        onClick={(e) => setDeleteConfirmationModal(true)}
                    >
                        Delete
                    </button>
                )}
                <button disabled={submitting} onClick={cancelCallback} type="button" className="cta cancel mr-16">
                    Cancel
                </button>
                <button disabled={submitting} type="button" className="cta" onClick={handleSubmit}>
                    {submitting ? <Progressing /> : 'Save'}
                </button>
            </div>
            {deleteConfirmationModal && (
                <DeleteDialog
                    title={`Delete group '${name.value}'?`}
                    description={'Deleting this group will revoke permissions from users added to this group.'}
                    closeDelete={() => setDeleteConfirmationModal(false)}
                    delete={handleDelete}
                />
            )}
        </div>
    );
}
