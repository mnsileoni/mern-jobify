/** @format */

import { useState, useEffect } from "react";
import { Logo, FormRow, Alert } from "../components";
import Wrapper from "../assets/wrappers/RegisterPage";
import { useAppContext } from "../context/appContext";
import { useNavigate } from "react-router-dom";

const initialState = {
  name: "",
  email: "",
  password: "",
  isMember: true,
};
function Register() {
  const [values, setValues] = useState(initialState);
  const {
    isLoading,
    showAlert,
    displayAlert,
    // registerUser,
    // loginUser,
    setupUser,
  } = useAppContext();
  const { user } = useAppContext();
  const navigate = useNavigate();

  //en el caso que ya tengamos un user en el contexto pasamos al dashboard
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [user, navigate]);

  const toggleMember = () => {
    setValues({ ...values, isMember: !values.isMember });
  };

  //handle change on any of the form rows
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  //handle submit of the form
  const onSubmit = (e) => {
    e.preventDefault();
    const { name, email, password, isMember } = values;
    if (!email || !password || (!isMember && !name)) {
      displayAlert();
      return;
    }
    const currentUser = { name, email, password };
    if (isMember) {
      // loginUser(currentUser); // unificado en SETUP
      setupUser({ currentUser, endPoint: "login", alertText: "Bienvenido" });
    } else {
      // registerUser(currentUser); // unificado en SETUP
      setupUser({ currentUser, endPoint: "register", alertText: "Registrado" });
    }
    // console.log(values);
  };

  return (
    <Wrapper className='full-page'>
      <form className='form' onSubmit={onSubmit}>
        <Logo />
        <h3>{values.isMember ? "Login" : "Register"}</h3>
        {showAlert && <Alert />}
        {/* toggle name */}

        {!values.isMember && (
          <FormRow
            type='text'
            name='name'
            // labelText='nombre'
            value={values.name}
            handleChange={handleChange}
          />
        )}
        {/* email field */}
        <FormRow
          type='email'
          name='email'
          // labelText='email'
          value={values.email}
          handleChange={handleChange}
        />
        {/* password */}
        <FormRow
          type='password'
          name='password'
          // labelText='password'
          handleChange={handleChange}
          value={values.password}
        />
        <button type='submit' className='btn btn-block' disabled={isLoading}>
          submit
        </button>
        {/* toggle button */}
        <p>
          {values.isMember ? "Not a member yet?" : "Already a member?"}
          <button type='button' onClick={toggleMember} className='member-btn'>
            {values.isMember ? "Register" : "Login"}
          </button>
        </p>
      </form>
    </Wrapper>
  );
}

export default Register;
