// src/pages/Emergencies.test.jsx
// Tests for the Emergencies page. Run them with: npm test

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Emergencies from "./Emergencies";
import { getEmergencies, updateEmergency, assignDonor } from "../api";

// Replace the real api.js with fakes, so no request goes to a server.
// Emergencies.jsx only uses these three functions.
jest.mock("../api", () => ({
  getEmergencies: jest.fn(),
  updateEmergency: jest.fn(),
  assignDonor: jest.fn(),
}));

// Replace the toast popups with fakes, so the tests don't need a ToastContainer.
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

// Two sample requests: one critical (should be red) and one open (should not).
const list = [
  { id: 1, patient: "Sunita Devi", hospital: "KGMU", group: "O-", units: 3, location: "Lucknow", status: "Critical", assignedTo: null },
  { id: 2, patient: "Arjun Mishra", hospital: "Apollo", group: "B+", units: 2, location: "Delhi", status: "Open", assignedTo: null },
];

// Before every test: the fake server returns the sample list and says yes to every action.
beforeEach(() => {
  getEmergencies.mockResolvedValue(list);
  updateEmergency.mockResolvedValue({});
  assignDonor.mockResolvedValue({});
});

// After every test: forget which fake functions were called.
afterEach(() => jest.clearAllMocks());

test("critical requests are highlighted and counted in the banner", async () => {
  render(<Emergencies />);

  // The critical row has the "hot" class, which the CSS turns red.
  const row = (await screen.findByText(/Sunita Devi/)).closest("tr");
  expect(row).toHaveClass("hot");

  // The open request is a normal row.
  expect(screen.getByText("Arjun Mishra").closest("tr")).not.toHaveClass("hot");

  // The banner at the top counts the critical requests.
  expect(screen.getByRole("status")).toHaveTextContent("1 critical request");
});

test("Assign donor calls the server for that request", async () => {
  render(<Emergencies />);

  // Both rows have an "Assign donor" button. Click the first one (Sunita Devi, id 1).
  const buttons = await screen.findAllByRole("button", { name: "Assign donor" });
  fireEvent.click(buttons[0]);

  await waitFor(() => expect(assignDonor).toHaveBeenCalledWith(1));
});

test("Verify moves a critical request to Open", async () => {
  render(<Emergencies />);

  // Only the critical row has a "Verify" button.
  fireEvent.click(await screen.findByRole("button", { name: "Verify" }));

  await waitFor(() => expect(updateEmergency).toHaveBeenCalledWith(1, { status: "Open" }));
});

test("Resolve closes the request", async () => {
  render(<Emergencies />);

  // Both rows have "Resolve". Click the second one (Arjun Mishra, id 2).
  const buttons = await screen.findAllByRole("button", { name: "Resolve" });
  fireEvent.click(buttons[1]);

  await waitFor(() => expect(updateEmergency).toHaveBeenCalledWith(2, { status: "Resolved" }));
});