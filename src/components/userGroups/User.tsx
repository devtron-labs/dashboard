import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from 'react';
import {
    showError,
    Progressing,
    mapByKey,
    removeItemsFromArray,
    validateEmail,
    Option,
    ClearIndicator,
    MultiValueRemove,
    multiSelectStyles,
    DeleteDialog,
    MultiValueChipContainer,
} from '../common';
import { saveUser, deleteUser } from './userGroup.service';
import Creatable from 'react-select/creatable';
import Select from 'react-select';
import {
    DirectPermissionsRoleFilter,
    ChartGroupPermissionsFilter,
    EntityTypes,
    ActionTypes,
    CreateUser,
    OptionType,
} from './userGroups.types';
import { toast } from 'react-toastify';
import { useUserGroupContext, GroupRow } from './UserGroup';
import './UserGroup.scss';
import AppPermissions from './AppPermissions';
import { ACCESS_TYPE_MAP, SERVER_MODE } from '../../config';
import { mainContext } from '../common/navigation/NavigationRoutes';
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ServerError } from '../../modals/commonTypes';

const CreatableChipStyle = {
    multiValue: (base, state) => {
        return {
            ...base,
            border: validateEmail(state.data.value) ? `1px solid var(--N200)` : `1px solid var(--R500)`,
            borderRadius: `4px`,
            background: validateEmail(state.data.value) ? 'white' : 'var(--R100)',
            height: '28px',
            margin: '8px 8px 4px 0px',
            paddingLeft: '4px',
            fontSize: '12px',
        };
    },
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf', // default border color
        boxShadow: 'none', // no box-shadow
    }),
    indicatorsContainer: () => ({
        height: '38px',
    }),
};

