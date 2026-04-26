<script setup lang="ts">
import { type SocialPostRecord, useEvents } from '@/composables/useEvents';
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const {
  listSocialPosts,
  createSocialPost,
  updateSocialPost,
  deleteSocialPost,
} = useEvents()

const eventId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const loading = ref(true)
const creating = ref(false)
const updatingPostId = ref('')
const deletingPostId = ref('')
const error = ref('')
const editingPostId = ref('')

const posts = ref<SocialPostRecord[]>([])

const form = reactive({
  platform: 'Instagram',
  title: '',
  body: '',
})

const editForm = reactive({
  platform: '',
  title: '',
  body: '',
  status: 'draft' as SocialPostRecord['status'],
})

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

async function handleCreatePost() {
  if (!eventId.value) {
    return
  }

  const title = form.title.trim()
  const platform = form.platform.trim()
  const body = form.body.trim()

  if (!platform || !title) {
    error.value = 'Platform and title are required'
    return
  }

  creating.value = true
  error.value = ''

  try {
    const created = await createSocialPost(eventId.value, {
      platform, title, body: body || undefined
    })

    posts.value = [...posts.value, created].sort((a, b) => a.position - b.position)
    form.title = ''
    form.body = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create social post'
  } finally {
    creating.value = false
  }
}

function replacePost(updated: SocialPostRecord) {
  posts.value = posts.value.map((post) => post.id === updated.id ? updated : post).sort((a, b) => a.position - b.position)
}

function beginEditPost(post: SocialPostRecord) {
  editingPostId.value = post.id

  editForm.platform = post.platform
  editForm.title = post.title
  editForm.body = post.body
  editForm.status = post.status
}

function cancelEditPost() {
  editingPostId.value = ''
}

async function handleUpdatePost(post: SocialPostRecord) {
  if (!eventId.value) return

  const platform = editForm.platform.trim()
  const title = editForm.title.trim()
  const body = editForm.body.trim()

  if (!platform || !title) {
    error.value = 'Platform and title are required'
    return
  }

  updatingPostId.value = post.id
  error.value = ''

  try {
    const updated = await updateSocialPost(eventId.value, post.id, {
      platform, title, body, status: editForm.status,
    })

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
    const updated = await updateSocialPost(eventId.value, post.id, {status})
    
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
    error.value = err instanceof Error ? err.message : 'Failed to create social post'
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
  <div class="space-y-6">
    <div>
      <p class="section-label">Socials</p>
      <h1 class="text-3xl font-bold tracking-tight">Social drafts</h1>
    </div>

    <div v-if="error" class="app-alert app-alert--danger">{{ error }}</div>

    <form class="glass-panel p-6 space-y-4" @submit.prevent="handleCreatePost">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <label for="social-platform" class="block text-sm font-medium text-(--color-text-muted)">Platform</label>
          <input id="social-platform" v-model="form.platform" type="text" class="app-input" placeholder="Instagram" />
        </div>

        <div class="space-y-2">
          <label for="social-title" class="block text-sm font-medium text-(--color-text-muted)">Title</label>
          <input id="social-title" v-model="form.title" type="text" class="app-input" placeholder="Launch teaser" />
      </div>
        </div>

        <div class="space-y-2">
          <label for="social-body" class="block text-sm font-medium text-(--color-text-muted)">Body</label>
          <textarea id="social-body" v-model="form.body" class="app-input" placeholder="The copy goes here :3" />
        </div>

        <button type="submit" class="app-button-primary" :disabled="creating">
          {{ creating ? 'Creating...' : 'Create post' }}
        </button>
    </form>

    <section class="glass-panel p-6">
      <div v-if="loading" class="text-sm text-(--color-text-muted)">
        Loading social posts...
      </div>

      <div v-else-if="posts.length === 0" class="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5">
        <p class="section-label">No posts yet</p>
        <p class="mt-2 text-sm text-(--color-text-muted)">Create the first draft above! :3</p>
      </div>

      <div v-else class="space-y-4">
        <article v-for="post in posts" :key="post.id" class="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <form v-if="editingPostId === post.id" class="space-y-4" @submit.prevent="handleUpdatePost(post)">
            <div class="grid gap-4 md:grid-cols-2">
              <input v-model="editForm.platform" type="text" class="app-input" placeholder="Platform" :disabled="updatingPostId === post.id" />
              <input v-model="editForm.title" type="text" class="app-input" placeholder="What are you gonna call it? :3" :disabled="updatingPostId === post.id" />
            </div>

            <textarea v-model="editForm.body" type="text" class="app-input" placeholder="The copy goes here! :3" :disabled="updatingPostId === post.id"></textarea>

            <select v-model="editForm.status" class="app-input max-w-40" :disabled="updatingPostId === post.id">
              <option value="draft">draft</option>
              <option value="ready">ready</option>
              <option value="posted">posted</option>
            </select>

            <div class="flex items-center gap-3">
              <button type="submit" class="app-button-primary" :disabled="updatingPostId === post.id">
                {{ updatingPostId === post.id ? 'Saving...' : 'Save' }}
              </button>
              <button type="button" class="text-xs text-(--color-text-muted)" :disabled="updatingPostId === post.id" @click="cancelEditPost">
                Cancel
              </button>
            </div>
          </form>

          <template v-else>
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs-uppercase text-(--color-text-muted)">{{ post.platform }}</p>
                <h2 class="mt-1 text-lg font-semibold">{{ post.title }}</h2>
              </div>

              <div class="flex items-center gap-3">
                <button type="button" class="text-xs transition text-(--color-text-muted)" @click="beginEditPost(post)">Edit</button>
                <button type="button" class="text-xs transition text-(--color-text-muted)" :disabled="deletingPostId === post.id" @click="removePost(post.id)">{{deletingPostId === post.id ? 'Removing...' : 'Remove'}}</button>
              </div>
            </div>

            <p v-if="post.body" class="text-sm text-(--color-text-muted)">{{ post.body }}</p>

            <div class="flex items-center gap-3">
              <label class="text-sm text-(--color-text-muted)">Status</label>
              <select class="app-input max-w-40" :disabled="updatingPostId === post.id" :value="post.status" @change="handleStatusChange(post, ($event.target as HTMLSelectElement).value as SocialPostRecord['status'])">
                <option value="draft">draft</option>
                <option value="ready">ready</option>
                <option value="posted">posted</option>
              </select>
            </div>
          </template>
        </article>
      </div>
    </section>
  </div>
</template>
