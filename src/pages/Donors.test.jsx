import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Donors from "./Donors";
import { getDonors, updateDonor, createDonor } from "../api";

jest.mock("../api", () => ({ ...jest.requireActual("../api"), getDonors: jest.fn(), updateDonor: jest.fn(), createDonor: jest.fn() }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const donor = { id: 1, name: "Rohit Sharma", phone: "9876501234", group: "O+", status: "Available", location: "Lucknow", lastDonation: "2026-06-12" };

beforeEach(() => {
  getDonors.mockResolvedValue({ items: [donor], total: 1 });
  updateDonor.mockResolvedValue({});
});
afterEach(() => jest.clearAllMocks());

test("loads and shows donors", async () => {
  render(<Donors />);
  expect(await screen.findByText("Rohit Sharma")).toBeInTheDocument();
});

test("search waits for typing to stop, then asks the server", async () => {
  render(<Donors />);
  await screen.findByText("Rohit Sharma");
  fireEvent.change(screen.getByLabelText("Search donors"), { target: { value: "9876" } });
  await waitFor(() => expect(getDonors).toHaveBeenLastCalledWith(expect.objectContaining({ q: "9876" })));
});

test("blood group and status filters are sent to the server", async () => {
  render(<Donors />);
  await screen.findByText("Rohit Sharma");
  fireEvent.change(screen.getByLabelText("Blood group filter"), { target: { value: "O+" } });
  await waitFor(() => expect(getDonors).toHaveBeenLastCalledWith(expect.objectContaining({ group: "O+" })));
  fireEvent.change(screen.getByLabelText("Status filter"), { target: { value: "Pending" } });
  await waitFor(() => expect(getDonors).toHaveBeenLastCalledWith(expect.objectContaining({ group: "O+", status: "Pending" })));
});

test("blocking asks for confirmation first, and Escape cancels", async () => {
  render(<Donors />);
  fireEvent.click(await screen.findByRole("button", { name: "Block" }));
  const dialog = screen.getByRole("alertdialog");
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(screen.queryByRole("alertdialog")).toBeNull();
  expect(updateDonor).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "Block" }));
  fireEvent.click(screen.getByRole("button", { name: "Block donor" }));
  await waitFor(() => expect(updateDonor).toHaveBeenCalledWith(1, { status: "Blocked" }));
});

test("adding a donor checks the phone first, then sends it to the server", async () => {
  createDonor.mockResolvedValue({});
  render(<Donors />);
  fireEvent.click(await screen.findByRole("button", { name: "+ Add donor" }));
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Neha Verma" } });
  fireEvent.change(screen.getByLabelText("Phone"), { target: { value: "123" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(createDonor).not.toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText("Phone"), { target: { value: "9700011122" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() => expect(createDonor).toHaveBeenCalledWith({ name: "Neha Verma", phone: "9700011122", group: "O+", location: "" }));
});