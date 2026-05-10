export type CustomerContact = {
  id: string
  email: string | null
  phone: string | null
}

export const normalizeContact = (value?: string | null) =>
  value?.trim().toLowerCase() ?? ""

export const belongsToCustomerContact = <
  T extends {
    user_id?: string | null
    customer_id?: string | null
    profile_id?: string | null
    receiver_email?: string | null
    receiver_phone?: string | null
  },
>(
  item: T,
  customer: CustomerContact
) => {
  if (item.user_id) return item.user_id === customer.id
  if (item.customer_id) return item.customer_id === customer.id
  if (item.profile_id) return item.profile_id === customer.id

  const email = normalizeContact(customer.email)
  const phone = normalizeContact(customer.phone)
  const itemEmail = normalizeContact(item.receiver_email)
  const itemPhone = normalizeContact(item.receiver_phone)

  if (email && itemEmail) return itemEmail === email
  if (phone && itemPhone) return itemPhone === phone

  return false
}

export const buildCustomerParcelOrFilter = (customer: CustomerContact) => {
  const filters: string[] = []
  const email = normalizeContact(customer.email)
  const phone = customer.phone?.trim()

  if (email) filters.push(`receiver_email.ilike.${email}`)
  if (phone) filters.push(`receiver_phone.eq.${phone}`)

  return filters.join(",")
}
