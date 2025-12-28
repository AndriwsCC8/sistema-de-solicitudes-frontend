<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar 
      :activePage="currentPage" 
      :userRole="userRole"
      @navigate="handleNavigate"
      @logout="handleLogout"
    />

    <!-- Main Content -->
    <div class="flex-1 ml-[280px]">
      <div class="p-8">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { ROLES } from '../../constants/roles'
// @ts-ignore - Vue 3 script setup components have implicit default export
import Sidebar from '../components/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentPage = ref('my-requests')
// Usar el getter del store para el rol
const userRole = computed(() => {
  const rol = authStore.userRole
  console.log('🎨 [DashboardLayout] userRole computed:', rol)
  console.log('🎨 [DashboardLayout] authStore.user:', JSON.stringify(authStore.user))
  console.log('🎨 [DashboardLayout] authStore.user?.rol directo:', authStore.user?.rol)
  return rol
})

// Actualizar página activa basándose en la ruta
watch(() => route.name, (newRouteName) => {
  if (newRouteName === 'Dashboard') {
    currentPage.value = 'my-requests'
  } else if (newRouteName === 'NewRequest') {
    currentPage.value = 'new-request'
  } else if (newRouteName === 'AreaInbox') {
    currentPage.value = 'area-inbox'
  } else if (newRouteName === 'Administration') {
    currentPage.value = 'administration'
  }
}, { immediate: true })

const handleNavigate = (page: string) => {
  currentPage.value = page
  
  const routeMap: Record<string, string> = {
    'my-requests': '/dashboard',
    'new-request': '/dashboard/new-request',
    'area-inbox': '/dashboard/area-inbox',
    'administration': '/dashboard/administration',
    'request-detail': '/dashboard/request-detail'
  }
  
  const routePath = routeMap[page]
  if (routePath) {
    router.push(routePath)
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
