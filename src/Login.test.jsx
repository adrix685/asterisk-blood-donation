// src/Login.test.jsx
// Tests for the Login page. Run them with: npm test

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import { login } from "./api";

// Replace the real api.js with a fake, so no request goes to a server.
// Login.jsx only uses the login function, so that is all we fake.
jest.mock("./api", () => ({ login: jest.fn() }));

// Helper: types an email and password, then clicks "Sign in".
function fill(email, password) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
}

// Start every test clean: no saved token, and no calls remembered by the fake login.
beforeEach(() => sessionStorage.clear());
afterEach(() => jest.clearAllMocks());

test("saves the token and continues after a good login", async () => {
  // Pretend the server accepted the login and sent back a token.
  login.mockResolvedValue({ token: "abc123" });
  const onDone = jest.fn();

  render(<Login onDone={onDone} />);
  fill("admin@lifelink.org", "secret123");

  // Wait until the page calls onDone (this happens after the fake server replies).
  await waitFor(() => expect(onDone).toHaveBeenCalled());

  // The form sent exactly what was typed, and the token was saved.
  expect(login).toHaveBeenCalledWith("admin@lifelink.org", "secret123");
  expect(sessionStorage.getItem("adminToken")).toBe("abc123");
});

test("shows the server error and stays on the page after a bad login", async () => {
  // Pretend the server refused the login.
  login.mockRejectedValue(new Error("Invalid email or password"));
  const onDone = jest.fn();

  render(<Login onDone={onDone} />);
  fill("admin@lifelink.org", "wrong");

  // The error message appears in the alert box.
  expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");

  // The user is not let in: onDone was not called and no token was saved.
  expect(onDone).not.toHaveBeenCalled();
  expect(sessionStorage.getItem("adminToken")).toBeNull();
});