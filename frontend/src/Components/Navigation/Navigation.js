import React, { useState } from 'react'
import styled from 'styled-components'
import avatar from '../../img/avatar.png'
import { signout, settings } from '../../utils/Icons'
import { menuItems } from '../../utils/menuItems'
import { useGlobalContext } from '../../context/globalContext'

function Navigation({active, setActive}) {

    const { signOutUser, setError, name, email } = useGlobalContext();
    const [expandedMenu, setExpandedMenu] = useState(null);

    const handleSignOut = async (event) => {
        event.preventDefault();
        setError(null); // Reset error before new request
        await signOutUser();
      };

    const handleMenuClick = (item) => {
        if (item.submenu) {
            setExpandedMenu(expandedMenu === item.id ? null : item.id);
        } else {
            setActive(item.id);
            setExpandedMenu(null);
        }
    };

    const handleSubmenuClick = (subitem) => {
        setActive(subitem.id);
    };
    
    return (
        <NavStyled>
            <div className="user-con">
                <img src={avatar} alt="" />
                <div className="text">
                    <h2>{name}</h2>
                    <p>{email || 'Your Money'}</p>
                </div>
            </div>
            <ul className="menu-items">
                {menuItems.map((item) => {
                    return <li key={item.id}>
                        <div
                            onClick={() => handleMenuClick(item)}
                            className={`menu-item ${active === item.id ? 'active': ''}`}
                        >
                            {item.icon}
                            <span>{item.title}</span>
                            {item.submenu && (
                                <span className="submenu-arrow">
                                    {expandedMenu === item.id ? '▼' : '▶'}
                                </span>
                            )}
                        </div>
                        {item.submenu && expandedMenu === item.id && (
                            <ul className="submenu">
                                {item.submenu.map((subitem) => (
                                    <li key={subitem.id}>
                                        <div
                                            onClick={() => handleSubmenuClick(subitem)}
                                            className={`submenu-item ${active === subitem.id ? 'active' : ''}`}
                                        >
                                            <span>{subitem.title}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                })}
            </ul>
            <div className="bottom-nav-container">
                <div className="bottom-nav" onClick={handleSignOut}>
                    <span>
                        {signout} Sign Out
                    </span>
                </div>
                <div className="bottom-nav" onClick={() => {
                    setActive(99);
                    setExpandedMenu(null);
                }}>
                    <span>
                        {settings} Settings
                    </span>
                </div>
            </div>
        </NavStyled>
    )
}

const NavStyled = styled.nav`
    padding: 2rem 1.5rem;
    width: 374px;
    height: 100%;
    background: var(--nav-bg);
    border: 3px solid var(--border-color);
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2rem;
    .user-con{
        height: 100px;
        display: flex;
        align-items: center;
        gap: 1rem;
        img{
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            background: var(--card-bg);
            border: 2px solid var(--border-color);
            padding: .2rem;
            box-shadow: 0px 1px 17px rgba(0, 0, 0, 0.06);
        }
        h2{
            color: var(--text-color);
        }
        p{
            color: var(--text-color);
            opacity: 0.6;
        }
    }

    .menu-items{
        flex: 1;
        display: flex;
        flex-direction: column;
        
        li {
            margin: .6rem 0;

            .menu-item {
                display: grid;
                grid-template-columns: 40px auto 1fr;
                align-items: center;
                font-weight: 500;
                cursor: pointer;
                transition: all .4s ease-in-out;
                color: var(--text-color);
                opacity: 0.7;
                padding-left: 1rem;
                position: relative;
                i{
                    color: var(--text-color);
                    font-size: 1.4rem;
                    transition: all .4s ease-in-out;
                }

                .submenu-arrow {
                    justify-self: end;
                    padding-right: 1rem;
                    font-size: 0.8rem;
                }

                &.active {
                    color: var(--text-color) !important;
                    opacity: 1;
                    i{
                        color: var(--text-color) !important;
                    }
                    &::before{
                        content: "";
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 4px;
                        height: 100%;
                        background: var(--text-color);
                        border-radius: 0 10px 10px 0;
                    }
                }
            }

            .submenu {
                display: flex;
                flex-direction: column;
                margin-top: 0.5rem;
                padding-left: 3rem;
                list-style: none;

                li {
                    margin: 0.4rem 0;

                    .submenu-item {
                        padding: 0.5rem 0.5rem;
                        cursor: pointer;
                        transition: all .4s ease-in-out;
                        color: var(--text-color);
                        opacity: 0.7;
                        border-left: 3px solid transparent;
                        padding-left: 1.5rem;

                        &:hover {
                            opacity: 1;
                            background: var(--hover-bg);
                        }

                        &.active {
                            color: var(--text-color) !important;
                            opacity: 1;
                            border-left-color: var(--text-color);
                            font-weight: 600;
                        }
                    }
                }
            }
        }
    }

    .bottom-nav {
    cursor: pointer;
    color: var(--text-color);
    opacity: 0.7;
    transition: opacity .4s ease-in-out;
    span {
      display: flex;
      align-items: center;
      i {
        margin-right: 0.5rem;
      }
    }

    &:hover {
      opacity: 1;
    }
  }

  .bottom-nav-container {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
  }
`;

export default Navigation