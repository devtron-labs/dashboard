# Main Components #
* ConfigmapForm
* Configmap

## ConfigmapForm ##
* main component responsible for save and update configmap

## Save or Update Configmap Payload ##
```
{
    id: number;
    appId: number;
    configData: {
        name: string;
        type: "environment" | "volume";
        mountPath?: string;
        external: boolean;
        data?: Map<string, string>; 
   }
}
```

* mountPath = "" if type = "environment"


## Misc ##
* used `KeyValueInput` form data
 