import { createRandom, pick } from './simulate';
import type { Member, MemberPlan } from '@/schemas/member.schema';

const FIRST = [
  'Alice','Bruno','Cara','Dmitri','Eve','Felix','Gia','Hugo','Iris','Jonas',
  'Kira','Liam','Maya','Noor','Otto','Pia','Rafa','Sofia','Theo','Uma',
] as const;
const LAST = [
  'Adeyemi','Blum','Costa','Duarte','Engel','Fontaine','Garcia','Hoffman','Iqbal','Jansen',
  'Keller','Larsen','Mensah','Nakamura','Owens','Petrov','Reyes','Schmidt','Torres','Vogel',
] as const;
const PLANS: readonly MemberPlan[] = ['Trial', 'Monthly', 'Annual', 'Founder'];
const STUDIOS = ['Downtown', 'Riverside', 'Northgate', 'Harbour'] as const;

function buildMembers(): Member[] {
  const random = createRandom(775533);
  return Array.from({ length: 214 }, (_, index) => {
    const first = pick(random, FIRST);
    const last = pick(random, LAST);
    const joined = new Date(2021, Math.floor(random() * 12), 1 + Math.floor(random() * 27));
    return {
      id: `mem-${String(index + 1).padStart(4, '0')}`,
      fullName: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${index}@example.com`,
      plan: pick(random, PLANS),
      joinedAt: joined.toISOString(),
      visitsThisMonth: Math.floor(random() * 24),
      isActive: random() > 0.22,
      homeStudio: pick(random, STUDIOS),
    } satisfies Member;
  });
}

const MEMBERS = buildMembers();

export function getAllMembers(): Member[] {
  return MEMBERS;
}
