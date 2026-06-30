import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCollection = create(
  persist(
    (set, get) => ({
      owned: {},   // { [stickerCode]: true }

      toggle(code) {
        const owned = { ...get().owned }
        if (owned[code]) delete owned[code]
        else owned[code] = true
        set({ owned })
      },

      markMany(codes) {
        const owned = { ...get().owned }
        codes.forEach(c => { owned[c] = true })
        set({ owned })
      },

      reset() {
        set({ owned: {} })
      },

      isOwned(code) {
        return Boolean(get().owned[code])
      },

      count() {
        return Object.keys(get().owned).length
      },
    }),
    { name: 'figuru-collection' }
  )
)

export default useCollection
