<template>
  <div class="w-[280px] bg-[#0f3a72] text-white h-screen fixed left-0 top-0 flex flex-col">
    <!-- Logo -->
    <div class="p-6 border-b border-white/10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <Settings class="w-6 h-6 text-[#0f3a72]" />
        </div>
        <div>
          <h1 class="font-semibold text-white">Mesa de Servicios</h1>
          <p class="text-xs text-white/60">{{ getRoleName(userRole) }}</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.id">
          <button
            @click="emit('navigate', item.id)"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
              activePage === item.id
                ? 'bg-white/15 text-white font-medium'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Logout -->
    <div class="p-4 border-t border-white/10">
      <button
        @click="emit('logout')"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-all"
      >
        <LogOut class="w-5 h-5" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Home, Plus, Inbox, Settings, LogOut } from 'lucide-vue-next'
import { ROLES, getRoleName as getRoleNameUtil, hasMinRole } from '../../constants/roles'

interface SidebarProps {
  activePage: string
  userRole: number // 1: Usuario, 2: Admin, 3: SuperAdmin, 4: Agente
}

interface SidebarEmits {
  (e: 'navigate', page: string): void
  (e: 'logout'): void
}

const props = defineProps<SidebarProps>()
const emit = defineEmits<SidebarEmits>()

const menuItems = computed(() => {
  const userRole = props.userRole
  console.log('📊 [Sidebar] ROL RECIBIDO COMO PROP:', userRole, '(tipo:', typeof userRole, ')')
  console.log('📊 [Sidebar] Props completos:', JSON.stringify(props))
  const baseItems = [
    { id: 'my-requests', label: 'Mis Solicitudes', icon: Home, minRole: ROLES.USUARIO },
    { id: 'new-request', label: 'Nueva Solicitud', icon: Plus, minRole: ROLES.USUARIO },
  ]

  const agentItems = [
    { id: 'area-inbox', label: 'Bandeja de Área', icon: Inbox, minRole: ROLES.AGENTE },
  ]

  const adminItems = [
    { id: 'administration', label: 'Administración', icon: Settings, minRole: ROLES.ADMIN },
  ]

  return [...baseItems, ...agentItems, ...adminItems].filter(item => 
    hasMinRole(userRole, item.minRole)
  )
})

const getRoleName = getRoleNameUtil
</script>
