import { CloneHostFeature } from '@features/ui/dashboard/hosts/clone-host'
import { DeleteHostFeature } from '@features/ui/dashboard/hosts/delete-host'
import { HostSelectInboundFeature } from '@features/ui/dashboard/hosts/host-select-inbound/host-select-inbound.feature'
import {
    ActionIcon,
    Button,
    Group,
    Popover,
    NumberInput,
    SegmentedControl,
    Stack,
    Text,
    TextInput
} from '@mantine/core'
import {
    CreateHostCommand,
    UpdateHostCommand,
    UpdateManyHostsCommand
} from '@remnawave/backend-contract'
import { INTERNAL_SQUADS_MODE, SECURITY_LAYERS } from '@remnawave/backend-contract'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiQuestionMarkCircle } from 'react-icons/hi'
import { PiFloppyDiskDuotone } from 'react-icons/pi'

import { DrawerFooter } from '@shared/ui/drawer-footer'
import { TemplateInfoPopoverShared } from '@shared/ui/popovers'
import { PopoverWithInfoShared } from '@shared/ui/popovers/popover-with-info'
import { SectionCard } from '@shared/ui/section-card'

import { HostVisibility } from './host-visibility'
import { QwdttHostSection } from './qwdtt/qwdtt-host-section'
import { IProps } from './interfaces'
import { getHostJsonFields } from './json-fields'
import {
    HostFormDataProvider,
    HostOptionsProvider,
    HostOptionsSection,
    IHostFormData
} from './options'

export const BaseHostForm = <
    T extends
        | CreateHostCommand.RequestBody
        | UpdateHostCommand.RequestBody
        | UpdateManyHostsCommand.RequestBody
