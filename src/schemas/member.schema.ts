export type MemberPlan = 'Trial' | 'Monthly' | 'Annual' | 'Founder';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  plan: MemberPlan;
  joinedAt: string;
  visitsThisMonth: number;
  isActive: boolean;
  homeStudio: string;
}
