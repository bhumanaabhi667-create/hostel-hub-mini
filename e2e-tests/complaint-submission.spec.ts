import { test, expect } from "@playwright/test";

test("submit a facility complaint for a resident", async ({ page }) => {
  await page.goto("/");

  const email = `manager-${Date.now()}@example.com`;
  await page.getByRole("button", { name: "Create an account" }).click();
  await page.getByLabel("Name").fill("Test Manager");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: "Create account" }).click();

  await page.getByRole("button", { name: "Add student" }).click();
  await page.getByLabel("Student name").fill("Priya Sharma");
  await page.getByLabel("Department").fill("Biotechnology");
  await page.getByLabel("Room number").fill("C-108");
  await page.getByLabel("Emergency contact").fill("+1 555 0100");
  await page.getByRole("button", { name: "Create student record" }).click();

  await page.getByRole("button", { name: "Complaints" }).click();
  await expect(page.getByRole("heading", { name: "Facility complaints" })).toBeVisible();
  await page.getByRole("button", { name: "New complaint" }).click();

  await page.getByLabel("Student").selectOption({ label: "Priya Sharma · C-108" });
  await page.getByLabel("Category").selectOption("Plumbing");
  await page.getByLabel("Description").fill("Bathroom sink drain is blocked");
  await page.getByRole("button", { name: "Submit complaint" }).click();

  await expect(page.getByText("Bathroom sink drain is blocked")).toBeVisible();
  await expect(page.getByText("Complaint submitted successfully")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Bathroom sink drain is blocked")).toBeVisible();
});
