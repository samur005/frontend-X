import {
    ActionIcon,
    Alert,
    Badge,
    Button,
    Card,
    Code,
    CopyButton,
    Group,
    MultiSelect,
    NumberInput,
    Stack,
    Switch,
    Table,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import {
    qwdttQueryKeys,
    useCheckQwdttCookies,
    useCheckQwdttHashes,
    useClearQwdttCookies,
    useDeleteQwdttUser,
    useGenerateQwdttHash,
    useGetNodes,
    useGetQwdtt,
    useGetQwdttNodeStatus,
    useGetQwdttUsers,
    useRestartQwdtt,
    useSaveQwdttCookies,
    useUpdateQwdtt,
    useUpsertQwdttUser,
} from '@shared/api/hooks';
import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbCheck, TbCopy, TbHash, TbRefresh, TbTrash } from 'react-icons/tb';

function formatBytes(value: number): string {
    if (!value) {
        return '0 B';
    }
    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
    let size = value;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit += 1;
    }
    return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

interface IQwdttFormProps {
    hashChecks: ReturnType<typeof useCheckQwdttHashes>['data'];
    nodeStatus: ReturnType<typeof useGetQwdttNodeStatus>['data'];
    nodes: ReturnType<typeof useGetNodes>['data'];
    onInvalidate: () => Promise<void>;
    onRefetchHashes: () => Promise<unknown>;
    users: ReturnType<typeof useGetQwdttUsers>['data'];
    usersLoading: boolean;
    view: NonNullable<ReturnType<typeof useGetQwdtt>['data']>;
}

export const QwdttPageComponent = () => {
    const queryClient = useQueryClient();
    const { data: view, isLoading: isViewLoading, refetch: refetchView } = useGetQwdtt();
    const { data: users, isLoading: isUsersLoading, refetch: refetchUsers } = useGetQwdttUsers();
    const { data: nodes } = useGetNodes();
    const { data: nodeStatus, refetch: refetchNodeStatus } = useGetQwdttNodeStatus();
    const { data: hashChecks, refetch: refetchHashChecks } = useCheckQwdttHashes();

    const invalidate = async () => {
        await queryClient.invalidateQueries({ queryKey: qwdttQueryKeys._def });
        await refetchView();
        await refetchUsers();
        await refetchNodeStatus();
    };

    if (isViewLoading || !view) {
        return <LoadingScreen />;
    }

    return (
        <QwdttPageForm
            key={`${view.config.vkHashes}|${String(view.config.enabled)}|${String(view.status.hasCookies)}`}
            hashChecks={hashChecks}
            nodeStatus={nodeStatus}
            nodes={nodes}
            onInvalidate={invalidate}
            onRefetchHashes={refetchHashChecks}
            users={users}
            usersLoading={isUsersLoading}
            view={view}
        />
    );
};

