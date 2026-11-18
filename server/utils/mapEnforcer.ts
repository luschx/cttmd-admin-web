export function mapEnforcer(e: any) {
  return {
    id: e.id,
    name: e.full_name ?? '',
    officer_code: e.badge_id ?? '',
    phone_number: e.contact_number ?? '',
    status: e.is_on_duty ? 'Active' : 'Inactive',
    zone: e.assigned_area || '',
    photo_url: e.photo_data_url ?? e.profile_photo_url ?? null,
  }
}