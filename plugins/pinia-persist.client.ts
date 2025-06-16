import { createPersistedState } from 'pinia-plugin-persistedstate'
import type { Pinia } from 'pinia'

export default defineNuxtPlugin(({ $pinia }) => {
  ($pinia as Pinia).use(createPersistedState({
    storage: localStorage,
    auto: true
  }))
})
