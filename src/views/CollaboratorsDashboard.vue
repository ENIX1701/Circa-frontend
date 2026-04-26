<script setup lang="ts">
import { type EventCollaboratorRecord, type EventMembershipRole, useEvents } from '@/composables/useEvents';
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const {getEvent, listEventCollaborators, addEventCollaborator, updateEventCollaborator, deleteEventCollaborator} = useEvents()

const eventId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const loading = ref(true)
const creating = ref(false)
const updatingUserId = ref('')
const deletingUserId = ref('')
const error = ref('')
const currentUserRole = ref<EventMembershipRole>('volunteer')
const collaborators = ref<EventCollaboratorRecord[]>([])

const form = reactive({email: '', role: 'staff' as EventMembershipRole})

const isOwner = computed(() => currentUserRole.value === 'owner')

async function loadCollaborators() {
    if (!eventId.value) {
        collaborators.value = []
        loading.value = false
        return
    }

    loading.value = true
    error.value = ''

    try {
        const [event, members] = await Promise.all([getEvent(eventId.value), listEventCollaborators(eventId.value)])

        currentUserRole.value = event.current_user_role
        collaborators.value = members
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to load collaborators'
    } finally {
        loading.value = false
    }
}

async function handleAddCollaborator() {
    if (!eventId.value || !isOwner.value) return

    const email = form.email.trim().toLowerCase()

    if (!email) {
        error.value = 'Email is required'
        return
    }

    creating.value = true
    error.value = ''

    try {
        const created = await addEventCollaborator(eventId.value, {
            email, role: form.role
        })

        collaborators.value = [...collaborators.value.filter((member) => member.user_id !== created.user_id), created]

        form.email = ''
        form.role = 'staff'
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to add collaborator'
    } finally {
        creating.value = false
    }
}

async function handleRoleChange(member: EventCollaboratorRecord, role: EventMembershipRole) {
    if (!eventId.value || !isOwner.value) return

    updatingUserId.value = member.user_id
    error.value = ''

    try {
        const updated = await updateEventCollaborator(eventId.value, member.user_id, { role })

        collaborators.value = collaborators.value.map((current) => current.user_id === updated.user_id ? updated : current)

        form.email = ''
        form.role = 'staff'
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to update collaborator'
    } finally {
        updatingUserId.value = ''
    }
}

async function handleRemoveCollaborator(member: EventCollaboratorRecord) {
    if (!eventId.value || !isOwner.value) return

    deletingUserId.value = member.user_id
    error.value = ''

    try {
        await deleteEventCollaborator(eventId.value, member.user_id)

        collaborators.value = collaborators.value.filter((current) => current.user_id !== member.user_id)
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to remove collaborator'
    } finally {
        deletingUserId.value = ''
    }
}

watch(eventId, () => {void loadCollaborators()}, {immediate: true})
</script>

<template>
    <div class="space-y-6">
        <div>
            <p class="section">Collaborators</p>
            <h1 class="text-3xl font-bold tracking-tight">Event team</h1>
            <p class="mt-2 text-sm text-(--color-text-muted)">Manage who can access and edit this event! :3</p>
        </div>

        <div v-if="error" class="app-alert app-alert--danger">{{ error }}</div>

        <section v-if="isOwner" class="glass-panel p-6">
            <form class="grid gap-4" @submit.prevent="handleAddCollaborator">
                <input v-model="form.email" type="email" class="app-input" placeholder="you@circa.local" :disabled="creating" />

                <select v-model="form.role" class="app-input" :disabled="creating">
                    <option value="organizer">organizer</option>
                    <option value="staff">staff</option>
                    <option value="volunteer">volunteer</option>
                    <option value="owner">owner</option>
                </select>

                <button type="submit" class="app-button-primary" :disabled="creating">
                    {{ creating ? 'Adding...' : 'Add member' }}
                </button>
            </form>
        </section>

        <section v-else class="glass-panel p-6">
            <p class="text-sm text-(--color-text-muted)">
                Only event owners can add, remove or change collaborator roles >:c
            </p>
        </section>

        <section class="glass-panel glass-panel--strong p-6">
            <div v-if="loading" class="text-sm text-(--color-text-muted)">
                Loading collaborators...
            </div>

            <div v-else-if="collaborators.length === 0" class="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5">
                <p class="section-label">No collaborators yet</p>
            </div>

            <div v-else class="space-y-3">
                <article v-for="member in collaborators" :key="member.user_id" class="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p class="font-semibold">{{ member.name }} {{ member.surname }}</p>
                        <p class="mt-1 text-sm text-(--color-text-muted)">{{ member.email }}</p>
                        <p v-if="member.phone" class="mt-1 text-xs text-(--color-text-muted)">{{ member.phone }}</p>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <select class="app-input max-w-40" :value="member.role" :disabled="!isOwner || updatingUserId === member.user_id" @change="handleRoleChange(member, ($event.target as HTMLSelectElement).value as EventMembershipRole)">
                            <option value="organizer">organizer</option>
                            <option value="staff">staff</option>
                            <option value="volunteer">volunteer</option>
                            <option value="owner">owner</option>
                        </select>

                        <button v-if="isOwner" type="button" class="text-xs text-(--color-text-muted)" :disabled="deletingUserId === member.user_id" @click="handleRemoveCollaborator(member)">
                            {{ deletingUserId === member.user_id ? 'Removing...' : 'Remove' }}
                        </button>
                    </div>
                </article>
            </div>
        </section>
    </div>
</template>
