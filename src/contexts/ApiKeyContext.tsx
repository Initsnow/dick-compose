import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
// 1. 从插件中额外导入 Store 类型
import { load, type Store } from '@tauri-apps/plugin-store';
import { pyInvoke } from 'tauri-plugin-pytauri-api';


interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => Promise<void>;
  isReady: boolean;
}

export const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKeyInternal] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  // 2. 创建一个 state 来保存 store 实例
  const [store, setStore] = useState<Store | null>(null);

  // 在组件挂载时，初始化 store 并加载 API key
  useEffect(() => {
    const initialize = async () => {
      try {
        // 3. 先加载 store，并将其保存到 state 中
        const loadedStore = await load('settings.json');
        setStore(loadedStore);

        // 然后从加载好的 store 中读取 key
        const storedKey = await loadedStore.get<string>('llm_api_key');
        if (storedKey) {
          setApiKeyInternal(storedKey);
          await pyInvoke("set_api_key", { key: storedKey });
        }
      } catch (error) {
        console.error("Failed to initialize store or load API key", error);
      } finally {
        setIsReady(true);
      }
    };

    initialize();
  }, []); // 空依赖数组，仅运行一次

  // 更新 setApiKey 函数
  const setApiKey = async (key: string) => {
    setApiKeyInternal(key);
    // 4. 确保 store 已经加载完毕再使用它
    if (store) {
      await store.set('llm_api_key', key);
      await store.save();
      // (可选) 保持同步，当设置新 key 时也通知 Python 后端
      await pyInvoke("set_api_key", { key }); 
    } else {
      console.error("Store has not been initialized yet.");
    }
  };

  const value = { apiKey, setApiKey, isReady };

  return (
    <ApiKeyContext.Provider value={value}>
      {isReady ? children : null /* 或者显示一个加载动画 */}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};