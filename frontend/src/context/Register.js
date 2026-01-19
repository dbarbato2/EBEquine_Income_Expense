import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { LoginStyled } from "../../styles/Layouts";
import { useGlobalContext } from "../../context/globalContext";
function Register() {
    const { register, error } = useGlobalContext();
  const [cookies] = useCookies(["cookie-name"]);
  const navigate = useNavigate();
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (cookies.jwt) {
      navigate("/");
    }
  }, [cookies, navigate]);

  const [values, setValues] = useState({ email: "", password: "", name: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    console.log('Form submitted with values:', values);
    if (!values.name || !values.email || !values.password) {
      const msg = "All fields are required";
      setLocalError(msg);
      console.log('Validation error:', msg);
      return;
    }
    try {
      console.log('Calling register function...');
      await register(values);
      console.log('Register function completed');
    } catch (err) {
      console.error('Register error:', err);
      setLocalError('An error occurred during registration');
    }
  };

  return (
    <LoginStyled><div className="login">
    <div className="container">
      <h2>Register Account</h2>
      {(error || localError) && <div style={{color: 'red', marginBottom: '10px'}}>{error || localError}</div>}
      <form onSubmit={(e) => handleSubmit(e)}>
      <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={values.name}
            onChange={(e) =>
              setValues({ ...values, [e.target.name]: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={values.email}
            onChange={(e) =>
              setValues({ ...values, [e.target.name]: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={values.password}
            onChange={(e) =>
              setValues({ ...values, [e.target.name]: e.target.value })
            }
          />
        </div>
        <button type="submit">Submit</button>
        <span>
          Already have an account ?<Link to="/login"> Login</Link>
        </span>
      </form>
    </div>
    </div></LoginStyled>
  );
}

export default Register;