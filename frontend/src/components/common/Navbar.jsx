import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => (
  <nav className="navbar">
    <span className="brand">Eluno OMS</span>
    <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
      Dashboard
    </NavLink>
    <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
      Orders
    </NavLink>
    <NavLink to="/inventory" className={({ isActive }) => (isActive ? 'active' : '')}>
      Inventory
    </NavLink>
  </nav>
);

export default Navbar;
