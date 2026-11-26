import { notifications } from '@mantine/notifications';

import {
    CheckQwdttCookiesCommand,
    ClearQwdttCookiesCommand,
    DeleteQwdttUserCommand,
    GenerateQwdttHashCommand,
    RestartQwdttCommand,
    SaveQwdttCookiesCommand,
    UpdateQwdttCommand,
    UpsertQwdttUserCommand,
} from '../../qwdtt-contract';
import { createMutationHook } from '../../tsq-helpers';

export const useUpdateQwdtt = createMutationHook({
    endpoint: UpdateQwdttCommand.TSQ_url,
    bodySchema: UpdateQwdttCommand.RequestBodySchema,
    responseSchema: UpdateQwdttCommand.ResponseSchema,
    requestMethod: UpdateQwdttCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'qWDTT settings saved',
                color: 'teal',
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Update qWDTT',
                message: error instanceof Error ? error.message : 'Request failed',
                color: 'red',
            });
        },
    },
});

export const useSaveQwdttCookies = createMutationHook({
    endpoint: SaveQwdttCookiesCommand.TSQ_url,
    bodySchema: SaveQwdttCookiesCommand.RequestBodySchema,
    responseSchema: SaveQwdttCookiesCommand.ResponseSchema,
    requestMethod: SaveQwdttCookiesCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'VK cookies saved (values stay on the backend)',
                color: 'teal',
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Save VK cookies',
                message: error instanceof Error ? error.message : 'Request failed',
                color: 'red',
            });
        },
    },
});

export const useClearQwdttCookies = createMutationHook({
    endpoint: ClearQwdttCookiesCommand.TSQ_url,
    requestMethod: ClearQwdttCookiesCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'VK cookies cleared',
                color: 'teal',
            });
        },
    },
});

export const useCheckQwdttCookies = createMutationHook({
    endpoint: CheckQwdttCookiesCommand.TSQ_url,
    responseSchema: CheckQwdttCookiesCommand.ResponseSchema,
    requestMethod: CheckQwdttCookiesCommand.endpointDetails.REQUEST_METHOD,
});

export const useGenerateQwdttHash = createMutationHook({
    endpoint: GenerateQwdttHashCommand.TSQ_url,
    bodySchema: GenerateQwdttHashCommand.RequestBodySchema,
    responseSchema: GenerateQwdttHashCommand.ResponseSchema,
    requestMethod: GenerateQwdttHashCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'VK hash generated',
                color: 'teal',
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Generate VK hash',
                message: error instanceof Error ? error.message : 'Request failed',
                color: 'red',
            });
        },
    },
});

export const useUpsertQwdttUser = createMutationHook({
    endpoint: UpsertQwdttUserCommand.TSQ_url,
    bodySchema: UpsertQwdttUserCommand.RequestBodySchema,
    responseSchema: UpsertQwdttUserCommand.ResponseSchema,
    requestMethod: UpsertQwdttUserCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'User qWDTT access updated',
                color: 'teal',
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Update qWDTT user',
                message: error instanceof Error ? error.message : 'Request failed',
                color: 'red',
            });
        },
    },
});

export const useDeleteQwdttUser = createMutationHook({
    endpoint: DeleteQwdttUserCommand.TSQ_url,
    routeParamsSchema: DeleteQwdttUserCommand.RequestParamSchema,
    requestMethod: DeleteQwdttUserCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'qWDTT access revoked',
                color: 'teal',
            });
        },
    },
});

export const useRestartQwdtt = createMutationHook({
    endpoint: RestartQwdttCommand.TSQ_url,
    responseSchema: RestartQwdttCommand.ResponseSchema,
    requestMethod: RestartQwdttCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'qWDTT sidecars reconciled',
                color: 'teal',
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Reconcile qWDTT',
                message: error instanceof Error ? error.message : 'Request failed',
                color: 'red',
            });
        },
    },
});
