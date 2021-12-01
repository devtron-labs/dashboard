import React from 'react';
import { Drawer, VisibleModal } from '../../../../common';
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';
import { ReactComponent as Warning } from '../../../assets/icons/ic-errorInfo.svg';

function ConfigStatusModalComponent({ close, status }) {
    return (
        <div>
              <Drawer position="right" width="50%" onClose={close} >
                <div className="app-status-detail-modal bcn-0 pt-12">

                    <div className="app-status-detail__header box-shadow pb-12">
                        <div className="title flex content-space cn-9 fs-16 fw-6 pl-20 pr-20 ">
                            Config apply: mrinalinin-test  default_cluster/devtroncd
                     <span className="cursor" onClick={close} ><Close className="icon-dim-24" /></span>
                        </div>
                        <div className="flex left">
                            <div className={`subtitle app-summary__status-name pl-20 fw-6 f-${status.toLowerCase()} mr-16`}>{status.toUpperCase()}</div>
                            {/* {message && <div>{message}</div>} */}
                        </div>
                    </div>
                    <div className="m-20">
                        <div className="flex left pt-13 pb-13">
                            <span className="mr-16">
                                <Warning className="icon-dim-20"/>
                            </span>
                            <div>
                                <div className="cr-5 fs-15 fw-6">Error: Apply configuration</div>
                                <div>Error in applying configuration to kubernetes</div>
                            </div>
                        </div>
                        <div className="config-error-wrap bcr-1 br-4 p-12 ml-36">
                            <div className="pb-4 cn-8 fw-6">Error Message:</div>
                            <div className="">
                            "level":"error","ts":1617123900.6951797,"caller":"sql/connection.go:40","msg":"error in connecting db ","db":"Addr":"postgresql-postgresql.devtroncd","Port":"5432","User":"postgres","Password”:”**********”,”Database":"orchestrator","ApplicationName":"chart-sync","LogQuery":true,"err":"dial tcp: i/o timeout","stacktrace":"github.com/devtron-labs/chart-sync/internal/sql.NewDbConnection\n\t/go/src/github.com/devtron-labs/chart-sync/internal/sql/connection.go:40\nmain.InitializeApp\n\t/go/src/github.com/devtron-labs/chart-sync/wire_gen.go:22\nmain.main\n\t/go/src/github.com/devtron-labs/chart-sync/main.go:8\nruntime.main\n\t/usr/local/go/src/runtime/proc.go:225"
                            </div>

                        </div>

                    </div>

                    <div className="app-status-detail__header ">
                    </div>
                </div>
            </Drawer>
        </div>
    )
}

export default ConfigStatusModalComponent
