<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <span class="w-1 h-8 rounded-full bg-[#2952D9] mr-3"></span>
        <div>
          <h1 class="text-3xl font-bold text-[#0F1F4D]">Enforcers</h1>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button @click="openAreas" class="bg-white text-[#2952D9] hover:bg-[#F0F4FB] px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-[0_4px_16px_rgba(15,31,77,0.06)] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          View by area
        </button>
        <button @click="openModal" class="bg-gradient-to-r from-[#1B3262] to-[#2952D9] hover:opacity-90 text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-[0_4px_16px_rgba(41,82,217,0.35)] transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Enforcer
        </button>
      </div>
    </div>

    <div class="relative mb-6">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2952D9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
      <input v-model="search" type="text" placeholder="Search enforcers by name, badge or zone..." class="w-full bg-white text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl pl-10 pr-4 py-3 text-sm shadow-[0_4px_16px_rgba(15,31,77,0.06)] focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
    </div>

    <div v-if="loading" class="text-center text-[#9AA6C0] text-sm py-10">Loading...</div>
    <div v-else-if="!filtered.length" class="text-center text-[#9AA6C0] text-sm py-10">No enforcers found</div>

    <template v-else>
      <!-- Compact cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div v-for="officer in paginated" :key="officer.id" class="bg-white rounded-xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-3.5">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-full bg-[#EAF0FF] flex items-center justify-center shrink-0 overflow-hidden">
              <img v-if="officer.photo_url" :src="officer.photo_url" :alt="officer.name" class="w-full h-full object-cover" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#2952D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-[#0F1F4D] truncate">{{ officer.name }}</div>
              <div class="text-[11px] text-[#6B7A99]">{{ officer.officer_code }}</div>
            </div>
            <span :class="officer.status === 'Active' ? 'bg-[#1F9D55]' : 'bg-[#9AA6C0]'" class="w-2.5 h-2.5 rounded-full shrink-0" :title="officer.status"></span>
          </div>

          <div class="mt-3 text-xs text-[#6B7A99] truncate" :title="officer.zone">{{ officer.zone || '—' }}</div>

          <div class="mt-2 pt-2 border-t border-[#F0F4FB] flex items-center justify-between">
            <span class="text-[11px] text-[#6B7A99]"><span class="font-semibold text-[#0F1F4D]">{{ officer.violation_count ?? 0 }}</span> violations</span>
            <div class="flex items-center">
              <button @click="openEdit(officer)" title="Edit enforcer" class="p-1 rounded-md text-[#6B7A99] hover:text-[#2952D9] hover:bg-[#EAF0FF] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="askDelete(officer)" title="Delete enforcer" class="p-1 rounded-md text-[#6B7A99] hover:text-[#E5484D] hover:bg-[#FDECEC] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] px-6 py-4">
        <div class="flex items-center gap-3 text-xs text-[#6B7A99]">
          <span>Showing {{ rangeStart }}–{{ rangeEnd }} of {{ filtered.length }}</span>
          <div class="relative">
            <select v-model.number="pageSize" class="appearance-none bg-[#F0F4FB] text-[#0F1F4D] rounded-lg pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2952D9] cursor-pointer">
              <option v-for="n in [12, 24, 48, 96]" :key="n" :value="n">{{ n }} / page</option>
            </select>
            <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7A99]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 8l5 5 5-5" />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="w-9 h-9 rounded-lg text-sm font-semibold text-[#0F1F4D] bg-[#F0F4FB] hover:bg-[#E0E8F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            :disabled="page === 1"
            aria-label="Previous page"
            @click="page--"
          >
            &lt;
          </button>

          <template v-for="(p, i) in pageNumbers" :key="i">
            <span v-if="p === '...'" class="w-9 h-9 flex items-center justify-center text-[#9AA6C0]">…</span>
            <button
              v-else
              type="button"
              class="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
              :class="p === page ? 'bg-[#2952D9] text-white' : 'text-[#3B4A6B] hover:bg-[#F0F4FB]'"
              @click="page = p as number"
            >
              {{ p }}
            </button>
          </template>

          <button
            type="button"
            class="w-9 h-9 rounded-lg text-sm font-semibold text-[#0F1F4D] bg-[#F0F4FB] hover:bg-[#E0E8F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            :disabled="page === totalPages"
            aria-label="Next page"
            @click="page++"
          >
            &gt;
          </button>
        </div>
      </div>
    </template>

    <!-- Add / Edit modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-[#0B1A3B]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showModal = false"
      >
        <div class="bg-white rounded-3xl shadow-[0_8px_32px_rgba(11,26,59,0.35)] w-full max-w-md overflow-visible">
          <div class="bg-gradient-to-br from-[#0B1A3B] via-[#1B3262] to-[#2952D9] text-white px-6 py-5 rounded-t-3xl flex items-center justify-between">
            <h2 class="text-xl font-bold">{{ editingId ? 'Edit Enforcer' : 'Add Enforcer' }}</h2>
            <button @click="showModal = false" class="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          </div>

          <form @submit.prevent="saveOfficer" class="p-6 space-y-4">
            <!-- Modern profile photo upload -->
            <div class="flex flex-col items-center gap-2">
              <div class="relative">
                <button
                  type="button"
                  @click="photoInput?.click()"
                  class="group relative w-24 h-24 rounded-full bg-[#EAF0FF] ring-4 ring-white shadow-[0_4px_16px_rgba(15,31,77,0.15)] overflow-hidden flex items-center justify-center focus:outline-none focus:ring-[#2952D9]/40"
                >
                  <img v-if="photoPreview" :src="photoPreview" alt="Preview" class="w-full h-full object-cover" />
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#2952D9]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="absolute inset-0 bg-[#0B1A3B]/50 text-white text-xs font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ photoPreview ? 'Change' : 'Upload' }}
                  </span>
                </button>

                <button
                  type="button"
                  @click="photoInput?.click()"
                  aria-label="Upload photo"
                  class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#1B3262] to-[#2952D9] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(41,82,217,0.45)] ring-2 ring-white hover:scale-105 transition-transform"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                <input ref="photoInput" type="file" accept="image/*" class="hidden" @change="onPhotoPick" />
              </div>

              <p class="text-xs text-[#6B7A99]">
                Profile photo · optional
                <button v-if="photoPreview" type="button" class="ml-1 font-semibold text-[#E5484D] hover:underline" @click="resetPhoto()">Remove</button>
              </p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Full name</label>
              <input v-model="form.name" type="text" required placeholder="e.g. Juan Dela Cruz" class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Badge ID</label>
              <input v-model="form.badge_id" type="text" required placeholder="e.g. B-001" class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Password</label>
              <input v-model="form.password" type="password" :required="!editingId" minlength="6" :placeholder="editingId ? 'Leave blank to keep current password' : 'At least 6 characters'" class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
            </div>

            <!-- Zone picker (Butuan City only) -->
            <div class="relative">
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Assigned zone <span class="text-[#6B7A99] font-normal">(Butuan City)</span></label>
              <div class="relative">
                <input
                  v-model="zoneQuery"
                  type="text"
                  placeholder="Search road, area or barangay..."
                  class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]"
                  @focus="zoneOpen = true"
                  @blur="zoneOpen = false"
                  @input="form.zone = ''"
                />
                <button
                  v-if="zoneQuery"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A99] hover:text-[#E5484D] text-lg leading-none"
                  @mousedown.prevent="clearZone"
                >
                  &times;
                </button>
              </div>

              <div
                v-if="zoneOpen"
                class="absolute z-10 left-0 right-0 mt-2 max-h-56 overflow-y-auto bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,31,77,0.18)] border border-[#E8EDF7]"
              >
                <div v-if="!groupedZones.length" class="px-4 py-4 text-sm text-[#9AA6C0] text-center">No match in Butuan City</div>
                <div v-for="group in groupedZones" :key="group.province">
                  <div class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#6B7A99] bg-[#F7F9FD] sticky top-0">{{ group.province }}</div>
                  <button
                    v-for="z in group.items"
                    :key="z.label"
                    type="button"
                    class="w-full text-left px-4 py-2.5 text-sm text-[#0F1F4D] hover:bg-[#EAF0FF] transition-colors"
                    :class="form.zone === z.label ? 'bg-[#EAF0FF] font-semibold text-[#2952D9]' : ''"
                    @mousedown.prevent="pickZone(z.label)"
                  >
                    {{ z.name }}
                  </button>
                </div>
              </div>
            </div>

            <label class="flex items-center gap-2 text-sm text-[#3B4A6B]">
              <input v-model="form.is_active" type="checkbox" class="rounded border-[#C9D3EA] text-[#2952D9]" />
              Active enforcer
            </label>

            <p v-if="formError" class="text-sm text-[#E5484D] bg-[#FDECEC] rounded-xl px-4 py-2">{{ formError }}</p>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showModal = false" class="bg-[#F0F4FB] text-[#3B4A6B] rounded-xl px-5 py-3 text-sm font-semibold hover:bg-[#E3EAFF] transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="saving" class="bg-gradient-to-r from-[#1B3262] to-[#2952D9] text-white rounded-xl px-5 py-3 text-sm font-semibold shadow-[0_4px_16px_rgba(41,82,217,0.35)] hover:opacity-90 disabled:opacity-50 transition">
                {{ saving ? 'Saving...' : editingId ? 'Save changes' : 'Add enforcer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- View by area modal -->
      <div
        v-if="showAreaModal"
        class="fixed inset-0 bg-[#0B1A3B]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showAreaModal = false"
      >
        <div class="bg-white rounded-3xl shadow-[0_8px_32px_rgba(11,26,59,0.35)] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <div class="bg-gradient-to-br from-[#0B1A3B] via-[#1B3262] to-[#2952D9] text-white px-6 py-5 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold">Enforcers by area</h2>
              <p class="text-sm text-white/60 mt-0.5">See who is assigned to a specific area</p>
            </div>
            <button @click="showAreaModal = false" class="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          </div>

          <div class="p-6 overflow-y-auto space-y-5">
            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Select area</label>
              <div class="relative">
                <select
                  v-model="areaSelected"
                  class="appearance-none w-full bg-[#F0F4FB] text-[#0F1F4D] rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9] cursor-pointer"
                >
                  <option value="">Choose an area...</option>
                  <optgroup v-for="g in areaGroups" :key="g.group" :label="g.group">
                    <option v-for="a in g.items" :key="a.label" :value="a.label">{{ a.name }} ({{ a.count }})</option>
                  </optgroup>
                </select>
                <svg class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A99]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 8l5 5 5-5" />
                </svg>
              </div>
            </div>

            <!-- Result for the selected area -->
            <template v-if="areaSelected">
              <div class="flex items-center justify-between bg-[#EAF0FF] rounded-2xl px-5 py-4">
                <div>
                  <div class="text-xs text-[#6B7A99]">Assigned to</div>
                  <div class="text-sm font-semibold text-[#0F1F4D]">{{ areaSelected }}</div>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold text-[#2952D9] leading-none">{{ areaOfficers.length }}</div>
                  <div class="text-xs text-[#6B7A99] mt-1">{{ areaActiveCount }} active</div>
                </div>
              </div>

              <div v-if="!areaOfficers.length" class="text-center text-sm text-[#9AA6C0] py-6">
                No enforcer is assigned to this area yet
              </div>
              <div v-else class="space-y-3">
                <div v-for="o in areaOfficers" :key="o.id" class="flex items-center justify-between gap-3 bg-[#F0F4FB] rounded-2xl px-4 py-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden">
                      <img v-if="o.photo_url" :src="o.photo_url" :alt="o.name" class="w-full h-full object-cover" />
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#2952D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <div class="text-sm font-semibold text-[#0F1F4D] truncate">{{ o.name }}</div>
                      <div class="text-xs text-[#6B7A99]">{{ o.officer_code }} · {{ o.violation_count ?? 0 }} violations</div>
                    </div>
                  </div>
                  <span :class="o.status === 'Active' ? 'bg-[#DCF5E4] text-[#1F9D55]' : 'bg-white text-[#6B7A99]'" class="px-3 py-1 rounded-full text-xs font-semibold shrink-0">
                    {{ o.status }}
                  </span>
                </div>
              </div>
            </template>

            <!-- Nothing selected: quick overview of staffed areas -->
            <template v-else>
              <div v-if="!assignedAreas.length" class="text-center text-sm text-[#9AA6C0] py-6">
                No enforcers have been assigned to an area yet
              </div>
              <div v-else>
                <div class="text-xs font-semibold uppercase tracking-wider text-[#6B7A99] mb-3">Areas with enforcers</div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="a in assignedAreas"
                    :key="a.label"
                    type="button"
                    class="flex items-center gap-2 bg-[#F0F4FB] hover:bg-[#E0E8F8] text-[#0F1F4D] rounded-xl pl-3 pr-2 py-1.5 text-xs font-medium transition-colors"
                    @click="areaSelected = a.label"
                  >
                    {{ a.name }}
                    <span class="bg-[#2952D9] text-white rounded-lg px-2 py-0.5 text-[10px] font-semibold">{{ a.count }}</span>
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Delete modal -->
      <div
        v-if="deleteTarget"
        class="fixed inset-0 bg-[#0B1A3B]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeDelete"
      >
        <div class="bg-white rounded-3xl shadow-[0_8px_32px_rgba(11,26,59,0.35)] w-full max-w-sm p-6">
          <h2 class="text-xl font-bold text-[#0F1F4D] mb-2">Delete enforcer?</h2>
          <p class="text-sm text-[#3B4A6B]">
            You are about to delete
            <span class="font-semibold">{{ deleteTarget.name }}</span>
            ({{ deleteTarget.officer_code }}). This cannot be undone.
          </p>

          <p v-if="deleteError" class="text-sm text-[#E5484D] bg-[#FDECEC] rounded-xl px-4 py-2 mt-3">{{ deleteError }}</p>

          <div class="flex justify-end gap-3 pt-5">
            <button @click="closeDelete" class="bg-[#F0F4FB] text-[#3B4A6B] rounded-xl px-5 py-3 text-sm font-semibold hover:bg-[#E3EAFF] transition-colors">
              Cancel
            </button>
            <button @click="removeOfficer" :disabled="deleting" class="bg-[#E5484D] hover:opacity-90 text-white rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-50 transition">
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const search = ref('')
const officers = ref<any[]>([])
const loading = ref(true)

// Pagination
const page = ref(1)
const pageSize = ref(12)

const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  badge_id: '',
  password: '',
  zone: '',
  is_active: true,
})

const deleteTarget = ref<any>(null)
const deleting = ref(false)
const deleteError = ref('')

// ---- Profile picture ----
const photoFile = ref<File | null>(null)
const photoPreview = ref('')
const photoInput = ref<HTMLInputElement | null>(null)

function onPhotoPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    formError.value = 'Image must be under 5 MB.'
    return
  }
  formError.value = ''
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

function resetPhoto(existingUrl = '') {
  photoFile.value = null
  photoPreview.value = existingUrl
  if (photoInput.value) photoInput.value.value = ''
}

// ---- Butuan City: city center & main roads only ----
const ZONE_GROUPS: Record<string, string[]> = {
  'Main Roads': [
    'J.C. Aquino Avenue',
    'Montilla Boulevard',
    'Langihan Road',
    'Butuan–Cagayan de Oro Road (Baan)',
    'Ampayon Highway',
    'Maharlika Highway (Butuan)',
  ],
  'City Center': [
    'Butuan City Hall Area',
    'Robinsons Place Butuan Area',
    'Gaisano Mall Butuan Area',
    'Butuan Public Market Area',
    'Butuan Port / Nasipit Road Area',
  ],
  'Urban Barangays': [
    'Agao', 'Agusan Pequeño', 'Baan Km. 3', 'Bading', 'Bancasi', 'De Oro', 'Diego Silang',
    'Doongan', 'Dumalagan', 'Golden Ribbon', 'Holy Redeemer', 'Humabon', 'Imadejas',
    'Lapu-lapu', 'Libertad', 'Limaha', 'Obrero', 'Ong Yiu', 'Rajah Soliman', 'Sikatuna',
    'Tandang Sora', 'Urduja',
  ],
}

const ZONES = Object.entries(ZONE_GROUPS).flatMap(([group, names]) =>
  names.map((name) => ({
    name,
    province: group,
    label: `${name}, Butuan City`,
  }))
)

const zoneQuery = ref('')
const zoneOpen = ref(false)

const groupedZones = computed(() => {
  const q = zoneQuery.value.trim().toLowerCase()
  const matches = q ? ZONES.filter((z) => z.label.toLowerCase().includes(q)) : ZONES
  const groups: { province: string; items: typeof ZONES }[] = []
  for (const z of matches) {
    let g = groups.find((x) => x.province === z.province)
    if (!g) groups.push((g = { province: z.province, items: [] }))
    g.items.push(z)
  }
  return groups
})

function pickZone(label: string) {
  form.zone = label
  zoneQuery.value = label
  zoneOpen.value = false
}

function clearZone() {
  form.zone = ''
  zoneQuery.value = ''
}

// ---- CRUD ----
async function loadOfficers() {
  try {
    officers.value = await $fetch<any[]>('/api/officers')
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

onMounted(loadOfficers)

function openModal() {
  editingId.value = null
  form.name = ''
  form.badge_id = ''
  form.password = ''
  form.is_active = true
  clearZone()
  resetPhoto()
  formError.value = ''
  showModal.value = true
}

function openEdit(officer: any) {
  editingId.value = officer.id
  form.name = officer.name
  form.badge_id = officer.officer_code
  form.password = ''
  form.is_active = officer.status === 'Active'
  const z = officer.zone && officer.zone !== '—' ? officer.zone : ''
  form.zone = z
  zoneQuery.value = z
  resetPhoto(officer.photo_url ?? '')
  formError.value = ''
  showModal.value = true
}

async function saveOfficer() {
  formError.value = ''

  if (!form.zone || !ZONES.some((z) => z.label === form.zone)) {
    formError.value = 'Pick an assigned zone from the Butuan City list.'
    return
  }

  saving.value = true
  try {
    let saved: any
    if (editingId.value) {
      saved = await $fetch(`/api/officers/${editingId.value}`, { method: 'PUT', body: { ...form } })
    } else {
      saved = await $fetch('/api/officers', { method: 'POST', body: { ...form } })
    }

    if (photoFile.value) {
      try {
        const fd = new FormData()
        fd.append('photo', photoFile.value)
        await $fetch(`/api/officers/${saved.id}/photo`, { method: 'POST', body: fd })
      } catch (error: any) {
        // The enforcer itself was saved; only the picture failed
        await loadOfficers()
        formError.value = error?.data?.statusMessage || 'Enforcer saved, but the picture failed to upload.'
        saving.value = false
        return
      }
    }

    showModal.value = false
    await loadOfficers()
  } catch (error: any) {
    formError.value = error?.data?.statusMessage || 'Failed to save enforcer.'
  }
  saving.value = false
}

function askDelete(officer: any) {
  deleteError.value = ''
  deleteTarget.value = officer
}

function closeDelete() {
  deleteTarget.value = null
  deleteError.value = ''
}

async function removeOfficer() {
  if (!deleteTarget.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/officers/${deleteTarget.value.id}`, { method: 'DELETE' })
    closeDelete()
    await loadOfficers()
  } catch (error: any) {
    deleteError.value = error?.data?.statusMessage || 'Failed to delete enforcer.'
  }
  deleting.value = false
}

// ---- Search + pagination ----
const filtered = computed(() => {
  const s = search.value.toLowerCase()
  return officers.value.filter(
    (o) =>
      o.name.toLowerCase().includes(s) ||
      o.officer_code.toLowerCase().includes(s) ||
      (o.zone ?? '').toLowerCase().includes(s)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const rangeStart = computed(() => (filtered.value.length ? (page.value - 1) * pageSize.value + 1 : 0))
const rangeEnd = computed(() => Math.min(page.value * pageSize.value, filtered.value.length))

// Page buttons with ellipsis: 1 ... 4 5 6 ... 20
const pageNumbers = computed<(number | string)[]>(() => {
  const t = totalPages.value
  const c = page.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)

  const nums = [...new Set([1, t, c - 1, c, c + 1])]
    .filter((n) => n >= 1 && n <= t)
    .sort((a, b) => a - b)

  const result: (number | string)[] = []
  let prev = 0
  for (const n of nums) {
    if (prev && n - prev > 1) result.push('...')
    result.push(n)
    prev = n
  }
  return result
})

// Back to page 1 when the search or page size changes
watch([search, pageSize], () => {
  page.value = 1
})

// Keep the page valid if the list shrinks (e.g. after deleting an enforcer)
watch(totalPages, (t) => {
  if (page.value > t) page.value = t
})

// ---- View by area ----
const showAreaModal = ref(false)
const areaSelected = ref('')

// zone label -> officers assigned there
const officersByZone = computed(() => {
  const map = new Map<string, any[]>()
  for (const o of officers.value) {
    const z = o.zone && o.zone !== '—' ? o.zone : ''
    if (!z) continue
    const list = map.get(z)
    if (list) list.push(o)
    else map.set(z, [o])
  }
  return map
})

// Dropdown options: every known zone with its enforcer count
// (plus an "Other" group for any saved zone that isn't in the list above)
const areaGroups = computed(() => {
  const groups = Object.entries(ZONE_GROUPS).map(([group, names]) => ({
    group,
    items: names.map((name) => {
      const label = `${name}, Butuan City`
      return { label, name, count: officersByZone.value.get(label)?.length ?? 0 }
    }),
  }))

  const known = new Set(ZONES.map((z) => z.label))
  const others = [...officersByZone.value.entries()]
    .filter(([label]) => !known.has(label))
    .map(([label, list]) => ({ label, name: label, count: list.length }))
  if (others.length) groups.push({ group: 'Other', items: others })

  return groups
})

// Quick overview chips: areas that have at least one enforcer, busiest first
const assignedAreas = computed(() =>
  areaGroups.value
    .flatMap((g) => g.items)
    .filter((a) => a.count > 0)
    .sort((a, b) => b.count - a.count)
)

const areaOfficers = computed(() => officersByZone.value.get(areaSelected.value) ?? [])
const areaActiveCount = computed(() => areaOfficers.value.filter((o) => o.status === 'Active').length)

function openAreas() {
  areaSelected.value = ''
  showAreaModal.value = true
}
</script>