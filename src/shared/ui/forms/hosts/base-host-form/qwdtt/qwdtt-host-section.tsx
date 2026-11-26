import { Alert, Select, Stack, Text } from '@mantine/core'
import { GetNodesCommand } from '@remnawave/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbAlertTriangle, TbCircleCheck } from 'react-icons/tb'

import { resolveQwdttHostPeer } from '@shared/api/hosts-contract'
import { useGetQwdtt } from '@shared/api/hooks'
import { emojiFlag } from '@shared/utils/misc/resolve-country-code'

interface IProps {
    address: string | undefined
    error?: React.ReactNode
    nodes: GetNodesCommand.Response['response']
    onNodeChange: (nodeUuid: null | string) => void
    port: number | undefined
    selectedNodeUuid: null | string
}

/**
 * qWDTT host: no Xray inbound. The host is bound to exactly one node and becomes
 * a separate qwdtt:// entry in the subscription with its own remark (location).
 */
export function QwdttHostSection(props: IProps) {
    const { address, error, nodes, onNodeChange, port, selectedNodeUuid } = props
    const { t } = useTranslation()
    const { data: qwdtt } = useGetQwdtt()

    const node = nodes.find((item) => item.uuid === selectedNodeUuid)
    const settings = qwdtt?.config
    const isAssigned = !!(node && settings?.nodeUuids.includes(node.uuid))
    const resolved =
        node && settings
            ? resolveQwdttHostPeer({
                  hostAddress: address,
                  hostPort: port,
                  listenAddr: settings.listenAddr,
                  nodeAddress: node.address,
                  subHost: settings.subHost
              })
            : null

    let warning: null | string = null
    if (node && settings) {
        if (!settings.enabled) {
            warning = t('qwdtt-host.warning-disabled')
        } else if (!isAssigned) {
            warning = t('qwdtt-host.warning-node-not-assigned')
        } else if (!resolved) {
            warning = (address ?? '').trim()
                ? t('qwdtt-host.warning-private-address')
                : t('qwdtt-host.warning-no-peer')
        }
    }

    return (
        <Stack gap="xs">
            <Select
                data={nodes.map((item) => ({
                    label: `${emojiFlag(item.countryCode)} ${item.name}`,
                    value: item.uuid
                }))}
                description={t('qwdtt-host.node-description')}
                error={error}
                label={t('qwdtt-host.node')}
                onChange={onNodeChange}
                required
                searchable
                value={selectedNodeUuid}
            />

            {node && warning && (
                <Alert color="orange" icon={<TbAlertTriangle size={18} />} variant="light">
                    <Text size="sm">{warning}</Text>
                </Alert>
            )}

            {node && !warning && resolved && (
                <Alert color="teal" icon={<TbCircleCheck size={18} />} variant="light">
                    <Text size="sm">
                        {t('qwdtt-host.peer-ok', {
                            peer: resolved.peer,
                            source: t(`qwdtt-host.source-${resolved.source}`)
                        })}
                    </Text>
                </Alert>
            )}

            <Text c="dimmed" size="xs">
                {t('qwdtt-host.address-order')}
            </Text>
        </Stack>
    )
}
