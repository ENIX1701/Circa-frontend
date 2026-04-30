import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SocialsDashboard from '@/views/SocialsDashboard.vue'
import SocialPostCard from '@/components/socials/SocialPostCard.vue'
import SocialPostForm from '@/components/socials/SocialPostForm.vue'
import { socialPostFactory } from '@/test/factories'

const routeMock: { params: Record<string, string | undefined> } = {
  params: { id: 'evt-1' },
}

const listSocialPostsMock = vi.fn()
const createSocialPostMock = vi.fn()
const updateSocialPostMock = vi.fn()
const deleteSocialPostMock = vi.fn()
const pushToastMock = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('@/composables/useEvents', () => ({
  useEvents: () => ({
    listSocialPosts: listSocialPostsMock,
    createSocialPost: createSocialPostMock,
    updateSocialPost: updateSocialPostMock,
    deleteSocialPost: deleteSocialPostMock,
  }),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    pushToast: pushToastMock,
  }),
}))

const post = socialPostFactory()

describe('SocialsDashboard.vue', () => {
  beforeEach(() => {
    routeMock.params = { id: 'evt-1' }
    listSocialPostsMock.mockReset().mockResolvedValue([post])
    createSocialPostMock.mockReset()
    updateSocialPostMock.mockReset()
    deleteSocialPostMock.mockReset()
    pushToastMock.mockReset()
  })

  it('loads social posts on mount', async () => {
    const wrapper = mount(SocialsDashboard)
    await flushPromises()

    expect(listSocialPostsMock).toHaveBeenCalledWith('evt-1')
    expect(wrapper.text()).toContain('Launch teaser')
  })

  it('creates, edits, status-updates, and removes social posts', async () => {
    const created = socialPostFactory({ id: 'post-2', title: 'Second post', position: 0 })
    const updated = socialPostFactory({ id: 'post-2', title: 'Updated post', position: 0 })
    createSocialPostMock.mockResolvedValueOnce(created)
    updateSocialPostMock.mockResolvedValue(updated)
    deleteSocialPostMock.mockResolvedValueOnce(undefined)

    const wrapper = mount(SocialsDashboard)
    await flushPromises()

    wrapper.findComponent(SocialPostForm).vm.$emit('create', {
      platform: 'LinkedIn',
      title: 'Second post',
    })
    await flushPromises()
    expect(createSocialPostMock).toHaveBeenCalledWith('evt-1', {
      platform: 'LinkedIn',
      title: 'Second post',
    })
    expect(pushToastMock).toHaveBeenCalledWith({
      tone: 'success',
      title: 'Post created',
      description: 'Second post was added to the draft queue',
    })
    expect(wrapper.text()).toContain('Second post')

    const createdCard = wrapper
      .findAllComponents(SocialPostCard)
      .find((card) => card.text().includes('Second post'))
    createdCard?.vm.$emit('edit', created)
    await flushPromises()
    expect(wrapper.text()).toContain('Edit post')

    wrapper.findComponent(SocialPostForm).vm.$emit('update', {
      platform: 'LinkedIn',
      title: 'Updated post',
      body: '',
      status: 'ready',
    })
    await flushPromises()
    expect(updateSocialPostMock).toHaveBeenCalledWith('evt-1', 'post-2', {
      platform: 'LinkedIn',
      title: 'Updated post',
      body: '',
      status: 'ready',
    })
    expect(wrapper.text()).toContain('Updated post')

    wrapper.findComponent(SocialPostCard).vm.$emit('statusChange', post, 'posted')
    await flushPromises()
    expect(updateSocialPostMock).toHaveBeenLastCalledWith('evt-1', 'post-1', { status: 'posted' })

    wrapper.findComponent(SocialPostCard).vm.$emit('remove', 'post-1')
    await flushPromises()
    expect(deleteSocialPostMock).toHaveBeenCalledWith('evt-1', 'post-1')
    expect(pushToastMock).toHaveBeenCalledWith({
      tone: 'success',
      title: 'Post removed',
      description: 'Launch teaser was removed from the draft queue',
    })
    expect(wrapper.text()).not.toContain('Launch teaser')
  })

  it('shows load and mutation errors', async () => {
    listSocialPostsMock.mockRejectedValueOnce(new Error('Cannot load posts'))

    const wrapper = mount(SocialsDashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('Cannot load posts')

    createSocialPostMock.mockRejectedValueOnce(new Error('Cannot create post'))
    wrapper.findComponent(SocialPostForm).vm.$emit('create', {
      platform: 'Instagram',
      title: 'Broken',
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Cannot create post')
  })
})
