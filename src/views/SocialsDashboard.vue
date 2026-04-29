<script setup lang="ts">
import SocialPostCard from '@/components/socials/SocialPostCard.vue'
import SocialPostForm from '@/components/socials/SocialPostForm.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppPanel from '@/components/ui/AppPanel.vue'
import AppPanelHeader from '@/components/ui/AppPanelHeader.vue'
import {
  type CreateSocialPostRequest,
  type SocialPostRecord,
  useEvents,
} from '@/composables/useEvents'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { listSocialPosts, createSocialPost, updateSocialPost, deleteSocialPost } = useEvents()

const eventId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

const loading = ref(true)
const creating = ref(false)
const updatingPostId = ref('')
const deletingPostId = ref('')
const error = ref('')
const editingPostId = ref('')

const posts = ref<SocialPostRecord[]>([])

const editingPost = computed(() => posts.value.find((post) => post.id === editingPostId.value))

async function loadPosts() {
  if (!eventId.value) {
    posts.value = []
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    posts.value = await listSocialPosts(eventId.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load social posts'
  } finally {
    loading.value = false
  }
}

function replacePost(updated: SocialPostRecord) {
  posts.value = posts.value
    .map((post) => (post.id === updated.id ? updated : post))
    .sort((a, b) => a.position - b.position)
}

async function handleCreatePost(payload: CreateSocialPostRequest) {
  if (!eventId.value) {
    return
  }

  creating.value = true
  error.value = ''

  try {
    const created = await createSocialPost(eventId.value, payload)
    posts.value = [...posts.value, created].sort((a, b) => a.position - b.position)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create social post'
  } finally {
    creating.value = false
  }
}

function beginEditPost(post: SocialPostRecord) {
  editingPostId.value = post.id
}

function cancelEditPost() {
  editingPostId.value = ''
}

async function handleUpdatePost(payload: {
  platform: string
  title: string
  body: string
  status: SocialPostRecord['status']
}) {
  if (!eventId.value || !editingPost.value) return

  updatingPostId.value = editingPost.value.id
  error.value = ''

  try {
    const updated = await updateSocialPost(eventId.value, editingPost.value.id, payload)
    replacePost(updated)
    editingPostId.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update social post'
  } finally {
    updatingPostId.value = ''
  }
}

async function handleStatusChange(post: SocialPostRecord, status: SocialPostRecord['status']) {
  if (!eventId.value) {
    return
  }

  updatingPostId.value = post.id
  error.value = ''

  try {
    const updated = await updateSocialPost(eventId.value, post.id, { status })
    replacePost(updated)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update social post'
  } finally {
    updatingPostId.value = ''
  }
}

async function removePost(postId: string) {
  if (!eventId.value) {
    return
  }

  deletingPostId.value = postId
  error.value = ''

  try {
    await deleteSocialPost(eventId.value, postId)
    posts.value = posts.value.filter((post) => post.id !== postId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete social post'
  } finally {
    deletingPostId.value = ''
  }
}

watch(
  eventId,
  () => {
    void loadPosts()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-8">
    <AppPageHeader
      eyebrow="Socials"
      title="Social drafts"
      description="The playground for the socially connected x3"
    />

    <AppAlert v-if="error" tone="danger">{{ error }}</AppAlert>

    <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <AppPanel class="space-y-6">
        <AppPanelHeader
          :eyebrow="editingPost ? 'Edit' : 'Create'"
          :title="editingPost ? 'Edit post' : 'New post'"
        />

        <SocialPostForm
          :post="editingPost"
          :loading="creating || Boolean(updatingPostId)"
          @create="handleCreatePost"
          @update="handleUpdatePost"
          @cancel="cancelEditPost"
        />
      </AppPanel>

      <AppPanel tone="muted" class="space-y-6">
        <AppPanelHeader eyebrow="Posts" title="Draft queue" />

        <AppLoadingState v-if="loading" label="Loading social posts..." />

        <AppEmptyState
          v-else-if="posts.length === 0"
          title="No posts yet"
          description="Create the first draft :3"
        />

        <div v-else class="space-y-4">
          <SocialPostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :updating="updatingPostId === post.id"
            :deleting="deletingPostId === post.id"
            @edit="beginEditPost"
            @remove="removePost"
            @status-change="handleStatusChange"
          />
        </div>
      </AppPanel>
    </div>
  </div>
</template>
