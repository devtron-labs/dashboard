# DASHBOARD CONFIG PARAMETER

| Key                                          | Value      | Description                                                                                                      |
| -------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| ANNOUNCEMENT_BANNER_MSG                      | ""         | Show Announcement banner message                                                                                 |
| API_BATCH_SIZE                               | 20         | API batch size                                                                                                   |
| APPLICATION_METRICS_ENABLED                  | "true"     | Show application metrics button                                                                                  |
| CENTRAL_API_ENDPOINT                         | ""         | Central end point                                                                                                |
| CLAIR_TOOL_VERSION                           | ""         | Clair version                                                                                                    |
| CLUSTER_TERMINAL_CONNECTION_RETRY_COUNT      | 7          | Retry Count for connection with cluster terminal.                                                                |
| CLUSTER_TERMINAL_CONNECTION_POLLING_INTERVAL | 7000       | Interval for checking connection with cluster terminal.                                                          |
| CONFIGURABLE_TIMEOUT                         | 10         | Authorizatipn api timeout                                                                                        |
| DEFAULT_CI_TRIGGER_TYPE_MANUAL               | "false"    | Change default trigger behaviour of newly created ci-pipeline to manual                                          |
| DEVTRON_APP_DETAILS_POLLING_INTERVAL         | 3000       | API Polling interval                                                                                             |
| EA_APP_DETAILS_POLLING_INTERVAL              | 3000       | API Polling for EA mode interval                                                                                 |
| ENABLE_BUILD_CONTEXT                         | "true"     | Enable build context in Devtron UI                                                                               |
| ENABLE_CI_JOB                                | "true"     | Enable CI Job                                                                                                    |
| ENABLE_CHART_SEARCH_IN_HELM_DEPLOY           | "true"     | Enable chart search in Helm deploy                                                                               |
| ENABLE_EXTERNAL_ARGO_CD                      | "true"     | Enable External Argo CD                                                                                          |
| ENABLE_SCOPED_VARIABLES                      | "false"    | For enabling scoped variable from UI, also need to enable it in backend.                                         |
| ENABLE_RESTART_WORKLOAD                      | "false"    | Show restart pods option in app details page                                                                     |
| FORCE_SECURITY_SCANNING                      | "false"    | Force security scanning                                                                                          |
| GA_ENABLED                                   | "true"     | Enable Google Analytics (GA)                                                                                     |
| GA_TRACKING_ID                               | G-XXXXXXXX | Google Analytics tracking ID                                                                                     |
| GLOBAL_API_TIMEOUT                           | 60000      | Default timeout for all API requests in DASHBOARD                                                                |
| GTM_ENABLED                                  | "true"     | Enable GTM for tag manager                                                                                       |
| GTM_ID                                       | ""         | Enable GTM_ID for tag manager args                                                                               |
| HELM_APP_DETAILS_POLLING_INTERVAL            | 3000       | API polling interval for helm app details                                                                        |
| HIDE_DISCORD                                 | "true"     | Hide Discord button from UI                                                                                      |
| HIDE_DEFAULT_CLUSTER                         | "true"     | Hide default cluster                                                                                             |
| HIDE_EXCLUDE_INCLUDE_GIT_COMMITS             | "true"     | Hide exclude include git commits                                                                                 |
| HIDE_GITOPS_OR_HELM_OPTION                   | "false"    | Enable GitOps and Helm option                                                                                    |
| ORGANIZATION_NAME                            | ""         | Name of the organization                                                                                         |
| POSTHOG_ENABLED                              | "true"     | PostHog integration status                                                                                       |
| POSTHOG_TOKEN                                | XXXXXXXX   | PostHog API token                                                                                                |
| RECOMMEND_SECURITY_SCANNING                  | "false"    | Recommend security scanning                                                                                      |
| SENTRY_ENV                                   | stage      | Sentry environment                                                                                               |
| SENTRY_ERROR_ENABLED                         | false      | To send uncaught errors to sentry                                                                                |
| SENTRY_PERFORMANCE_ENABLED                   | false      | To send persormance sentry                                                                                       |
| SENTRY_DSN                                   | ''         | SENTRY Data Source Name                                                                                          |
| SENTRY_AUTH_TOKEN | "" | Auth token for uploading the source maps to sentry |
| SENTRY_TRACES_SAMPLE_RATE                    | 0.2        | Rate at which data send to sentry.(min=0 max=1)                                                                  |
| SIDEBAR_DT_LOGO                              | ""         | Devtron logo for sidebar (would work if ORGANIZATION_NAME is not given)                                          |
| SERVICE_WORKER_TIMEOUT                       | "1"        | Timeout value (in minutes) to fetch update for dashboard, change it cautiously as might hamper your update cycle |
| TRIGGER_API_TIMEOUT                          | 60000      | Default timeout for all API requests for Trigger calls (Deploy artifacts, charts) in DASHBOARD                   |
| FEATURE_HIDE_USER_DIRECT_PERMISSIONS_FOR_NON_SUPER_ADMINS | "true" | Would hide the user direct permissions for non-super admin users in User Permissions |
| FEATURE_ACTION_AUDIOS_ENABLE                 | true         | Would enable audios in dashboard   |

# DASHBOARD CONFIG SECRET
