## Routes

-   security
    -   /security/scans
    -   /security/policies
        -   /security/policies/global
        -   /security/policies/clusters
            -   /security/policies/clusters/`${clusterId}`
        -   /security/policies/environments
            -   /security/policies/environments/`${envId}`
        -   /security/policies/apps
        -   /security/policies/apps/`${appId}`
        -   /security/policies/vulnerability
            -   /security/policies/vulnerability?cveName=`${cve-2019-2134}`&offset=`${offset}`&size=`${pageSize}`

## Components

![imagev](https://s3-ap-southeast-1.amazonaws.com/devtron.ai/documentation/security-components.jpg)

##### Security

`Root Component of Security. 
 Renders page header and routes`

##### AddCveModal

`Modal, adds new CVE Policy`

| Props   | Description                   |
| ------- | ----------------------------- |
| close   | Function to close the Modal   |
| saveCVE | Save CVE Callback from parent |

##### DeleteCVEModal

`Modal, deletes CVE Policy`

##### SecurityPoliciesTab

`Renders secondary Navigation, and policy form or list`

##### SecurityPolicyApp

`List of Applications`

##### SecurityPolicyCluster

`List of Clusters`

##### SecurityPolicyEdit

`Creates new policy against a CVE or Severity`

| Props | Value                                            | Description                     |
| ----- | ------------------------------------------------ | ------------------------------- |
| id    | number                                           | clusterId, environmentId, appId |
| level | 'global', 'cluster', environment' ,'application' | Level of the policies           |

##### SecurityPolicyEnvironment

`List of Environment`

##### SecurityPolicyGlobal

`Renders global level policy`

##### SecurityScansTab

`List of scanned images currently deployed.`

##### UpdateSeverityModal

`Update a policy against a severity.`

##### VulnerabilityExposure

`To know CVE policy on an app, chart or application object. `
