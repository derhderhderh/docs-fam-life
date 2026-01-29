export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  interval: 'month' | 'year'
  trialDays: number
  maxMembers: number
}

// LifeDocs Family subscription plans
// All plans include a 7-day free trial
export const PRODUCTS: Product[] = [
  {
    id: 'basic-monthly',
    name: 'Basic Plan',
    description: 'Perfect for small families - up to 4 members',
    priceInCents: 799, // $7.99
    interval: 'month',
    trialDays: 7,
    maxMembers: 4,
  },
  {
    id: 'extended-monthly',
    name: 'Extended Plan',
    description: 'For larger families - unlimited members',
    priceInCents: 999, // $9.99
    interval: 'month',
    trialDays: 7,
    maxMembers: 999,
  },
]

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id)
}
