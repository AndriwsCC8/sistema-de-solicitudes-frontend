<template>
  <div v-if="!isLoggedIn">
    <Login @login="handleLogin" />
  </div>
  
  <div v-else class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar 
      :active-page="activePage" 
      :user-role="userRole"
      @navigate="handleNavigate" 
      @logout="handleLogout" 
    />

    <!-- Main Content -->
    <div class="ml-[280px] p-8">
      <div class="max-w-[1440px] mx-auto">
        <component :is="currentComponent" v-bind="currentProps" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Login from './components/Login.vue'
import Sidebar from './components/Sidebar.vue'
import MyRequests from './components/MyRequests.vue'
import NewRequest from './components/NewRequest.vue'
import AreaInbox from './components/AreaInbox.vue'
import RequestDetail from './components/RequestDetail.vue'
import Administration from './components/Administration.vue'

const isLoggedIn = ref(false)
const userRole = ref('')
const activePage = ref('my-requests')
const selectedRequestId = ref<string | undefined>(undefined)

const handleLogin = (role: string) => {
  userRole.value = role
  isLoggedIn.value = true
}

const handleLogout = () => {
  isLoggedIn.value = false
  userRole.value = ''
  activePage.value = 'my-requests'
}

const handleNavigate = (page: string, requestId?: string) => {
  activePage.value = page
  selectedRequestId.value = requestId
}

const currentComponent = computed(() => {
  switch (activePage.value) {
    case 'my-requests':
      return MyRequests
    case 'new-request':
      return NewRequest
    case 'area-inbox':
      return AreaInbox
    case 'request-detail':
      return RequestDetail
    case 'administration':
      return Administration
    default:
      return MyRequests
  }
})

const currentProps = computed(() => {
  const baseProps: any = {
    onNavigate: handleNavigate
  }
  
  if (activePage.value === 'request-detail') {
    baseProps.requestId = selectedRequestId.value
  }
  
  if (activePage.value === 'administration') {
    baseProps.userRole = userRole.value
  }
  
  return baseProps
})
</script>
