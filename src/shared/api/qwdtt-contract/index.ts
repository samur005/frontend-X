import { z } from 'zod';

const ROOT = '/api';

export const QwdttSettingsSchema = z.object({
    enabled: z.boolean(),
    remark: z.string(),
    listenAddr: z.string(),
    wgPort: z.number().int(),
    dns: z.string(),
    listenRaw: z.string(),
    listenDirect: z.string(),
    subHost: z.string(),
    vkHashes: z.string(),
    clientPort: z.number().int(),
    workers: z.number().int(),
    autoVkHash: z.boolean(),
    nodeUuids: z.array(z.uuid()),
    remoteWdttUrl: z.string(),
    hasRemoteWdttAuth: z.boolean(),
    vkCookies: z.string(),
});

export const QwdttStatusSchema = z.object({
    hashEnv: z.boolean(),
    hasCookies: z.boolean(),
    hashSource: z.enum(['env', 'panel', 'manual', '']),
    resolvedHost: z.string(),
    hashes: z.array(z.string()),
    egress: z.literal('sidecar-nat'),
});

export const QwdttViewSchema = z.object({
    config: QwdttSettingsSchema,
    status: QwdttStatusSchema,
    linkPreview: z.string(),
});

export const QwdttHashStatusSchema = z.object({
    hash: z.string(),
    alive: z.nullable(z.boolean()),
    generated: z.boolean(),
    error: z.string().optional(),
});

export const QwdttUserAccessSchema = z.object({
    userId: z.number().int(),
    username: z.string(),
    shortUuid: z.string(),
    enabled: z.boolean(),
    status: z.string(),
    link: z.string(),
    reportedUpBytes: z.number().int(),
    reportedDownBytes: z.number().int(),
});

export const QwdttNodeStatusSchema = z.object({
    nodeUuid: z.uuid(),
    nodeName: z.string(),
    supported: z.boolean().optional(),
    enabled: z.boolean().optional(),
    running: z.boolean().optional(),
    pid: z.number().int().optional(),
    uptime: z.number().int().optional(),
    binaryFound: z.boolean().optional(),
    egress: z.string().optional(),
    error: z.string().optional(),
    unreachable: z.boolean().optional(),
});

export namespace GetQwdttCommand {
    export const url = `${ROOT}/qwdtt/`;
    export const TSQ_url = url;
    export const ResponseSchema = z.object({ response: QwdttViewSchema });
    export type Response = z.infer<typeof ResponseSchema>;
}

export namespace UpdateQwdttCommand {
    export const url = `${ROOT}/qwdtt/`;
    export const TSQ_url = url;
    export const endpointDetails = { REQUEST_METHOD: 'patch' as const };
    export const RequestBodySchema = z.object({
        enabled: z.boolean().optional(),
        remark: z.string().optional(),
        listenAddr: z.string().optional(),
        wgPort: z.number().int().optional(),
        dns: z.string().optional(),
        listenRaw: z.string().optional(),
        listenDirect: z.string().optional(),
        subHost: z.string().optional(),
        vkHashes: z.string().optional(),
        clientPort: z.number().int().optional(),
        workers: z.number().int().optional(),
        autoVkHash: z.boolean().optional(),
        nodeUuids: z.array(z.uuid()).optional(),
        remoteWdttUrl: z.string().optional(),
        remoteWdttCookie: z.string().optional(),
        remoteWdttCsrfToken: z.string().optional(),
        syncNodes: z.boolean().optional(),
    });
    export const ResponseSchema = z.object({ response: QwdttViewSchema });
}

export namespace SaveQwdttCookiesCommand {
    export const url = `${ROOT}/qwdtt/cookies`;
    export const TSQ_url = url;
    export const endpointDetails = { REQUEST_METHOD: 'put' as const };
    export const RequestBodySchema = z.object({ cookies: z.string().min(1) });
    export const ResponseSchema = z.object({ response: QwdttViewSchema });
}

export namespace ClearQwdttCookiesCommand {
    export const url = `${ROOT}/qwdtt/cookies`;
    export const TSQ_url = url;
    export const endpointDetails = { REQUEST_METHOD: 'delete' as const };
    export const RequestBodySchema = z.object({}).optional();
    export const ResponseSchema = z.object({ response: QwdttViewSchema });
}

export namespace CheckQwdttCookiesCommand {
    export const url = `${ROOT}/qwdtt/cookies/check`;
    export const TSQ_url = url;
    export const endpointDetails = { REQUEST_METHOD: 'post' as const };
    export const RequestBodySchema = z.object({}).optional();
    export const ResponseSchema = z.object({
        response: z.object({ ok: z.boolean(), error: z.string().optional() }),
    });
}

export namespace GenerateQwdttHashCommand {
    export const url = `${ROOT}/qwdtt/hashes/generate`;
    export const TSQ_url = url;
    export const endpointDetails = { REQUEST_METHOD: 'post' as const };
    export const RequestBodySchema = z.object({ replaceOldest: z.boolean().optional() });
    export const ResponseSchema = z.object({
        response: QwdttViewSchema.extend({ generatedHash: z.string() }),
    });
}

export namespace CheckQwdttHashesCommand {
    export const url = `${ROOT}/qwdtt/hashes/check`;
    export const TSQ_url = url;
    export const ResponseSchema = z.object({ response: z.array(QwdttHashStatusSchema) });
}

export namespace GetQwdttUsersCommand {
    export const url = `${ROOT}/qwdtt/users`;
    export const TSQ_url = url;
    export const ResponseSchema = z.object({ response: z.array(QwdttUserAccessSchema) });
}

export namespace UpsertQwdttUserCommand {
    export const url = `${ROOT}/qwdtt/users`;
    export const TSQ_url = url;
    export const endpointDetails = { REQUEST_METHOD: 'put' as const };
    export const RequestBodySchema = z.object({
        userId: z.number().int().optional(),
        username: z.string().optional(),
        enabled: z.boolean().optional(),
        rotatePassword: z.boolean().optional(),
    });
    export const ResponseSchema = z.object({ response: QwdttUserAccessSchema });
}

export namespace DeleteQwdttUserCommand {
    export const url = `${ROOT}/qwdtt/users`;
    export const TSQ_url = `${ROOT}/qwdtt/users/:userId`;
    export const endpointDetails = { REQUEST_METHOD: 'delete' as const };
    export const RequestParamSchema = z.object({ userId: z.string() });
    export const ResponseSchema = z.object({ response: z.object({ ok: z.boolean() }) });
}

export namespace RestartQwdttCommand {
    export const url = `${ROOT}/qwdtt/restart`;
    export const TSQ_url = url;
    export const endpointDetails = { REQUEST_METHOD: 'post' as const };
    export const RequestBodySchema = z.object({}).optional();
    export const ResponseSchema = z.object({
        response: QwdttViewSchema.extend({ nodes: z.array(QwdttNodeStatusSchema) }),
    });
}

export namespace GetQwdttNodeStatusCommand {
    export const url = `${ROOT}/qwdtt/nodes/status`;
    export const TSQ_url = url;
    export const ResponseSchema = z.object({ response: z.array(QwdttNodeStatusSchema) });
}
