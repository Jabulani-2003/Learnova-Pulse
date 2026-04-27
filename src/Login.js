import { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
    const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
  // 🔐 Login
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  // 🆕 Register
  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
  alert("Please fill in all fields");
  return;
}
  try {
    if (!firstName || !lastName) {
  alert("Please enter your name and surname");
  return;
}
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(userCredential.user, {
  displayName: `${
  firstName.charAt(0).toUpperCase() + firstName.slice(1)
} ${
  lastName.charAt(0).toUpperCase() + lastName.slice(1)
}`
});

  } catch (error) {
    alert(error.message);
  }
};

 return (
  <div className="login-page">
    <div className="login-card" style={{ transition: "all 0.3s ease" }}>
        <h1 className="brand-title">
  Learnova Pulse
</h1>
      <h2 className="login-title">
        {isRegister ? "Create Account" : "Welcome Back"}
      </h2>

      <p className="login-subtitle" style={{ textAlign: "center" }}>
  {isRegister
    ? "Start managing your classes smarter"
    : "Login to continue"}
</p>

{isRegister && (
  <div className="name-row">
    <input
      className="input"
      placeholder="First Name"
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
    />

    <input
      className="input"
      placeholder="Last Name"
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
    />
  </div>
)}

      <input
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isRegister ? (
        <button
  className="primary-button"
  onClick={handleRegister}
  disabled={!firstName || !lastName || !email || !password}
>
          Create Account
        </button>
      ) : (
        <button className="primary-button" onClick={handleLogin}>
          Login
        </button>
      )}

      <p className="switch-text">
        {isRegister ? (
          <span onClick={() => setIsRegister(false)}>
            Already have an account? <b>Login</b>
          </span>
        ) : (
          <span onClick={() => setIsRegister(true)}>
            No account? <b>Register</b>
          </span>
        )}
      </p>
    </div>
    <div className="footer">
  © 2026 Learnova Pulse • Built by Jabulani Pepenene
</div>

  </div>
);
}

export default Login;