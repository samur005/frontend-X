import { createQueryKeys } from '@lukemorales/query-key-factory';
import { sToMs } from '@shared/utils/time-utils';

import {
    CheckQwdttHashesCommand,
    GetQwdttCommand,
    GetQwdttNodeStatusCommand,
    GetQwdttUsersCommand,
} from '../../qwdtt-contract';
import { createGetQueryHook, errorHandler } from '../../tsq-helpers';

export const qwdttQueryKeys = createQueryKeys('qwdtt', {
    getQwdtt: {
        queryKey: null,
    },
    getUsers: {
        queryKey: null,
    },
    checkHashes: {
        queryKey: null,
    },
    nodeStatus: {
        queryKey: null,
    },
});

export const useGetQwdtt = createGetQueryHook({
    endpoint: GetQwdttCommand.TSQ_url,
    responseSchema: GetQwdttCommand.ResponseSchema,
    getQueryKey: () => qwdttQueryKeys.getQwdtt.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(5),
    },
    errorHandler: (error) => errorHandler(error, 'Get qWDTT'),
});

export const useGetQwdttUsers = createGetQueryHook({
    endpoint: GetQwdttUsersCommand.TSQ_url,
    responseSchema: GetQwdttUsersCommand.ResponseSchema,
    getQueryKey: () => qwdttQueryKeys.getUsers.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(5),
    },
    errorHandler: (error) => errorHandler(error, 'Get qWDTT users'),
});

export const useCheckQwdttHashes = createGetQueryHook({
    endpoint: CheckQwdttHashesCommand.TSQ_url,
    responseSchema: CheckQwdttHashesCommand.ResponseSchema,
    getQueryKey: () => qwdttQueryKeys.checkHashes.queryKey,
    rQueryParams: {
        refetchOnMount: false,
        staleTime: sToMs(15),
        enabled: false,
    },
    errorHandler: (error) => errorHandler(error, 'Check qWDTT hashes'),
});

export const useGetQwdttNodeStatus = createGetQueryHook({
    endpoint: GetQwdttNodeStatusCommand.TSQ_url,
    responseSchema: GetQwdttNodeStatusCommand.ResponseSchema,
    getQueryKey: () => qwdttQueryKeys.nodeStatus.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(5),
    },
    errorHandler: (error) => errorHandler(error, 'Get qWDTT node status'),
});