const QwdttPageForm = (props: IQwdttFormProps) => {
    const {
        hashChecks,
        nodeStatus,
        nodes,
        onInvalidate,
        onRefetchHashes,
        users,
        usersLoading,
        view,
    } = props;
    const { t } = useTranslation();

    const { mutateAsync: updateQwdtt, isPending: isSaving } = useUpdateQwdtt();
    const { mutateAsync: saveCookies, isPending: isSavingCookies } = useSaveQwdttCookies();
    const { mutateAsync: clearCookies, isPending: isClearingCookies } = useClearQwdttCookies();
    const { mutateAsync: checkCookies, isPending: isCheckingCookies } = useCheckQwdttCookies();
    const { mutateAsync: generateHash, isPending: isGeneratingHash } = useGenerateQwdttHash();
    const { mutateAsync: upsertUser, isPending: isUpdatingUser } = useUpsertQwdttUser();
    const { mutateAsync: deleteUser, isPending: isDeletingUser } = useDeleteQwdttUser();
    const { mutateAsync: restartQwdtt, isPending: isRestarting } = useRestartQwdtt();

    const [enabled, setEnabled] = useState(view.config.enabled);
    const [autoVkHash, setAutoVkHash] = useState(view.config.autoVkHash);
    const [remark, setRemark] = useState(view.config.remark);
    const [listenAddr, setListenAddr] = useState(view.config.listenAddr);
    const [wgPort, setWgPort] = useState(view.config.wgPort);
    const [dns, setDns] = useState(view.config.dns);
    const [listenRaw, setListenRaw] = useState(view.config.listenRaw);
    const [listenDirect, setListenDirect] = useState(view.config.listenDirect);
    const [subHost, setSubHost] = useState(view.config.subHost);
    const [clientPort, setClientPort] = useState(view.config.clientPort);
    const [workers, setWorkers] = useState(view.config.workers);
    const [vkHashes, setVkHashes] = useState(view.config.vkHashes);
    const [nodeUuids, setNodeUuids] = useState<string[]>(view.config.nodeUuids);
    const [remoteWdttUrl, setRemoteWdttUrl] = useState(view.config.remoteWdttUrl);
    const [remoteWdttCookie, setRemoteWdttCookie] = useState('');
    const [remoteWdttCsrfToken, setRemoteWdttCsrfToken] = useState('');
    const [cookies, setCookies] = useState('');
    const [cookieCheck, setCookieCheck] = useState<string>('');
    const [username, setUsername] = useState('');

    const nodeOptions = useMemo(
        () =>
            (nodes ?? []).map((node) => ({
                value: node.uuid,
                label: `${node.name} (${node.address})`,
            })),
        [nodes],
    );

    const invalidate = onInvalidate;

    const handleSave = async () => {
        await updateQwdtt({
            variables: {
                enabled,
                autoVkHash,
                remark,
                listenAddr,
                wgPort,
                dns,
                listenRaw,
                listenDirect,
                subHost,
                clientPort,
                workers,
                vkHashes,
                nodeUuids,
                remoteWdttUrl,
                remoteWdttCookie: remoteWdttCookie || undefined,
                remoteWdttCsrfToken: remoteWdttCsrfToken || undefined,
                syncNodes: true,
            },
        });
        setRemoteWdttCookie('');
        setRemoteWdttCsrfToken('');
        await invalidate();
    };

    return (
        <Page title={t('constants.qwdtt')}>
            <PageHeaderShared icon={<TbHash size={24} />} title={t('constants.qwdtt')} />
            <Stack gap="md">
                <Alert color="blue" title="Sidecar egress">
                    qWDTT runs as a separate process on assigned nodes. Client traffic leaves the
                    node through the sidecar native NAT, not through Xray. Existing Xray inbounds
                    are unchanged.
                </Alert>

                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Title order={4}>Settings</Title>
                            <Group>
                                <Switch
                                    checked={enabled}
                                    label="Enabled"
                                    onChange={(event) => setEnabled(event.currentTarget.checked)}
                                />
                                <Switch
                                    checked={autoVkHash}
                                    label="Auto-maintain VK hashes"
                                    onChange={(event) => setAutoVkHash(event.currentTarget.checked)}
                                />
                            </Group>
                        </Group>
                        <TextInput
                            label="Remark"
                            onChange={(event) => setRemark(event.currentTarget.value)}
                            value={remark}
                        />
                        <Group grow>
                            <TextInput
                                label="Listen address"
                                onChange={(event) => setListenAddr(event.currentTarget.value)}
                                value={listenAddr}
                            />
                            <NumberInput
                                label="WireGuard port"
                                min={1}
                                max={65535}
                                onChange={(value) => setWgPort(Number(value) || 0)}
                                value={wgPort}
                            />
                            <TextInput
                                label="DNS"
                                onChange={(event) => setDns(event.currentTarget.value)}
                                value={dns}
                            />
                        </Group>
                        <Group grow>
                            <TextInput
                                label="Listen raw"
                                onChange={(event) => setListenRaw(event.currentTarget.value)}
                                value={listenRaw}
                            />
                            <TextInput
                                label="Listen direct (optional)"
                                onChange={(event) => setListenDirect(event.currentTarget.value)}
                                value={listenDirect}
                            />
                        </Group>
                        <Group grow>
                            <TextInput
                                description="Peer host used in qwdtt:// links. Falls back to the first assigned node address."
                                label="Subscription host"
                                onChange={(event) => setSubHost(event.currentTarget.value)}
                                value={subHost}
                            />
                            <NumberInput
                                label="Client port"
                                min={1}
                                max={65535}
                                onChange={(value) => setClientPort(Number(value) || 0)}
                                value={clientPort}
                            />
                            <NumberInput
                                label="Workers"
                                min={1}
                                onChange={(value) => setWorkers(Number(value) || 1)}
                                value={workers}
                            />
                        </Group>
                        <Textarea
                            autosize
                            description="Comma or newline separated. Leave empty when auto-generation is enabled."
                            label="Pinned / current VK hashes"
                            minRows={2}
                            onChange={(event) => setVkHashes(event.currentTarget.value)}
                            value={vkHashes}
                        />
                        <MultiSelect
                            data={nodeOptions}
                            description="Only these nodes receive the sidecar payload."
                            label="Assigned nodes"
                            onChange={setNodeUuids}
                            searchable
                            value={nodeUuids}
                        />
                        <TextInput
                            description="Optional fallback panel (POST /panel/api/vk/call/create)."
                            label="Remote WDTT URL"
                            onChange={(event) => setRemoteWdttUrl(event.currentTarget.value)}
                            value={remoteWdttUrl}
                        />
                        <Group grow>
                            <TextInput
                                description={
                                    view.config.hasRemoteWdttAuth
                                        ? 'Auth is already stored. Fill only to replace it.'
                                        : 'Session cookie for the fallback panel. Never shown back.'
                                }
                                label="Remote WDTT cookie"
                                onChange={(event) => setRemoteWdttCookie(event.currentTarget.value)}
                                value={remoteWdttCookie}
                            />
                            <TextInput
                                label="Remote WDTT CSRF token"
                                onChange={(event) =>
                                    setRemoteWdttCsrfToken(event.currentTarget.value)
                                }
                                value={remoteWdttCsrfToken}
                            />
                        </Group>
                        <Group>
                            <Button loading={isSaving} onClick={() => void handleSave()}>
                                Save and sync nodes
                            </Button>
                            <Button
                                loading={isRestarting}
                                onClick={() => void restartQwdtt({}).then(() => invalidate())}
                                variant="light"
                            >
                                Reconcile sidecars
                            </Button>
                        </Group>
                    </Stack>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Title order={4}>Status</Title>
                            <Badge variant="light">{view.status.hashSource || 'none'}</Badge>
                        </Group>
                        <Text size="sm">
                            Resolved peer: <Code>{view.status.resolvedHost || 'not set'}</Code>
                        </Text>
                        <Text size="sm">
                            VK cookies stored: {view.status.hasCookies ? 'yes' : 'no'}. Env hashes:{' '}
                            {view.status.hashEnv ? 'yes' : 'no'}. Egress: {view.status.egress}.
                        </Text>
                        <Text size="sm">Share-link preview (password redacted if empty):</Text>
                        <Code block>{view.linkPreview || '—'}</Code>
                        <Group>
                            <Button
                                leftSection={<TbRefresh size={16} />}
                                onClick={() => void onRefetchHashes()}
                                variant="light"
                            >
                                Check hashes
                            </Button>
                            <Button
                                loading={isGeneratingHash}
                                onClick={() =>
                                    void generateHash({
                                        variables: { replaceOldest: true },
                                    }).then(() => invalidate())
                                }
                            >
                                Generate VK hash
                            </Button>
                        </Group>
                        {(hashChecks ?? []).length > 0 && (
                            <Stack gap={4}>
                                {hashChecks!.map((item) => (
                                    <Group key={item.hash} gap="xs">
                                        <Badge
                                            color={
                                                item.alive === true
                                                    ? 'teal'
                                                    : item.alive === false
                                                      ? 'red'
                                                      : 'gray'
                                            }
                                        >
                                            {item.alive === true
                                                ? 'alive'
                                                : item.alive === false
                                                  ? 'dead'
                                                  : 'unknown'}
                                        </Badge>
                                        <Code>{item.hash}</Code>
                                        {item.error && (
                                            <Text c="red" size="xs">
                                                {item.error}
                                            </Text>
                                        )}
                                    </Group>
                                ))}
                            </Stack>
                        )}
                        {(nodeStatus ?? []).length > 0 && (
                            <Table highlightOnHover withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Node</Table.Th>
                                        <Table.Th>State</Table.Th>
                                        <Table.Th>Details</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {nodeStatus!.map((item) => (
                                        <Table.Tr key={item.nodeUuid}>
                                            <Table.Td>{item.nodeName}</Table.Td>
                                            <Table.Td>
                                                {item.unreachable
                                                    ? 'unreachable'
                                                    : item.running
                                                      ? 'running'
                                                      : 'stopped'}
                                            </Table.Td>
                                            <Table.Td>
                                                {item.error ||
                                                    [
                                                        item.binaryFound === false
                                                            ? 'binary missing'
                                                            : null,
                                                        item.egress,
                                                        item.pid ? `pid ${item.pid}` : null,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Stack>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                        <Title order={4}>VK cookies</Title>
                        <Text c="dimmed" size="sm">
                            Paste a remixsid cookie string. The backend never returns the raw
                            values. Priority is pinned env hashes, then these cookies + VK API, then
                            the optional remote WDTT panel.
                        </Text>
                        <Textarea
                            autosize
                            minRows={3}
                            onChange={(event) => setCookies(event.currentTarget.value)}
                            placeholder="remixsid=..."
                            value={cookies}
                        />
                        <Group>
                            <Button
                                disabled={!cookies.trim()}
                                loading={isSavingCookies}
                                onClick={() =>
                                    void saveCookies({
                                        variables: { cookies },
                                    }).then(() => {
                                        setCookies('');
                                        return invalidate();
                                    })
                                }
                            >
                                Save cookies
                            </Button>
                            <Button
                                loading={isCheckingCookies}
                                onClick={() =>
                                    void checkCookies({}).then((result) => {
                                        setCookieCheck(
                                            result?.ok
                                                ? 'Cookies are valid'
                                                : result?.error || 'Check failed',
                                        );
                                    })
                                }
                                variant="light"
                            >
                                Check cookies
                            </Button>
                            <Button
                                color="red"
                                loading={isClearingCookies}
                                onClick={() => void clearCookies({}).then(() => invalidate())}
                                variant="subtle"
                            >
                                Clear cookies
                            </Button>
                        </Group>
                        {cookieCheck && <Text size="sm">{cookieCheck}</Text>}
                    </Stack>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                        <Title order={4}>User access</Title>
                        <Group align="flex-end">
                            <TextInput
                                label="Username"
                                onChange={(event) => setUsername(event.currentTarget.value)}
                                placeholder="existing Remnawave username"
                                value={username}
                            />
                            <Button
                                disabled={!username.trim()}
                                loading={isUpdatingUser}
                                onClick={() =>
                                    void upsertUser({
                                        variables: { username: username.trim(), enabled: true },
                                    }).then(() => {
                                        setUsername('');
                                        return invalidate();
                                    })
                                }
                            >
                                Grant access
                            </Button>
                        </Group>
                        {usersLoading ? (
                            <Text size="sm">Loading users…</Text>
                        ) : (
                            <Table highlightOnHover withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>User</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th>Traffic</Table.Th>
                                        <Table.Th>Link</Table.Th>
                                        <Table.Th />
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {(users ?? []).map((user) => (
                                        <Table.Tr key={user.userId}>
                                            <Table.Td>
                                                <Text fw={500}>{user.username}</Text>
                                                <Text c="dimmed" size="xs">
                                                    {user.shortUuid}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Switch
                                                        checked={user.enabled}
                                                        onChange={(event) =>
                                                            void upsertUser({
                                                                variables: {
                                                                    userId: user.userId,
                                                                    enabled:
                                                                        event.currentTarget.checked,
                                                                },
                                                            }).then(() => invalidate())
                                                        }
                                                        size="sm"
                                                    />
                                                    <Badge variant="light">{user.status}</Badge>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                ↓ {formatBytes(user.reportedDownBytes)} / ↑{' '}
                                                {formatBytes(user.reportedUpBytes)}
                                            </Table.Td>
                                            <Table.Td>
                                                <CopyButton value={user.link}>
                                                    {({ copied, copy }) => (
                                                        <ActionIcon
                                                            aria-label="Copy qWDTT link"
                                                            onClick={copy}
                                                            variant="subtle"
                                                        >
                                                            {copied ? (
                                                                <TbCheck size={16} />
                                                            ) : (
                                                                <TbCopy size={16} />
                                                            )}
                                                        </ActionIcon>
                                                    )}
                                                </CopyButton>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs" justify="flex-end" wrap="nowrap">
                                                    <Button
                                                        loading={isUpdatingUser}
                                                        onClick={() =>
                                                            void upsertUser({
                                                                variables: {
                                                                    userId: user.userId,
                                                                    rotatePassword: true,
                                                                },
                                                            }).then(() => invalidate())
                                                        }
                                                        size="xs"
                                                        variant="light"
                                                    >
                                                        Rotate
                                                    </Button>
                                                    <ActionIcon
                                                        color="red"
                                                        loading={isDeletingUser}
                                                        onClick={() =>
                                                            void deleteUser({
                                                                route: {
                                                                    userId: String(user.userId),
                                                                },
                                                            }).then(() => invalidate())
                                                        }
                                                        variant="subtle"
                                                    >
                                                        <TbTrash size={16} />
                                                    </ActionIcon>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Stack>
                </Card>
            </Stack>
        </Page>
    );
};