export default function UserForm({
    id = null,
    userData = null,
    index,
    updateCallback,
    deleteCallback,
    createCallback,
    cancelCallback,
}) {
    // id null is for create
    const { serverMode } = useContext(mainContext);
    const { userGroupsList, superAdmin } = useUserGroupContext();
    const userGroupsMap = mapByKey(userGroupsList, 'name');
    const [localSuperAdmin, setSuperAdmin] = useState<boolean>(false);
    const [emailState, setEmailState] = useState<{ emails: OptionType[]; inputEmailValue: string; emailError: string }>(
        { emails: [], inputEmailValue: '', emailError: '' },
    );
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([]);
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    });
    const [userGroups, setUserGroups] = useState<OptionType[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const creatableRef = useRef(null);
    const groupPermissionsRef = useRef(null);

    useEffect(() => {
        if (creatableRef.current) {
            creatableRef.current.focus();
        } else if (groupPermissionsRef.current) {
            groupPermissionsRef.current.focus();
        }
    }, []);

    function validateForm(): boolean {
        if (emailState.emails.length === 0) {
            setEmailState((emailState) => ({ ...emailState, emailError: 'Emails are mandatory.' }));
            toast.error('Some required fields are missing')
            return false;
        }

        if (
            emailState.emails.length !==
            emailState.emails.map((email) => email.value).filter((email) => validateEmail(email)).length
        ) {
            setEmailState((emailState) => ({
                ...emailState,
                emailError: 'One or more emails could not be verified to be correct.',
            }));
            return false;
        }
        return true;
    }

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
        const validForm = validateForm();
        if (!validForm) {
            return;
        }
        if (!isFormComplete()) {
            return;
        }
        setSubmitting(true);
        const payload: CreateUser = {
            id: id || 0,
            email_id: emailState.emails.map((email) => email.value).join(','),
            groups: userGroups.map((group) => group.value),
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
            superAdmin: localSuperAdmin,
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
            const { result } = await saveUser(payload);
            if (id) {
                updateCallback(index, result);
                toast.success('User updated');
            } else {
                createCallback(result);
                toast.success('User created');
            }
        } catch (err) {

            var err_obj = new ServerError(err)

            if (err_obj.code == 400 ){
                toast.error(err_obj.userMessage)
            }
            else if (err_obj.code == 417){
                toast.warn(err_obj.userMessage)
            }
            else{
                showError(err);
            }
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        userData && populateDataFromAPI(userData);
    }, [userData]);

    async function populateDataFromAPI(data: CreateUser) {
        const { email_id, groups = [], superAdmin } = data;
        setUserGroups(groups?.map((group) => ({ label: group, value: group })) || []);
        setEmailState({ emails: [{ label: email_id, value: email_id }], inputEmailValue: '', emailError: '' });
        if (superAdmin) {
            setSuperAdmin(superAdmin);
        }
    }

    function handleInputChange(inputEmailValue) {
        setEmailState((emailState) => ({ ...emailState, inputEmailValue, emailError: '' }));
    }

    function handleEmailChange(newValue: any, actionMeta: any) {
        setEmailState((emailState) => ({ ...emailState, emails: newValue || [], emailError: '' }));
    }

    const createOption = (label: string) => ({
        label,
        value: label,
    });

    const handleKeyDown = useCallback(
        (event) => {
            let { emails, inputEmailValue } = emailState;
            inputEmailValue = inputEmailValue.trim();
            switch (event.key) {
                case 'Enter':
                case 'Tab':
                case ',':
                case ' ': // space
                    if (inputEmailValue) {
                        let newEmails = inputEmailValue.split(',').map((e) => {
                            e = e.trim();
                            return createOption(e);
                        });
                        setEmailState({
                            inputEmailValue: '',
                            emails: [...emails, ...newEmails],
                            emailError: '',
                        });
                    }
                    if (event.key !== 'Tab') {
                        event.preventDefault();
                    }
                    break;
            }
        },
        [emailState],
    );

    async function handleDelete() {
        setSubmitting(true);
        try {
            await deleteUser(id);
            deleteCallback(index);
            toast.success('User deleted');
        } catch (err) {
            showError(err);
        } finally {
            setSubmitting(false);
        }
    }

    function formatChartGroupOptionLabel({ value, label }) {
        return (
            <div className="flex left column">
                <span>{label}</span>
                <small>{userGroupsMap.has(value) ? userGroupsMap.get(value).description : ''}</small>
            </div>
        );
    }

    function handleCreatableBlur(e) {
        let { emails, inputEmailValue } = emailState;
        inputEmailValue = inputEmailValue.trim();
        if (!inputEmailValue) return;
        setEmailState({
            inputEmailValue: '',
            emails: [...emails, createOption(e.target.value)],
            emailError: '',
        });
    }

    const CreatableComponents = useMemo(
        () => ({
            DropdownIndicator: () => null,
            ClearIndicator,
            MultiValueRemove,
            MultiValueContainer: ({ ...props }) => <MultiValueChipContainer {...props} validator={validateEmail} />,
            IndicatorSeparator: () => null,
            Menu: () => null,
        }),
        [],
    );

    const creatableOptions = useMemo(() => [], []);

    const availableGroups = userGroupsList?.map((group) => ({ value: group.name, label: group.name }));

    return (
        <div className="user-form">
            {!id && (
                <div className="mb-24">
                    <label htmlFor="" className="mb-8">
                        Email addresses*
                    </label>
                    <Creatable
                        ref={creatableRef}
                        options={creatableOptions}
                        components={CreatableComponents}
                        styles={CreatableChipStyle}
                        autoFocus
                        isMulti
                        isClearable
                        inputValue={emailState.inputEmailValue}
                        placeholder="Type email and press enter..."
                        isValidNewOption={() => false}
                        backspaceRemovesValue
                        value={emailState.emails}
                        onBlur={handleCreatableBlur}
                        onInputChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onChange={handleEmailChange}
                    />
                    {emailState.emailError && (
                        <label className="form__error">
                            <Error className="form__icon form__icon--error" />
                            {emailState.emailError}
                        </label>
                    )}
                </div>
            )}
            {superAdmin && <SuperAdmin superAdmin={localSuperAdmin} setSuperAdmin={setSuperAdmin} />}
            {!localSuperAdmin && (
                <>
                    <div className="cn-9 fs-14 fw-6 mb-16">Group permissions</div>
                    <Select
                        value={userGroups}
                        ref={groupPermissionsRef}
                        components={{
                            MultiValueContainer: ({ ...props }) => (
                                <MultiValueChipContainer {...props} validator={null} />
                            ),
                            DropdownIndicator: null,
                            ClearIndicator,
                            MultiValueRemove,
                            Option,
                        }}
                        styles={{
                            ...multiSelectStyles,
                            multiValue: (base) => ({
                                ...base,
                                border: `1px solid var(--N200)`,
                                borderRadius: `4px`,
                                background: 'white',
                                height: '30px',
                                margin: '0 8px 0 0',
                                padding: '1px',
                            }),
                        }}
                        formatOptionLabel={formatChartGroupOptionLabel}
                        closeMenuOnSelect={false}
                        isMulti
                        autoFocus={!id}
                        name="groups"
                        options={availableGroups}
                        hideSelectedOptions={false}
                        onChange={(selected, actionMeta) => setUserGroups((selected || []) as any)}
                        className={`basic-multi-select ${id ? 'mt-8 mb-16' : ''}`}
                    />
                    {userGroups.length > 0 && id && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '184px 1fr 24px',
                                gridAutoRows: '48px',
                                gridColumnGap: '16px',
                                alignItems: 'center',
                            }}
                        >
                            {userGroups.map((userGroup, idx) => (
                                <GroupRow
                                    key={idx}
                                    name={userGroup.value}
                                    description={userGroupsMap.get(userGroup.value)?.description || ''}
                                    removeRow={(e) =>
                                        setUserGroups((userGroups) => removeItemsFromArray(userGroups, idx, 1))
                                    }
                                />
                            ))}
                        </div>
                    )}
                    <AppPermissions
                        data={userData}
                        directPermission={directPermission}
                        setDirectPermission={setDirectPermission}
                        chartPermission={chartPermission}
                        setChartPermission={setChartPermission}
                    />
                </>
            )}
            <div className="flex right mt-32">
                {id && (
                    <button
                        className="cta delete"
                        onClick={(e) => setDeleteConfirmationModal(true)}
                        style={{ marginRight: 'auto' }}
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
                    title={`Delete user '${emailState.emails[0]?.value || ''}'?`}
                    description={'Deleting this user will remove the user and revoke all their permissions.'}
                    delete={handleDelete}
                    closeDelete={() => setDeleteConfirmationModal(false)}
                />
            )}
        </div>
    );
}

const SuperAdmin: React.FC<{
    superAdmin: boolean;
    setSuperAdmin: (checked: boolean) => any;
}> = ({ superAdmin, setSuperAdmin }) => {
    return (
        <div className="flex left column top bcn-1 br-4 p-16 mb-24">
            <div className="flex left">
                <input
                    type="checkbox"
                    checked={!!superAdmin}
                    onChange={(e) => setSuperAdmin(e.target.checked)}
                    style={{ height: '13px', width: '13px' }}
                />
                <span className="fs-14 fw-6 cn-9 ml-16">Assign superadmin permissions</span>
            </div>
            <p className="fs-12 cn-7 mt-4">
                Superadmins have complete access to all applications across projects. Only superadmins can add more
                superadmins.
            </p>
        </div>
    );
};
