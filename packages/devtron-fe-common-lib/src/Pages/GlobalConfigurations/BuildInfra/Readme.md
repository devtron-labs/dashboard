In case someone wants to add a new build infrastructure field, the following steps should be followed:

-   Update the BUILD_INFRA_FORM_FIELDS, in constants.tsx
-   Add BuildInfraConfigTypes, BuildInfraLocators, BuildInfraInheritActions(If any) in types.tsx
-   In utils.tsx, update the handleProfileInputChange and validation functions accordingly
