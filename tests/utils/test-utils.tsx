import { ReactElement, ReactNode } from "react"
import { render as rtlRender, RenderOptions } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

/**
 * 테스트용 QueryClient 생성 함수
 * - retry를 비활성화하여 테스트 속도 향상
 * - 짧은 캐시 시간으로 테스트 간 간섭 방지
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * React Query Provider로 감싼 커스텀 render 함수
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient
}

export function renderWithQueryClient(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...renderOptions }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// re-export everything from @testing-library/react except render (중복 방지)
export {
  screen,
  waitFor,
  within,
  fireEvent,
  cleanup,
  act,
  renderHook,
  waitForElementToBeRemoved,
} from "@testing-library/react"

// 기본 render는 renderWithQueryClient로 대체
export { renderWithQueryClient as render }
