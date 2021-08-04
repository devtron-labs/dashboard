import React, {useState, useEffect} from 'react';
import branchIcon from '../../assets/icons/misc/branch.svg';
import webhookIcon from '../../assets/icons/misc/webhook.svg';
import Tippy from '@tippyjs/react';
import { SourceTypeMap } from '../../config';
import { getWebhookEventsForEventId } from '../../services/service';

export function CiPipelineSourceConfig({ sourceType, sourceValue, showTooltip  }) {

    let _isWebhook = sourceType === SourceTypeMap.WEBHOOK;

    const [sourceValueBase, setSourceValueBase] = useState(_isWebhook ? "" : sourceValue);
    const [sourceValueAdv, setSourceValueAdv] = useState(_isWebhook ? "" : sourceValue);
    const [loading, setLoading] = useState(_isWebhook ? true: false);

    // for non webhook case, data is already set in use state initialisation
    function _init(){

        if(!_isWebhook) {
            return;
        }
        let _sourceValueObj = JSON.parse(sourceValue);
        let _eventId = _sourceValueObj.eventId;
        let _condition = _sourceValueObj.condition;

        getWebhookEventsForEventId(_eventId).then((_res) => {
            let _webhookEvent = _res.result;
            setSourceValueBase(_webhookEvent.name);
            setSourceValueAdv(_buildHoverHtmlForWebhook(_webhookEvent.name, _condition, _webhookEvent.selectors));
            setLoading(false);
        });

    }

    function _buildHoverHtmlForWebhook(eventName, condition, selectors){
        let _conditions = [];
        Object.keys(condition).forEach((_selectorId) => {
            let _selector = selectors.find(i => i.id == _selectorId);
            _conditions.push({"name" : _selector ? _selector.name : "", "value" : condition[_selectorId]});
        })

        return <>
                    <span> {eventName} Filters </span>
                    <br/>
                    <ul>
                        {_conditions.map((_condition, index) => (
                            <li key={index}>{_condition.name} : {_condition.value}</li>
                        ))}
                    </ul>
              </>
    }

    useEffect(() => {
        _init();
    }, []);


    return (
        <div className={showTooltip ? "branch-name" : ""}>
            {loading &&
                <span className="loading-dots">loading</span>
            }
            {!loading &&
                <>
                    <img src={_isWebhook ? webhookIcon : branchIcon} alt="branch" className="icon-dim-12 mr-5" />
                    { showTooltip &&
                        <Tippy className="default-tt" arrow={true} placement="bottom" content={sourceValueAdv}>
                            <span className="ellipsis-right" >{sourceValueBase}</span>
                        </Tippy>
                    }
                    { !showTooltip &&
                    <>
                        <span className="ellipsis-right">{sourceValueAdv}</span>
                    </>

                    }

                </>
            }
        </div>
    )
}