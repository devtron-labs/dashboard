import { useEffect } from 'react';

function useResourceValidationSchema(yaml: any, validatorSchema) {
    useEffect(() => {
        if (!validatorSchema) return;
        yaml &&
            yaml.yamlDefaults.setDiagnosticsOptions({
                validate: true,
                enableSchemaRequest: true,
                hover: true,
                completion: true,
                isKubernetes: true,
                format: true,
                schemas: [validatorSchema],
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validatorSchema]);
}

export default useResourceValidationSchema;
