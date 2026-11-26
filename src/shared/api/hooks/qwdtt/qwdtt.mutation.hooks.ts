import { notifications } from '@mantine/notifications';
import { t } from 'i18next';

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
                title: t('qwdtt.page.component.toast-success'),
                message: t('qwdtt.page.component.toast-settings-saved'),
                color: 'teal',
            });
        },
        onError: (error) => {
            notifications.show({
                title: t('qwdtt.page.component.toast-update-title'),
                message: error instanceof Error ? error.message : t('qwdtt.page.component.toast-request-failed'),
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
                title: t('qwdtt.page.component.toast-success'),
                message: t('qwdtt.page.component.toast-cookies-saved'),
                color: 'teal',
            });
        },
        onError: (error) => {
            notifications.show({
                title: t('qwdtt.page.component.toast-save-cookies-title'),
                message: error instanceof Error ? error.message : t('qwdtt.page.component.toast-request-failed'),
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
                title: t('qwdtt.page.component.toast-success'),
                message: t('qwdtt.page.component.toast-cookies-cleared'),
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
                title: t('qwdtt.page.component.toast-success'),
                message: t('qwdtt.page.component.toast-hash-generated'),
                color: 'teal',
            });
        },
        onError: (error) => {
            notifications.show({
                title: t('qwdtt.page.component.toast-generate-hash-title'),
                message: error instanceof Error ? error.message : t('qwdtt.page.component.toast-request-failed'),
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
                title: t('qwdtt.page.component.toast-success'),
                message: t('qwdtt.page.component.toast-user-updated'),
                color: 'teal',
            });
        },
        onError: (error) => {
            notifications.show({
                title: t('qwdtt.page.component.toast-update-user-title'),
                message: error instanceof Error ? error.message : t('qwdtt.page.component.toast-request-failed'),
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
                title: t('qwdtt.page.component.toast-success'),
                message: t('qwdtt.page.component.toast-access-revoked'),
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
                title: t('qwdtt.page.component.toast-success'),
                message: t('qwdtt.page.component.toast-sidecars-reconciled'),
                color: 'teal',
            });
        },
        onError: (error) => {
            notifications.show({
                title: t('qwdtt.page.component.toast-reconcile-title'),
                message: error instanceof Error ? error.message : t('qwdtt.page.component.toast-request-failed'),
                color: 'red',
            });
        },
    },
});
