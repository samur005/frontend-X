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
            key={`${view.config.vkHashes}|${String(view.config.enabled)}`}
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
    const [cookies, setCookies] = useState(view.config.vkCookies || '');
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
                <Alert color="blue" title={t('qwdtt.page.component.sidecar-egress-title')}>
                    {t('qwdtt.page.component.sidecar-egress-body')}
                </Alert>

                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Title order={4}>{t('qwdtt.page.component.settings')}</Title>
                            <Group>
                                <Switch
                                    checked={enabled}
                                    label={t('qwdtt.page.component.enabled')}
                                    onChange={(event) => setEnabled(event.currentTarget.checked)}
                                />
                                <Switch
                                    checked={autoVkHash}
                                    label={t('qwdtt.page.component.auto-maintain-vk-hashes')}
                                    onChange={(event) => setAutoVkHash(event.currentTarget.checked)}
                                />
                            </Group>
                        </Group>
                        <TextInput
                            label={t('qwdtt.page.component.remark')}
                            onChange={(event) => setRemark(event.currentTarget.value)}
                            value={remark}
                        />
                        <Group grow>
                            <TextInput
                                label={t('qwdtt.page.component.listen-address')}
                                onChange={(event) => setListenAddr(event.currentTarget.value)}
                                value={listenAddr}
                            />
                            <NumberInput
                                label={t('qwdtt.page.component.wireguard-port')}
                                min={1}
                                max={65535}
                                onChange={(value) => setWgPort(Number(value) || 0)}
                                value={wgPort}
                            />
                            <TextInput
                                label={t('qwdtt.page.component.dns')}
                                onChange={(event) => setDns(event.currentTarget.value)}
                                value={dns}
                            />
                        </Group>
                        <Group grow>
                            <TextInput
                                label={t('qwdtt.page.component.listen-raw')}
                                onChange={(event) => setListenRaw(event.currentTarget.value)}
                                value={listenRaw}
                            />
                            <TextInput
                                label={t('qwdtt.page.component.listen-direct')}
                                onChange={(event) => setListenDirect(event.currentTarget.value)}
                                value={listenDirect}
                            />
                        </Group>
                        <Group grow>
                            <TextInput
                                description={t('qwdtt.page.component.subscription-host-description')}
                                label={t('qwdtt.page.component.subscription-host')}
                                onChange={(event) => setSubHost(event.currentTarget.value)}
                                value={subHost}
                            />
                            <NumberInput
                                label={t('qwdtt.page.component.client-port')}
                                min={1}
                                max={65535}
                                onChange={(value) => setClientPort(Number(value) || 0)}
                                value={clientPort}
                            />
                            <NumberInput
                                label={t('qwdtt.page.component.workers')}
                                min={1}
                                onChange={(value) => setWorkers(Number(value) || 1)}
                                value={workers}
                            />
                        </Group>
                        <Textarea
                            autosize
                            description={t('qwdtt.page.component.vk-hashes-description')}
                            label={t('qwdtt.page.component.vk-hashes')}
                            minRows={2}
                            onChange={(event) => setVkHashes(event.currentTarget.value)}
                            value={vkHashes}
                        />
                        <MultiSelect
                            data={nodeOptions}
                            description={t('qwdtt.page.component.assigned-nodes-description')}
                            label={t('qwdtt.page.component.assigned-nodes')}
                            onChange={setNodeUuids}
                            searchable
                            value={nodeUuids}
                        />
                        <TextInput
                            description={t('qwdtt.page.component.remote-wdtt-url-description')}
                            label={t('qwdtt.page.component.remote-wdtt-url')}
                            onChange={(event) => setRemoteWdttUrl(event.currentTarget.value)}
                            value={remoteWdttUrl}
                        />
                        <Group grow>
                            <TextInput
                                description={
                                    view.config.hasRemoteWdttAuth
                                        ? t('qwdtt.page.component.remote-wdtt-cookie-stored')
                                        : t('qwdtt.page.component.remote-wdtt-cookie-empty')
                                }
                                label={t('qwdtt.page.component.remote-wdtt-cookie')}
                                onChange={(event) => setRemoteWdttCookie(event.currentTarget.value)}
                                value={remoteWdttCookie}
                            />
                            <TextInput
                                label={t('qwdtt.page.component.remote-wdtt-csrf')}
                                onChange={(event) =>
                                    setRemoteWdttCsrfToken(event.currentTarget.value)
                                }
                                value={remoteWdttCsrfToken}
                            />
                        </Group>
                        <Group>
                            <Button loading={isSaving} onClick={() => void handleSave()}>
                                {t('qwdtt.page.component.save-and-sync')}
                            </Button>
                            <Button
                                loading={isRestarting}
                                onClick={() => void restartQwdtt({}).then(() => invalidate())}
                                variant="light"
                            >
                                {t('qwdtt.page.component.reconcile-sidecars')}
                            </Button>
                        </Group>
                    </Stack>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Title order={4}>{t('qwdtt.page.component.status')}</Title>
                            <Badge variant="light">{view.status.hashSource || t('qwdtt.page.component.none')}</Badge>
                        </Group>
                        <Text size="sm">
                            {t('qwdtt.page.component.resolved-peer')}:{' '}
                            <Code>{view.status.resolvedHost || t('qwdtt.page.component.not-set')}</Code>
                        </Text>
                        <Text size="sm">
                            {t('qwdtt.page.component.status-line', {
                                cookies: view.status.hasCookies
                                    ? t('qwdtt.page.component.yes')
                                    : t('qwdtt.page.component.no'),
                                hashes: view.status.hashEnv
                                    ? t('qwdtt.page.component.yes')
                                    : t('qwdtt.page.component.no'),
                                egress: view.status.egress,
                            })}
                        </Text>
                        <Text size="sm">{t('qwdtt.page.component.share-link-preview')}</Text>
                        <Code block>{view.linkPreview || '—'}</Code>
                        <Group>
                            <Button
                                leftSection={<TbRefresh size={16} />}
                                onClick={() => void onRefetchHashes()}
                                variant="light"
                            >
                                {t('qwdtt.page.component.check-hashes')}
                            </Button>
                            <Button
                                loading={isGeneratingHash}
                                onClick={() =>
                                    void generateHash({
                                        variables: { replaceOldest: true },
                                    }).then(() => invalidate())
                                }
                            >
                                {t('qwdtt.page.component.generate-vk-hash')}
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
                                                ? t('qwdtt.page.component.hash-alive')
                                                : item.alive === false
                                                  ? t('qwdtt.page.component.hash-dead')
                                                  : t('qwdtt.page.component.hash-unknown')}
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
                                        <Table.Th>{t('qwdtt.page.component.node')}</Table.Th>
                                        <Table.Th>{t('qwdtt.page.component.state')}</Table.Th>
                                        <Table.Th>{t('qwdtt.page.component.details')}</Table.Th>
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
                                                            ? t('qwdtt.page.component.binary-missing')
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
                        <Title order={4}>{t('qwdtt.page.component.vk-cookies')}</Title>
                        <Text c="dimmed" size="sm">
                            {t('qwdtt.page.component.cookies-description')}
                        </Text>
                        <Textarea
                            autosize
                            minRows={3}
                            onChange={(event) => setCookies(event.currentTarget.value)}
                            placeholder={t('qwdtt.page.component.cookies-placeholder')}
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
                                {t('qwdtt.page.component.save-cookies')}
                            </Button>
                            <Button
                                loading={isCheckingCookies}
                                onClick={() =>
                                    void checkCookies({}).then((result) => {
                                        setCookieCheck(
                                            result?.ok
                                                ? t('qwdtt.page.component.cookies-valid')
                                                : result?.error ||
                                                  t('qwdtt.page.component.cookies-check-failed'),
                                        );
                                    })
                                }
                                variant="light"
                            >
                                {t('qwdtt.page.component.check-cookies')}
                            </Button>
                            <Button
                                color="red"
                                loading={isClearingCookies}
                                onClick={() => void clearCookies({}).then(() => { setCookies(''); return invalidate(); })}
                                variant="subtle"
                            >
                                {t('qwdtt.page.component.clear-cookies')}
                            </Button>
                        </Group>
                        {cookieCheck && <Text size="sm">{cookieCheck}</Text>}
                    </Stack>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                        <Title order={4}>{t('qwdtt.page.component.user-access')}</Title>
                        <Group align="flex-end">
                            <TextInput
                                label={t('qwdtt.page.component.username')}
                                onChange={(event) => setUsername(event.currentTarget.value)}
                                placeholder={t('qwdtt.page.component.username-placeholder')}
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
                                {t('qwdtt.page.component.grant-access')}
                            </Button>
                        </Group>
                        {usersLoading ? (
                            <Text size="sm">{t('qwdtt.page.component.loading-users')}</Text>
                        ) : (
                            <Table highlightOnHover withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>{t('qwdtt.page.component.user')}</Table.Th>
                                        <Table.Th>{t('qwdtt.page.component.status')}</Table.Th>
                                        <Table.Th>{t('qwdtt.page.component.traffic')}</Table.Th>
                                        <Table.Th>{t('qwdtt.page.component.link')}</Table.Th>
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
                                                            aria-label={t('qwdtt.page.component.copy-qwdtt-link')}
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
                                                        {t('qwdtt.page.component.rotate')}
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
