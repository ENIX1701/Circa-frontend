import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EventCard from '@/components/events/EventCard.vue'
import EventCreateForm from '@/components/events/EventCreateForm.vue'
import EventLifecyclePanel from '@/components/event-detail/EventLifecyclePanel.vue'
import EventMetadataPanel from '@/components/event-detail/EventMetadataPanel.vue'
import { eventFactory } from '@/test/factories'

function emittedPayload(wrapper: ReturnType<typeof mount>, eventName: string) {
  return wrapper.emitted(eventName)?.[0]?.[0] as Record<string, unknown>
}

describe('event components', () => {
  it('auto-generates slugs, validates required fields, emits trimmed create payloads, and resets', async () => {
    const wrapper = mount(EventCreateForm)

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Slug is required')
    expect(wrapper.text()).toContain('End time is required')

    await wrapper.find('#event-name').setValue('  Spring Summit 2026!  ')
    expect((wrapper.find('#event-slug').element as HTMLInputElement).value).toBe(
      'spring-summit-2026',
    )

    await wrapper.find('#event-name').setValue('  Launch Party -  ')
    expect((wrapper.find('#event-slug').element as HTMLInputElement).value).toBe('launch-party')

    await wrapper.find('#event-slug').setValue('Manual Slug!!!')
    expect((wrapper.find('#event-slug').element as HTMLInputElement).value).toBe('manual-slug')

    await wrapper.find('#event-description').setValue('  Planning weekend  ')
    await wrapper.find('#event-venue').setValue('  Expo Hall  ')
    await wrapper.find('#event-timezone').setValue('  Europe/Warsaw  ')
    await wrapper.find('#event-starts-at').setValue('2026-05-15T09:00')
    await wrapper.find('#event-ends-at').setValue('2026-05-15T10:30')
    await wrapper.find('form').trigger('submit.prevent')

    const payload = emittedPayload(wrapper, 'create')
    expect(payload).toMatchObject({
      name: 'Launch Party -',
      slug: 'manual-slug',
      description: 'Planning weekend',
      venue: 'Expo Hall',
      timezone: 'Europe/Warsaw',
    })
    expect(payload.starts_at).toMatch(/^2026-05-15T09:00:00[+-]\d{2}:\d{2}$/)
    expect((wrapper.find('#event-name').element as HTMLInputElement).value).toBe('')
    expect(wrapper.text()).not.toContain('Slug is required')
  })

  it('clears pending slug checks when the slug becomes invalid', async () => {
    vi.useFakeTimers()
    const checkSlugAvailability = vi.fn().mockResolvedValue(true)
    const wrapper = mount(EventCreateForm, {
      props: { checkSlugAvailability },
    })

    await wrapper.find('#event-slug').setValue('spring-summit')
    expect(wrapper.text()).toContain('Checking slug...')

    await wrapper.find('#event-slug').setValue('')
    await vi.runAllTimersAsync()

    expect(checkSlugAvailability).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain('Checking slug...')
    vi.useRealTimers()
  })

  it('renders event cards and emits the selected event slug', async () => {
    const wrapper = mount(EventCard, {
      props: { event: eventFactory({ status: 'pending_destruction', description: '' }) },
    })

    expect(wrapper.text()).toContain('No description yet')
    expect(wrapper.text()).toContain('Pending destruction')

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('open')).toEqual([['spring-summit']])
  })

  it('shows lifecycle actions only when the owner can use them', async () => {
    const active = mount(EventLifecyclePanel, {
      props: { event: eventFactory({ status: 'active', current_user_role: 'owner' }) },
    })

    expect(active.find('[data-testid="close-event"]').exists()).toBe(true)
    expect(active.find('[data-testid="activate-event"]').exists()).toBe(false)

    await active.find('[data-testid="close-event"]').trigger('click')
    await active
      .findAll('button')
      .find((button) => button.text().includes('Export'))
      ?.trigger('click')

    expect(active.emitted('close')).toHaveLength(1)
    expect(active.emitted('export')).toHaveLength(1)

    const archived = mount(EventLifecyclePanel, {
      props: { event: eventFactory({ status: 'archived', current_user_role: 'owner' }) },
    })
    expect(archived.text()).toContain('This event is archived')
    expect(archived.text()).toContain('No lifecycle action is currently available')
  })

  it('renders metadata rows including optional destruction timestamp', () => {
    const wrapper = mount(EventMetadataPanel, {
      props: {
        event: eventFactory({
          status: 'closed',
          destruction_requested_at: '2026-05-17T12:00:00Z',
        }),
      },
    })

    expect(wrapper.text()).toContain('Closed')
    expect(wrapper.text()).toContain('spring-summit')
    expect(wrapper.text()).toContain('Your role')
    expect(wrapper.text()).toContain('Destruction requested')
  })
})
