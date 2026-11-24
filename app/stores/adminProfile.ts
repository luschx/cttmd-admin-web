import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth'

const getBase = () => (useRuntimeConfig().public.apiBase as string).replace(/\/$/, '')
const getHeaders = () => {
  const auth: any = useAuthStore()
  return { Authorization: `Token ${auth.token}` }
}

export const useAdminProfileStore = defineStore('adminProfile', {
  state: () => ({
    fullName: '',
    username: '',
    office: '',
    position: '',
    address: '',
    bio: '',
    photoUrl: null as string | null,
    loaded: false,
  }),
  getters: {
    displayName: (s) => s.fullName || s.username || 'admin',
    initial(): string {
      return this.displayName.charAt(0).toUpperCase()
    },
  },
  actions: {
    apply(d: any) {
      this.fullName = d.full_name
      this.username = d.username
      this.office = d.office
      this.position = d.position
      this.address = d.address
      this.bio = d.bio
      this.photoUrl = d.photo_url
      this.loaded = true
    },
    async fetch() {
      this.apply(await $fetch(`${getBase()}/api/admin/profile/`, { headers: getHeaders() }))
    },
    async save(p: Record<string, string>) {
      this.apply(await $fetch(`${getBase()}/api/admin/profile/`, {
        method: 'PATCH', headers: getHeaders(), body: p,
      }))
    },
    async uploadPhoto(file: File) {
      const fd = new FormData()
      fd.append('photo', file)
      this.apply(await $fetch(`${getBase()}/api/admin/profile/photo/`, {
        method: 'POST', headers: getHeaders(), body: fd,
      }))
    },
    async removePhoto() {
      this.apply(await $fetch(`${getBase()}/api/admin/profile/photo/`, {
        method: 'DELETE', headers: getHeaders(),
      }))
    },
  },
})