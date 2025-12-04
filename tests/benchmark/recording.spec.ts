import { expect } from "@playwright/test";
import { test } from "./fixture";
import { BENCHMARK_CONFIG } from "./config";

declare global {
  interface Performance {
    memory?: { usedJSHeapSize: number };
  }
  interface Window {
    fpsMetrics: { count: number; start: number };
  }
}

interface CDPMetrics {
  metrics: { name: string; value: number }[];
}

const getMetric = (m: CDPMetrics, name: string) =>
  m.metrics.find((x) => x.name === name)?.value ?? 0;

const calculateCpuWork = (m: CDPMetrics) =>
  getMetric(m, "ScriptDuration") +
  getMetric(m, "LayoutDuration") +
  getMetric(m, "RecalcStyleDuration");

test.describe("Recording Benchmark", () => {
  test.use({ storageState: "auth.json" });
  const { API, RECORDING } = BENCHMARK_CONFIG;

  test.beforeEach(async ({ page }) => {
    await page.route(API.QUESTIONS, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ questions: ["질문1", "질문2", "질문3"] }),
      });
    });
    await page.route(API.CHECK_LIMIT, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ todayVideoExists: false }),
      });
    });
  });

  const modes = [
    { type: "dom-overlay", name: "DOM Overlay (Current)" },
    { type: "canvas", name: "Canvas Composition (Control)" },
  ];

  for (const mode of modes) {
    test(`Metrics: ${mode.name}`, async ({ page }) => {
      // 1. 초기 설정 및 모드 주입
      await page.context().grantPermissions(["camera", "microphone"]);
      await page.addInitScript(
        (m) => window.sessionStorage.setItem("benchmark_render_mode", m),
        mode.type,
      );

      await page.goto("/record");
      await page.getByRole("button", { name: "권한 허용하기" }).click();
      await page.getByRole("button", { name: "녹화 시작하기" }).click();
      await expect(page.locator("video")).toBeVisible({ timeout: 10000 });

      // 2. CDP 설정 (CPU 스로틀링 & 성능 측정)
      const client = await page.context().newCDPSession(page);
      await client.send("Emulation.setCPUThrottlingRate", {
        rate: RECORDING.CPU_THROTTLE_RATE,
      });
      await client.send("Performance.enable");

      await page.evaluate(() => {
        window.fpsMetrics = { count: 0, start: performance.now() };
        const loop = () => {
          window.fpsMetrics.count++;
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      });

      // 3. 측정 시작 (Start Snapshot)
      const startTime = Date.now();
      const startMetrics = (await client.send(
        "Performance.getMetrics",
      )) as CDPMetrics;
      const startHeap = await page.evaluate(
        () => performance.memory?.usedJSHeapSize || 0,
      );

      if (mode.type === "canvas") {
        await expect(page.locator("canvas")).toBeVisible();
      } else {
        await expect(page.getByText("질문1")).toBeVisible();
      }

      await page.waitForTimeout(RECORDING.DURATION_MS);

      // 4. 측정 종료 (End Snapshot)
      const endTime = Date.now();
      const endMetrics = (await client.send(
        "Performance.getMetrics",
      )) as CDPMetrics;
      const endHeap = await page.evaluate(
        () => performance.memory?.usedJSHeapSize || 0,
      );

      // 5. 결과 계산 및 리포팅
      const fps = await page.evaluate(() => {
        const duration = (performance.now() - window.fpsMetrics.start) / 1000;
        return window.fpsMetrics.count / duration;
      });

      const totalCpuWorkSec =
        calculateCpuWork(endMetrics) - calculateCpuWork(startMetrics);
      const actualDurationSec = (endTime - startTime) / 1000;
      const cpuUsagePercent = (totalCpuWorkSec / actualDurationSec) * 100;
      const memoryGrowthMB = (endHeap - startHeap) / 1024 / 1024;

      console.log(`--- [${mode.type}] Benchmark Result ---`);
      console.log(`FPS: ${fps.toFixed(1)}`);
      console.log(`CPU Work: ${(totalCpuWorkSec * 1000).toFixed(0)}ms`);
      console.log(`CPU Usage: ${cpuUsagePercent.toFixed(1)}% (Main Thread)`);
      console.log(`Memory Growth: ${memoryGrowthMB.toFixed(2)} MB`);

      if (mode.type === "dom-overlay") {
        expect(fps).toBeGreaterThan(RECORDING.MIN_FPS_THRESHOLD);
      }
    });
  }
});
