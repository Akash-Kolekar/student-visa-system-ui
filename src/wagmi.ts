import { http, cookieStorage, createConfig, createStorage } from 'wagmi'
import { anvil } from '@/config/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

// Use a singleton pattern to ensure we only create the config once
let config: ReturnType<typeof createConfig> | undefined = undefined

export function getConfig() {
  if (config) return config
  
  config = createConfig({
    chains: [anvil],
    connectors: [
      injected(),
      coinbaseWallet(),
      walletConnect({ 
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'dummy-project-id' 
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [anvil.id]: http('http://127.0.0.1:8545'),
    },
  })
  
  return config
}