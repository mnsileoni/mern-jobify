/** @format */

import Wrapper from "../assets/wrappers/SmallSidebar";

import { useAppContext } from "../context/appContext";
import { BsFillArrowLeftSquareFill } from "react-icons/bs";
import Logo from "./Logo";
import NavLinks from "./NavLinks";

export const SmallSidebar = () => {
  const { showSidebar, toggleSidebar } = useAppContext();
  return (
    <Wrapper>
      <div className={`sidebar-container${showSidebar ? " show-sidebar" : ""}`}>
        <div className='content'>
          <button className='close-btn' onClick={toggleSidebar}>
            <BsFillArrowLeftSquareFill />
          </button>
          <header>
            <Logo />
          </header>
          <NavLinks toggleSidebar={toggleSidebar} />
        </div>
      </div>
    </Wrapper>
  );
};

export default SmallSidebar;
