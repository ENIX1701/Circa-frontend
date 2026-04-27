<script setup lang="ts">
import type { EventCollaboratorRecord, EventMembershipRole } from '@/composables/useEvents';
import AppSelect from '../ui/AppSelect.vue';
import AppButton from '../ui/AppButton.vue';
import AppBadge from '../ui/AppBadge.vue';

defineProps<{
    member: EventCollaboratorRecord
    canManage: boolean
    updating?: boolean
    deleting?: boolean
}>()

const emit = defineEmits<{
    roleChange: [member: EventCollaboratorRecord, role: EventMembershipRole]
    remove: [member: EventCollaboratorRecord]
}>()

const roleOptions: Array<{ label: string; value: EventMembershipRole }> = [
    {label: 'organizer', value: 'organizer'},
    {label: 'staff', value: 'staff'},
    {label: 'volunteer', value: 'volunteer'},
    {label: 'owner', value: 'owner'},
]

function roleTone(role: EventMembershipRole) {
    switch (role) {
        case 'owner':
            return 'accent'
        case 'organizer':
            return 'success'
        case 'staff':
            return 'warning'
        case 'volunteer':
            return 'default'
    }
}
</script>

<template>
    <article class="flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-(--app-bg-subtle) p-4 md:flex-row md:items-center md:justify-between">
        <div>
            <div class="flex flex-wrap items-center gap-3">
                <p class="font-bold text-(--app-text)">{{ member.name }} {{ member.surname }}</p>
                <AppBadge :tone="roleTone(member.role)">{{ member.role }}</AppBadge>
            </div>

            <p class="mt-1 text-sm text-(--app-text-muted)">{{ member.email }}</p>
            <p v-if="member.phone" class="mt-1 text-xs text-(--app-text-muted)">{{ member.phone }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
            <AppSelect :model-value="member.role" :options="roleOptions" class="max-w-40" :disabled="!canManage || updating" @update:model-value="emit('roleChange', member, $event as EventMembershipRole)" />

            <AppButton v-if="canManage" type="button" variant="ghost" size="sm" :loading="deleting" @click="emit('remove', member)">
                {{ deleting ? 'Removing...' : 'Remove' }}
            </AppButton>
        </div>
    </article>
</template>
