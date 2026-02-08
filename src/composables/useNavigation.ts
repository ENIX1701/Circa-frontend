import { Palette, Users, Package2, CalendarRange, MessageCircleDashed } from 'lucide-vue-next'

export const useNavigation = () => {
  const sections = [
    { icon: Palette, title: 'Branding', path: '/branding' },
    { icon: Users, title: 'Staff', path: '/staff' },
    { icon: Package2, title: 'Logistics', path: '/logistics' },
    { icon: CalendarRange, title: 'Planner', path: '/planner' },
    { icon: MessageCircleDashed, title: 'Socials', path: '/socials' },
  ]

  return { sections }
}
