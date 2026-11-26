import {
    CloneHostCommand as OfficialCloneHostCommand,
    CreateHostCommand as OfficialCreateHostCommand,
    GetHostCommand as OfficialGetHostCommand,
    GetHostsCommand as OfficialGetHostsCommand,
    UpdateHostCommand as OfficialUpdateHostCommand
} from '@remnawave/backend-contract'
import { z } from 'zod'

/**
 * Remnawave-X: a host can be a qWDTT host. It has no Xray inbound, is bound to
 * exactly one node and becomes a separate qwdtt:// entry in the subscription.
 * The official contract would strip `isQwdtt`, so it is extended here.
 */

export const HostItemSchema = OfficialGetHostCommand.ResponseSchema.shape.response.extend({
    isQwdtt: z.boolean().default(false)
})

const withItem = <S extends z.ZodObject<{ response: z.ZodTypeAny }>>(schema: S) =>
    schema.extend({ response: HostItemSchema })

export const GetHostResponseSchema = withItem(OfficialGetHostCommand.ResponseSchema)
export const CreateHostResponseSchema = withItem(OfficialCreateHostCommand.ResponseSchema)
export const UpdateHostResponseSchema = withItem(OfficialUpdateHostCommand.ResponseSchema)
export const CloneHostResponseSchema = withItem(OfficialCloneHostCommand.ResponseSchema)
export const GetHostsResponseSchema = OfficialGetHostsCommand.ResponseSchema.extend({
    response: z.array(HostItemSchema)
})

export const CreateHostRequestBodySchema = OfficialCreateHostCommand.RequestBodySchema.extend({
    inbound: OfficialCreateHostCommand.RequestBodySchema.shape.inbound.optional(),
    isQwdtt: z.boolean().optional()
}).superRefine((value, ctx) => {
    if (value.isQwdtt) {
        if (!value.nodes || value.nodes.length !== 1) {
            ctx.addIssue({
                code: 'custom',
                message: 'Выберите одну ноду для хоста qWDTT',
                path: ['nodes']
            })
        }
        return
    }
    if (!value.inbound?.configProfileUuid || !value.inbound.configProfileInboundUuid) {
        ctx.addIssue({
            code: 'custom',
            message: 'Config profile inbound is required',
            path: ['inbound']
        })
    }
})

export const UpdateHostRequestBodySchema = OfficialUpdateHostCommand.RequestBodySchema.extend({
    isQwdtt: z.boolean().optional()
})

export type THostItem = z.infer<typeof HostItemSchema>
export type TCreateHostRequestBody = z.infer<typeof CreateHostRequestBodySchema>
export type TUpdateHostRequestBody = z.infer<typeof UpdateHostRequestBodySchema>

export type TQwdttPeerSource = 'host' | 'node' | 'subHost'

const PRIVATE_V4 = [/^10\./, /^127\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./, /^169\.254\./, /^0\./]

export function peerHostname(value: string): string {
    const trimmed = value.trim()
    if (trimmed.startsWith('[')) {
        const end = trimmed.indexOf(']')
        return end > 0 ? trimmed.slice(1, end) : trimmed
    }
    const parts = trimmed.split(':')
    return parts.length === 2 ? parts[0] : trimmed
}

export function isPrivateOrLocalPeerHost(value: string): boolean {
    const host = peerHostname(value).toLowerCase()
    if (!host) return true
    if (host === 'localhost' || host.endsWith('.localhost')) return true
    if (PRIVATE_V4.some((re) => re.test(host))) return true
    if (host === '::1' || host === '::' || /^f[cd][0-9a-f]{2}:/.test(host) || host.startsWith('fe80:'))
        return true
    return false
}

function dtlsPort(listenAddr: string): number {
    const idx = listenAddr.lastIndexOf(':')
    const port = idx < 0 ? NaN : Number(listenAddr.slice(idx + 1))
    return Number.isInteger(port) && port > 0 ? port : 56000
}

function withPort(host: string, port: number): string {
    const trimmed = host.trim()
    const last = trimmed.lastIndexOf(':')
    if (last > 0 && !trimmed.startsWith('[') && trimmed.indexOf(':') === last) {
        const maybe = Number(trimmed.slice(last + 1))
        if (Number.isInteger(maybe) && maybe > 0) return trimmed
    }
    return `${trimmed}:${port}`
}

/** Mirrors backend resolveQwdttHostPeer: host address → public node address → subHost. */
export function resolveQwdttHostPeer(input: {
    hostAddress: string | null | undefined
    hostPort: number | null | undefined
    listenAddr: string
    nodeAddress: string | null | undefined
    subHost: string | null | undefined
}): null | { peer: string; source: TQwdttPeerSource } {
    const port = input.hostPort && input.hostPort > 0 ? input.hostPort : dtlsPort(input.listenAddr)
    const hostAddress = (input.hostAddress ?? '').trim()
    if (hostAddress) {
        return isPrivateOrLocalPeerHost(hostAddress)
            ? null
            : { peer: withPort(hostAddress, port), source: 'host' }
    }
    const nodeAddress = (input.nodeAddress ?? '').trim()
    if (nodeAddress && !isPrivateOrLocalPeerHost(nodeAddress)) {
        return { peer: withPort(nodeAddress, port), source: 'node' }
    }
    const subHost = (input.subHost ?? '').trim()
    if (subHost && !isPrivateOrLocalPeerHost(subHost)) {
        return { peer: withPort(subHost, port), source: 'subHost' }
    }
    return null
}
