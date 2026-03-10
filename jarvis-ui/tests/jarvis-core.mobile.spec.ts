import { expect, test } from "@playwright/test";

test("shows particle core and debug panel on mobile", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start J.A.R.V.I.S" }).click();

  await expect(page.getByTestId("jarvis-particle-core")).toBeVisible({
    timeout: 10_000,
  });

  const hasHorizontalOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth;
  });

  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole("button", { name: "Debug On" }).click();
  await expect(page.locator("#chatHistory")).toBeVisible();
});
