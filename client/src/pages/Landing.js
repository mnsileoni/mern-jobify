/** @format */
import React from "react";
import main from "../assets/images/main.svg";
import { Logo } from "../components";
import Wrapper from "../assets/wrappers/LandingPage";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/appContext";

const Landing = () => {
  const { user } = useAppContext();
  return (
    <React.Fragment>
      {user && <Navigate to='/' />}
      <Wrapper>
        <nav>
          <Logo />
        </nav>
        <div className='container page'>
          {/* info column */}
          <div className='info'>
            <h1>
              job <span>tracking</span> app
            </h1>
            <p>
              Neutral milk hotel pour-over drinking vinegar mlkshk semiotics DIY
              irony. Jean shorts poke banh mi, ethical gluten-free palo santo
              wayfarers hell of godard lyft before they sold out offal bodega
              boys pok pok vape. Tbh pour-over listicle deep v. Distillery
              affogato meh authentic jean shorts vape sartorial bruh fixie
              franzen tousled mixtape.
            </p>
            <Link to='/register' className='btn btn-hero'>
              Login / Register
            </Link>
          </div>
          <img src={main} alt='job hunt' className='img main-img' />
        </div>
      </Wrapper>
    </React.Fragment>
  );
};

export default Landing;
