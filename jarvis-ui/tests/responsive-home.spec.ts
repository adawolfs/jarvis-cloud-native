import { expect, test } from "@playwright/test";

test("mobile layout does not overflow and shows start button", async ({
  page,
}) => {
  await page.goto("/");

  const startButton = page.getByRole("button", { name: "Start J.A.R.V.I.S" });
  await expect(startButton).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth;
  });

  expect(hasHorizontalOverflow).toBe(false);
});
