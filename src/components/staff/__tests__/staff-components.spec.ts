import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TeamMemberCard from '@/components/staff/TeamMemberCard.vue'
import UnassignedWorkList from '@/components/staff/UnassignedWorkList.vue'
import { collaboratorFactory, timelineItemFactory } from '@/test/factories'

describe('staff components', () => {
  it('renders workload counters and assignments for a team member', () => {
    const member = collaboratorFactory()
    const assignment = timelineItemFactory({ status: 'blocked', notes: 'Waiting on vendor' })
    const wrapper = mount(TeamMemberCard, {
      props: {
        member,
        assignments: [assignment],
        done: 0,
        blocked: 1,
        open: 1,
      },
    })

    expect(wrapper.text()).toContain('Ada Lovelace')
    expect(wrapper.text()).toContain('1 blocked')
    expect(wrapper.text()).toContain('Build landing stage')
    expect(wrapper.text()).toContain('Waiting on vendor')
  })

  it('renders an empty assignment state for team members', () => {
    const wrapper = mount(TeamMemberCard, {
      props: {
        member: collaboratorFactory(),
        assignments: [],
        done: 0,
        blocked: 0,
        open: 0,
      },
    })

    expect(wrapper.text()).toContain('No assigned timeline work yet')
  })

  it('renders unassigned work empty and populated states', () => {
    expect(mount(UnassignedWorkList, { props: { items: [] } }).text()).toContain(
      'Everything has an owner',
    )

    const wrapper = mount(UnassignedWorkList, {
      props: {
        items: [timelineItemFactory({ assigned_user_id: '', status: 'in_progress' })],
      },
    })

    expect(wrapper.text()).toContain('Build landing stage')
    expect(wrapper.text()).toContain('in_progress')
  })
})
