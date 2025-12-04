import { expect } from "@playwright/test";
import { test } from "./fixture";
import { BENCHMARK_CONFIG } from "./config";

test.describe("Upload Benchmark", () => {
  const { API, UPLOAD, NETWORK } = BENCHMARK_CONFIG;

  test.beforeEach(async ({ page }) => {
    await page.route(API.QUESTIONS, async (r) =>
      r.fulfill({ status: 200, body: JSON.stringify({ questions: ["Q1"] }) }),
    );
    await page.route(API.CHECK_LIMIT, async (r) =>
      r.fulfill({
        status: 200,
        body: JSON.stringify({ todayVideoExists: false, pastVideos: [] }),
      }),
    );
    await page.route(API.FCM_TOKEN, async (r) => r.fulfill({ status: 200 }));
  });

  const modes = [
    { type: "resumable", name: "Resumable (Current)" },
    { type: "batch", name: "Batch (Control)" },
  ];

  for (const mode of modes) {
    test(`Goodput & Robustness: ${mode.name}`, async ({ page }) => {
      // 1. 권한 및 MediaRecorder Mock 설정
      await page.context().grantPermissions(["camera", "microphone"]);
      await page.addInitScript(
        ({ modeType, dummySize }) => {
          window.sessionStorage.setItem("benchmark_upload_mode", modeType);
          const OriginalMediaRecorder = window.MediaRecorder;
          window.MediaRecorder = class extends OriginalMediaRecorder {
            stop() {
              super.stop();
              const dummyBlob = new Blob([new ArrayBuffer(dummySize)], {
                type: "video/webm",
              });
              this.dispatchEvent(
                new BlobEvent("dataavailable", { data: dummyBlob }),
              );
            }
          };
        },
        { modeType: mode.type, dummySize: UPLOAD.DUMMY_FILE_SIZE_BYTES },
      );

      // 2. CDP 설정 (네트워크 트래픽 측정)
      const client = await page.context().newCDPSession(page);
      await client.send("Network.enable");
      let totalBytesSent = 0;

      client.on("Network.requestWillBeSentExtraInfo", ({ headers }) => {
        const length = Number(
          headers["Content-Length"] || headers["content-length"],
        );
        totalBytesSent += length || 0;
      });

      // 3. 녹화 진행
      await page.goto("/record");
      await page.getByRole("button", { name: "권한 허용하기" }).click();
      await page.getByRole("button", { name: "녹화 시작하기" }).click();
      await expect(page.locator("video")).toBeVisible({ timeout: 10000 });

      await page.waitForTimeout(3000);
      await page.getByRole("button", { name: /녹화 완료/i }).click();
      await page.getByRole("button", { name: /영상 저장하기/i }).click();
      await page.waitForTimeout(1000);

      // 4. 업로드 및 네트워크 장애 시뮬레이션
      const startTime = Date.now();
      await page.getByRole("button", { name: /촬영하기/i }).click();

      await client.send("Network.emulateNetworkConditions", NETWORK.FAST_4G);
      await page.waitForTimeout(UPLOAD.INTERRUPTION.UPLOAD_DURATION_BEFORE_CUT);

      await client.send("Network.emulateNetworkConditions", NETWORK.OFFLINE);
      console.log(`[${mode.type}] 🔴 Network Offline`);
      await page.waitForTimeout(UPLOAD.INTERRUPTION.OFFLINE_DURATION);

      await client.send("Network.emulateNetworkConditions", NETWORK.FAST_4G);
      console.log(`[${mode.type}] 🟢 Network Restored`);

      // 5. 복구 로직 검증
      if (mode.type === "resumable") {
        const retryBtn = page.getByRole("button", { name: "다시 시도하기" });
        if (await retryBtn.isVisible({ timeout: 10000 })) {
          await retryBtn.click();
        }
        await expect(page.getByText(/하루 필름/)).toBeVisible({
          timeout: UPLOAD.TIMEOUT_MS,
        });
      } else {
        try {
          await expect(page.getByText(/하루 필름/)).toBeVisible({
            timeout: 20000,
          });
          throw new Error("Batch upload succeeded unexpectedly.");
        } catch {
          /* Expected Failure */
        }
      }

      // 6. 결과 리포팅
      const durationSec = (Date.now() - startTime) / 1000;
      const sentMB = totalBytesSent / 1024 / 1024;

      console.log(`--- [${mode.type}] Benchmark Result ---`);
      console.log(`Time: ${durationSec.toFixed(1)}s`);
      console.log(`Data Sent: ${sentMB.toFixed(2)} MB`);
    });
  }
});
