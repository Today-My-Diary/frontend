import { test as base } from "@playwright/test";

// 네트워크 캐시 비활성화
export const test = base.extend({
  page: async ({ page }, use) => {
    const client = await page.context().newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.setCacheDisabled", { cacheDisabled: true });

    // 아래 use는 React와 무관한 Playwright의 fixture 패턴입니다. (잘못된 린트 오류)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page); // 테스트 실행
  },
});
