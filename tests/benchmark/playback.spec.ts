import { expect } from "@playwright/test";
import { test } from "./fixture";
import { BENCHMARK_CONFIG } from "./config";

test.describe("Playback Benchmark", () => {
  const { API, PATHS, PLAYBACK, NETWORK } = BENCHMARK_CONFIG;
  const TEST_DATE = "2025-12-31";

  const modes = [
    {
      type: "hls",
      name: "HLS (Current)",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    },
    {
      type: "mp4",
      name: "MP4 (Control)",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
  ];

  for (const mode of modes) {
    test(`Stress Test: ${mode.name}`, async ({ page }) => {
      // 1. CDP 및 네트워크 설정
      const client = await page.context().newCDPSession(page);
      await client.send("Network.enable");

      let mediaBytes = 0;
      const requestMap = new Map<string, string>();

      client.on("Network.requestWillBeSent", (e) =>
        requestMap.set(e.requestId, e.request.url),
      );
      client.on("Network.dataReceived", (e) => {
        const url = requestMap.get(e.requestId) || "";
        if (/\.(ts|m3u8|mp4|m4s)$/.test(url) || url.includes("video")) {
          mediaBytes += e.encodedDataLength;
        }
      });

      // 2. API Mocking
      await page.route(API.VIDEO_DETAIL, async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            s3Url: mode.url,
            timestamps: [{ time: 0, label: "Start" }],
            encoded: true,
          }),
        });
      });

      // 3. [Phase 1] 초기 로딩 (TTFF 측정)
      await client.send("Network.emulateNetworkConditions", NETWORK.FAST_4G);
      await page.goto(`${PATHS.PLAYBACK_PAGE(TEST_DATE)}`, {
        waitUntil: "networkidle",
      });

      if (page.url().includes("login")) {
        throw new Error("Login Redirect detected. Check auth.json.");
      }

      await page.waitForSelector("video", {
        state: "attached",
        timeout: 20000,
      });

      const ttff: number = await page.evaluate(async () => {
        const video = document.querySelector("video");
        if (!video) return -1;
        const start = performance.now();
        if (video.currentTime > 0) return 0;
        return new Promise((resolve) => {
          const onPlay = () => {
            if (video.currentTime > 0) {
              video.removeEventListener("timeupdate", onPlay);
              resolve(performance.now() - start);
            }
          };
          video.play().catch(() => {});
          video.addEventListener("timeupdate", onPlay);
        });
      });

      await page.waitForTimeout(PLAYBACK.PRE_SEEK_PLAY_MS);

      const initialResolution = await page.evaluate(() => {
        const v = document.querySelector("video");
        return v ? `${v.videoWidth}x${v.videoHeight}` : "N/A";
      });

      // 4. [Phase 2] 네트워크 스로틀링 & 구간 이동 (Seek Latency)
      await client.send("Network.emulateNetworkConditions", NETWORK.SLOW_4G);

      const seekLatency: number = await page.evaluate(async () => {
        const video = document.querySelector("video");
        if (!video) return -1;
        const start = performance.now();
        video.currentTime = video.duration * 0.8;
        return new Promise((resolve) => {
          const onSeeked = () => {
            if (video.readyState >= 3) resolve(performance.now() - start);
            else
              video.addEventListener(
                "canplay",
                () => resolve(performance.now() - start),
                { once: true },
              );
          };
          video.addEventListener("seeked", onSeeked, { once: true });
        });
      });

      // 5. [Phase 3] 버퍼링 및 화질 적응 측정
      const bufferingStats = await page.evaluate(async (duration) => {
        const video = document.querySelector("video");
        if (!video) return { stalledTime: 0, finalResolution: "N/A" };
        let stalledTime = 0;
        let stallStart = 0;
        video.addEventListener(
          "waiting",
          () => (stallStart = performance.now()),
        );
        video.addEventListener("playing", () => {
          if (stallStart > 0) {
            stalledTime += performance.now() - stallStart;
            stallStart = 0;
          }
        });
        await new Promise((r) => setTimeout(r, duration));
        if (stallStart > 0) stalledTime += performance.now() - stallStart;
        return {
          stalledTime,
          finalResolution: `${video.videoWidth}x${video.videoHeight}`,
        };
      }, PLAYBACK.OBSERVATION_MS);

      // 6. 결과 리포팅
      console.log(`--- [${mode.type}] Benchmark Result ---`);
      console.log(`TTFF: ${ttff.toFixed(0)}ms`);
      console.log(`Seek Latency: ${seekLatency.toFixed(0)}ms`);
      console.log(`Buffering: ${bufferingStats.stalledTime.toFixed(0)}ms`);
      console.log(
        `Resolution: ${initialResolution} -> ${bufferingStats.finalResolution}`,
      );
      console.log(`Data: ${(mediaBytes / 1024).toFixed(0)} KB`);

      expect(ttff).toBeGreaterThanOrEqual(0);
    });
  }
});
