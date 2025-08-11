import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaFutbol, FaChartLine, FaDice, FaChartBar, FaTrophy, FaUsers, FaDatabase, FaBookmark, FaBars } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FaHome },
    { path: '/fixtures', label: 'Jogos', icon: FaFutbol },
    { path: '/predictions', label: 'Predições', icon: FaChartLine },
    { path: '/odds', label: 'Odds', icon: FaDice },
    { path: '/statistics', label: 'Estatísticas', icon: FaChartBar },
    { path: '/leagues', label: 'Ligas', icon: FaTrophy },
    { path: '/teams', label: 'Times', icon: FaUsers },
    { path: '/cache', label: 'Cache', icon: FaDatabase },
    { path: '/my-bets', label: 'Minhas Apostas', icon: FaBookmark },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <div className="navbar-logo">
              <FaFutbol />
            </div>
            <span className="navbar-title">IA Apostas</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="navbar-menu desktop">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`navbar-item ${isActive ? 'active' : ''}`}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="navbar-mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <FaBars />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
