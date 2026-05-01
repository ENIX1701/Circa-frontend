import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SocialPostCard from '@/components/socials/SocialPostCard.vue'
import SocialPostForm from '@/components/socials/SocialPostForm.vue'
import { socialPostFactory } from '@/test/factories'

describe('social components', () => {
  it('creates posts with optional body and resets create fields', async () => {
    const wrapper = mount(SocialPostForm)

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('create')).toBeUndefined()
    expect(wrapper.find('label[for="social-platform"]').text()).toContain('*')
    expect(wrapper.find('label[for="social-title"]').text()).toContain('*')
    expect(wrapper.text()).toContain('Title is required')

    await wrapper.findAll('input')[0]!.setValue('  LinkedIn  ')
    await wrapper.findAll('input')[1]!.setValue('  Launch teaser  ')
    await wrapper.find('textarea').setValue('  Doors open soon  ')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('create')).toEqual([
      [{ platform: 'LinkedIn', title: 'Launch teaser', body: 'Doors open soon' }],
    ])
    expect((wrapper.findAll('input')[1]!.element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
  })

  it('edits posts with status and emits cancel', async () => {
    const post = socialPostFactory({ platform: 'Mastodon', status: 'ready' })
    const wrapper = mount(SocialPostForm, {
      props: { post },
    })

    expect(wrapper.text()).toContain('Status')
    await wrapper.findAll('input')[1]!.setValue('Updated title')
    await wrapper.find('select').setValue('posted')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Cancel')
      ?.trigger('click')

    expect(wrapper.emitted('update')).toEqual([
      [
        {
          platform: 'Mastodon',
          title: 'Updated title',
          body: 'Doors open soon',
          status: 'posted',
        },
      ],
    ])
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('renders post cards and emits card actions', async () => {
    const post = socialPostFactory({ status: 'ready' })
    const wrapper = mount(SocialPostCard, {
      props: { post, updating: false, deleting: false },
    })

    await wrapper.find('select').setValue('posted')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Edit')
      ?.trigger('click')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Remove')
      ?.trigger('click')

    expect(wrapper.text()).toContain('Launch teaser')
    expect(wrapper.emitted('statusChange')).toEqual([[post, 'posted']])
    expect(wrapper.emitted('edit')).toEqual([[post]])
    expect(wrapper.emitted('remove')).toEqual([['post-1']])
  })
})
