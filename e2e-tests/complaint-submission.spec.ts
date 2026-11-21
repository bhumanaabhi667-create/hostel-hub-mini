import { test, expect } from "@playwright/test";

test("submit a facility complaint for a resident", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Complaints" }).click();
  await expect(page.getByRole("heading", { name: "Facility complaints" })).toBeVisible();
  await page.getByRole("button", { name: "New complaint" }).click();

  await page.getByLabel("Student").selectOption({ label: "Priya Sharma · C-108" });
  await page.getByLabel("Category").selectOption("Plumbing");
  await page.getByLabel("Description").fill("Bathroom sink drain is blocked");
  await page.getByRole("button", { name: "Submit complaint" }).click();

  await expect(page.getByText("Bathroom sink drain is blocked")).toBeVisible();
  await expect(page.getByText("Complaint submitted successfully")).toBeVisible();
});