>(
    props: IProps<T>
) => {
    const {
        form,
        handleSubmit,
        configProfiles,
        isSubmitting,
        nodes,
        internalSquads,
        isBulkEdit,
        subscriptionTemplates,
        hostTags,
        removeRequiredFields,
        responseRules,
        hostUuid
    } = props

    const { i18n, t } = useTranslation()
    const [internalSquadsMode, setInternalSquadsMode] = useState(
        () => form.getValues().internalSquads?.mode
    )

    const watchInternalSquadsMode = useCallback(
        ({ value }: { value: unknown }) =>
            setInternalSquadsMode(
                value as (typeof INTERNAL_SQUADS_MODE)[keyof typeof INTERNAL_SQUADS_MODE]
            ),
        []
    )

    form.watch('internalSquads.mode', watchInternalSquadsMode)

    const isAllowOnlyInternalSquads = internalSquadsMode === INTERNAL_SQUADS_MODE.ALLOW_ONLY
    const { error: _internalSquadsModeError, ...internalSquadsModeProps } =
        form.getInputProps('internalSquads.mode')

    const hostJsonFields = useMemo(() => getHostJsonFields(t), [t])

    // Remnawave-X: qWDTT host type (no Xray inbound, exactly one node).
    const anyForm = form as unknown as {
        getValues: () => Record<string, unknown>
        setFieldValue: (path: string, value: unknown) => void
        setValues: (values: Record<string, unknown>) => void
        setDirty: (values: Record<string, boolean>) => void
        setTouched: (values: Record<string, boolean>) => void
    }
    const [isQwdtt, setIsQwdtt] = useState(() => Boolean(anyForm.getValues().isQwdtt))
    const [qwdttNode, setQwdttNode] = useState<null | string>(() => {
        const current = anyForm.getValues().nodes as string[] | undefined
        return current && current.length > 0 ? current[0] : null
    })
    const [qwdttAddress, setQwdttAddress] = useState<string | undefined>(
        () => anyForm.getValues().address as string | undefined
    )
    const [qwdttPort, setQwdttPort] = useState<number | undefined>(
        () => anyForm.getValues().port as number | undefined
    )
    form.watch('isQwdtt' as never, ({ value }: { value: unknown }) => setIsQwdtt(Boolean(value)))
    form.watch('address' as never, ({ value }: { value: unknown }) =>
        setQwdttAddress(value as string | undefined)
    )
    form.watch('port' as never, ({ value }: { value: unknown }) =>
        setQwdttPort(value as number | undefined)
    )
    form.watch('nodes' as never, ({ value }: { value: unknown }) => {
        const list = value as string[] | undefined
        setQwdttNode(list && list.length > 0 ? list[0] : null)
    })

    const markDirty = (...keys: string[]) => {
        const flags = Object.fromEntries(keys.map((key) => [key, true]))
        anyForm.setTouched(flags)
        anyForm.setDirty(flags)
    }

    const switchHostType = (value: string) => {
        if (value === 'qwdtt') {
            const values = anyForm.getValues()
            anyForm.setFieldValue('isQwdtt', true)
            anyForm.setFieldValue('inbound', undefined)
            const currentNodes = (values.nodes as string[] | undefined) ?? []
            anyForm.setFieldValue('nodes', currentNodes.slice(0, 1))
            if (!values.port) {
                anyForm.setFieldValue('port', 56000)
            }
        } else {
            anyForm.setFieldValue('isQwdtt', false)
            anyForm.setFieldValue('inbound', { configProfileUuid: '', configProfileInboundUuid: '' })
        }
        markDirty('isQwdtt', 'inbound', 'nodes', 'port')
    }

    const selectQwdttNode = (nodeUuid: null | string) => {
        anyForm.setFieldValue('nodes', nodeUuid ? [nodeUuid] : [])
        markDirty('nodes')
    }

    const srrRuleNames = useMemo(
        () => [...new Set(responseRules.map((rule) => rule.name))],
        [responseRules]
    )

    const securityLayerLabels = {
        [SECURITY_LAYERS.TLS]: t('base-host-form.tls-transport-layer-security'),
        [SECURITY_LAYERS.NONE]: t('base-host-form.none'),
        [SECURITY_LAYERS.DEFAULT]: t('base-host-form.inbounds-default')
    }

    const resolveSelectedRawInbound = () => {
        const { inbound } = form.getValues()

        if (!inbound?.configProfileUuid || !inbound.configProfileInboundUuid) {
            return undefined
        }

        return configProfiles
            ?.find((configProfile) => configProfile.uuid === inbound.configProfileUuid)
            ?.inbounds.find(
                (profileInbound) => profileInbound.uuid === inbound.configProfileInboundUuid
            )?.rawInbound
    }

    const isXhttpExtraButtonDisabled = () => {
        const { inbound } = form.getValues()

        if (!inbound) {
            return true
        }

        if (!configProfiles || !inbound.configProfileInboundUuid || !inbound.configProfileUuid) {
            return true
        }

        return !configProfiles.some(
            (configProfile) =>
                configProfile.uuid === inbound.configProfileUuid &&
                configProfile.inbounds.some((inbound) => inbound.network === 'xhttp')
        )
    }

    const saveInbound = (inbound: string, configProfileUuid: string) => {
        form.setValues({
            isQwdtt: false,
            inbound: {
                configProfileInboundUuid: inbound,
                configProfileUuid
            }
        } as unknown as Partial<T>)
        form.setTouched({
            configProfileInboundUuid: true,
            configProfileUuid: true
        })
        form.setDirty({
            configProfileInboundUuid: true,
            configProfileUuid: true
        })
    }

    const patternHoverCard = (showSingle = true, showMulti = true, showWildcard = true) => {
        return (
            <Popover shadow="md" width={300} withArrow>
                <Popover.Target>
                    <ActionIcon
                        aria-label={t('base-host-form.single-domain')}
                        color="gray"
                        size="xs"
                        variant="subtle"
                    >
                        <HiQuestionMarkCircle aria-hidden size={20} />
                    </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                    <Stack gap="md">
                        <Stack gap="sm">
                            {showSingle && (
                                <Stack gap={0}>
                                    <Text fw={600} mb={4} size="sm">
                                        {t('base-host-form.single-domain')}
                                    </Text>
                                    <Text c="dimmed" mb={6} size="xs">
                                        {t('base-host-form.default-mode-for-one-domain')}
                                    </Text>
                                    <Text c="blue" ff="monospace" size="xs">
                                        eu.node.com
                                    </Text>
                                </Stack>
                            )}

                            {showMulti && (
                                <Stack gap={0}>
                                    <Text fw={600} mb={4} size="sm">
                                        {t('base-host-form.multi-domain')}
                                    </Text>
                                    <Text c="dimmed" mb={6} size="xs">
                                        {t('base-host-form.multi-domain-description')}
                                    </Text>
                                    <Text c="blue" ff="monospace" size="xs">
                                        eu.node.com,us.node.com,au.node.com
                                    </Text>
                                </Stack>
                            )}

                            {showWildcard && (
                                <Stack gap={0}>
                                    <Text fw={600} mb={4} size="sm">
                                        {t('base-host-form.wildcard-domain')}
                                    </Text>
                                    <Text c="dimmed" mb={6} size="xs">
                                        {t('base-host-form.wildcard-domain-description')}
                                    </Text>
                                    <Text c="blue" ff="monospace" size="xs">
                                        *.node.com
                                    </Text>
                                </Stack>
                            )}
                        </Stack>
                    </Stack>
                </Popover.Dropdown>
            </Popover>
        )
    }

    const tagsInputProps = form.getInputProps('tags')

    const handleTagsChange = (value: string[]) => {
        tagsInputProps.onChange?.(value)

        form.setErrors((errors) =>
            Object.fromEntries(
                Object.entries(errors).filter(([key]) => key !== 'tags' && !key.startsWith('tags.'))
            )
        )
        form.validateField('tags')
    }

    const hostFormData: IHostFormData = {
        form,
        handleTagsChange,
        hostJsonFields,
        hostTags,
        internalSquads,
        internalSquadsModeProps,
        isAllowOnlyInternalSquads,
        isXhttpExtraButtonDisabled,
        language: i18n.language,
        nodes,
        patternHoverCard,
        resolveSelectedRawInbound,
        securityLayerLabels,
        srrRuleNames,
        subscriptionTemplates,
        tagsInputProps
    }

    return (
        <form onSubmit={handleSubmit}>
            <HostFormDataProvider value={hostFormData}>
                <HostOptionsProvider form={form} hideFields={isQwdtt ? ['nodes'] : []} isBulkEdit={isBulkEdit}>
                    <Stack>
                        <SectionCard.Root>
                            <SectionCard.Section>
                                <HostVisibility />
                            </SectionCard.Section>
                            <SectionCard.Section>
                                <Stack gap="md">
                                    <TextInput
                                        key={form.key('remark')}
                                        label={t('base-host-form.remark')}
                                        {...form.getInputProps('remark')}
                                        leftSection={<TemplateInfoPopoverShared />}
                                        required={!removeRequiredFields}
                                    />

                                    <SegmentedControl
                                        data={[
                                            { label: t('qwdtt-host.type-xray'), value: 'xray' },
                                            { label: t('qwdtt-host.type-qwdtt'), value: 'qwdtt' }
                                        ]}
                                        fullWidth
                                        onChange={switchHostType}
                                        value={isQwdtt ? 'qwdtt' : 'xray'}
                                    />

                                    {isQwdtt && (
                                        <QwdttHostSection
                                            address={qwdttAddress}
                                            error={form.errors.nodes ?? null}
                                            nodes={nodes}
                                            onNodeChange={selectQwdttNode}
                                            port={qwdttPort}
                                            selectedNodeUuid={qwdttNode}
                                        />
                                    )}

                                    <Stack gap="xs" display={isQwdtt ? 'none' : undefined}>
                                        <HostSelectInboundFeature
                                            activeConfigProfileInbound={
                                                form.getValues().inbound
                                                    ?.configProfileInboundUuid ?? undefined
                                            }
                                            activeConfigProfileUuid={
                                                form.getValues().inbound?.configProfileUuid ??
                                                undefined
                                            }
                                            configProfiles={configProfiles}
                                            error={
                                                form.errors['inbound.configProfileUuid'] ??
                                                form.errors['inbound.configProfileInboundUuid'] ??
                                                null
                                            }
                                            onSaveInbound={saveInbound}
                                        />
                                    </Stack>

                                    <Group
                                        gap="xs"
                                        grow
                                        justify="space-between"
                                        preventGrowOverflow={false}
                                        w="100%"
                                    >
                                        <TextInput
                                            key={form.key('address')}
                                            label={t('common.field.address')}
                                            leftSection={
                                                <PopoverWithInfoShared
                                                    text={
                                                        <>
                                                            {t(
                                                                'base-host-form.address-description-line-1'
                                                            )}
                                                            <br />
                                                            {t(
                                                                'base-host-form.address-description-line-2'
                                                            )}
                                                        </>
                                                    }
                                                />
                                            }
                                            {...form.getInputProps('address')}
                                            placeholder={
                                                isQwdtt
                                                    ? t('qwdtt-host.address-placeholder')
                                                    : 'example.com'
                                            }
                                            required={!removeRequiredFields && !isQwdtt}
                                            rightSection={patternHoverCard(true, true, true)}
                                            rightSectionPointerEvents="auto"
                                            w="65%"
                                        />

                                        <NumberInput
                                            key={form.key('port')}
                                            label={t('common.field.port')}
                                            {...form.getInputProps('port')}
                                            allowDecimal={false}
                                            allowNegative={false}
                                            clampBehavior="strict"
                                            decimalScale={0}
                                            hideControls
                                            leftSection={
                                                <PopoverWithInfoShared
                                                    text={
                                                        <>
                                                            {t(
                                                                'base-host-form.port-description-line-1'
                                                            )}
                                                            <br />
                                                            <br />
                                                            {t(
                                                                'base-host-form.port-description-line-2'
                                                            )}
                                                        </>
                                                    }
                                                />
                                            }
                                            max={65535}
                                            min={1}
                                            placeholder={isQwdtt ? '56000' : '443'}
                                            required={!removeRequiredFields}
                                            w="30%"
                                        />
                                    </Group>
                                </Stack>
                            </SectionCard.Section>
                        </SectionCard.Root>

                        <HostOptionsSection />
                    </Stack>
                </HostOptionsProvider>
            </HostFormDataProvider>
            <DrawerFooter>
                <Group gap="xs" justify="space-between" w="100%">
                    <Group gap="xs">
                        <Button
                            color="teal"
                            disabled={!form.isDirty() || !form.isTouched()}
                            leftSection={<PiFloppyDiskDuotone size="16px" />}
                            loading={isSubmitting}
                            size="md"
                            type="submit"
                            variant="soft"
                        >
                            {t('common.action.save')}
                        </Button>
                    </Group>

                    {!!hostUuid && (
                        <Group gap="xs">
                            <CloneHostFeature hostUuid={hostUuid} />
                            <DeleteHostFeature hostUuid={hostUuid} />
                        </Group>
                    )}
                </Group>
            </DrawerFooter>
        </form>
    )
}
