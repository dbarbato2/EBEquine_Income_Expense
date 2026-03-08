import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { InnerLayout } from '../../styles/Layouts'
import { useGlobalContext } from '../../context/globalContext'
import bgEbEquine from '../../img/bg.png'
import bgCoolBlue from '../../img/bg_winter.png'
import bgRainbow from '../../img/bg_rainbow.png'
import bgFire from '../../img/bg_fire.png'
import bgSpring from '../../img/bg_spring.png'
import bgMetallic from '../../img/bg_metal.png'

function Settings() {
    const { changePassword } = useGlobalContext()
    const [theme, setTheme] = useState('light')
    const [background, setBackground] = useState('ebequine')
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [passwordError, setPasswordError] = useState('')
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [expandedSection, setExpandedSection] = useState(null)

    const toggleSection = (section) => {
        setExpandedSection(prev => prev === section ? null : section)
    }

    // Load theme and background from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light'
        const savedBackground = localStorage.getItem('background') || 'ebequine'
        setTheme(savedTheme)
        setBackground(savedBackground)
        applyTheme(savedTheme)
        applyBackground(savedBackground)
    }, [])

    const applyTheme = (selectedTheme) => {
        const root = document.documentElement
        
        if (selectedTheme === 'dark') {
            root.style.setProperty('--bg-color', '#1a1a2e')
            root.style.setProperty('--primary-color', '#e0e0e0')
            root.style.setProperty('--text-color', '#e0e0e0')
            root.style.setProperty('--card-bg', '#0f1419')
            root.style.setProperty('--nav-bg', 'rgba(15, 20, 25, 0.95)')
            root.style.setProperty('--border-color', '#2a3f5f')
            root.style.setProperty('--input-bg', '#1a2332')
            root.style.setProperty('--input-text', '#e0e0e0')
            root.style.setProperty('--hover-bg', 'rgba(255, 255, 255, 0.08)')
        } else {
            root.style.setProperty('--bg-color', '#f5f5f5')
            root.style.setProperty('--primary-color', '#222260')
            root.style.setProperty('--text-color', '#222260')
            root.style.setProperty('--card-bg', '#fcf6f9')
            root.style.setProperty('--nav-bg', 'rgba(252, 246, 249, 0.78)')
            root.style.setProperty('--border-color', '#ffffff')
            root.style.setProperty('--input-bg', '#ffffff')
            root.style.setProperty('--input-text', 'rgba(34, 34, 96, 0.9)')
            root.style.setProperty('--hover-bg', 'rgba(34, 34, 96, 0.1)')
        }
    }

    const handleThemeChange = (selectedTheme) => {
        setTheme(selectedTheme)
        localStorage.setItem('theme', selectedTheme)
        applyTheme(selectedTheme)
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: selectedTheme } }))
    }

    const applyBackground = (selectedBackground) => {
        const root = document.documentElement
        let bgUrl = bgEbEquine
        
        if (selectedBackground === 'coolblue') {
            bgUrl = bgCoolBlue
        } else if (selectedBackground === 'rainbow') {
            bgUrl = bgRainbow
        } else if (selectedBackground === 'fire') {
            bgUrl = bgFire
        } else if (selectedBackground === 'spring') {
            bgUrl = bgSpring
        } else if (selectedBackground === 'metallic') {
            bgUrl = bgMetallic
        }
        
        root.style.setProperty('--bg-image', `url(${bgUrl})`)
    }

    const handleBackgroundChange = (selectedBackground) => {
        setBackground(selectedBackground)
        localStorage.setItem('background', selectedBackground)
        applyBackground(selectedBackground)
        
        // Dispatch custom event to notify App component
        window.dispatchEvent(new CustomEvent('backgroundChange', { detail: { background: selectedBackground } }))
    }

    const handlePasswordInputChange = (field) => (e) => {
        setPasswordForm({ ...passwordForm, [field]: e.target.value })
        setPasswordError('')
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setPasswordError('')

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError('All fields are required')
            return
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters')
            return
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match')
            return
        }

        setPasswordLoading(true)
        const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
        setPasswordLoading(false)

        if (result.success) {
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } else {
            setPasswordError(result.message || 'Failed to change password')
        }
    }

    return (
        <SettingsStyled>
            <InnerLayout>
                <h2>Settings</h2>
                
                <div className="settings-container">

                    {/* Change Password - first */}
                    <div className="settings-section">
                        <div className="section-header" onClick={() => toggleSection('password')}>
                            <div>
                                <h3>Change Password</h3>
                                <p>Update your account password</p>
                            </div>
                            <span className={`chevron ${expandedSection === 'password' ? 'open' : ''}`}>&#8964;</span>
                        </div>

                        {expandedSection === 'password' && (
                            <div className="section-body">
                                <form className="password-form" onSubmit={handlePasswordSubmit}>
                                    <div className="password-field">
                                        <label htmlFor="currentPassword">Current Password</label>
                                        <input
                                            id="currentPassword"
                                            type="password"
                                            placeholder="Enter current password"
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordInputChange('currentPassword')}
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    <div className="password-field">
                                        <label htmlFor="newPassword">New Password</label>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            placeholder="Enter new password (min. 6 characters)"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordInputChange('newPassword')}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div className="password-field">
                                        <label htmlFor="confirmPassword">Confirm New Password</label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordInputChange('confirmPassword')}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    {passwordError && <p className="password-error">{passwordError}</p>}
                                    <button type="submit" className="password-btn" disabled={passwordLoading}>
                                        {passwordLoading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Theme */}
                    <div className="settings-section" style={{borderTop: '1px solid var(--border-color)'}}>
                        <div className="section-header" onClick={() => toggleSection('theme')}>
                            <div>
                                <h3>Theme</h3>
                                <p>Select your preferred theme</p>
                            </div>
                            <span className={`chevron ${expandedSection === 'theme' ? 'open' : ''}`}>&#8964;</span>
                        </div>

                        {expandedSection === 'theme' && (
                            <div className="section-body">
                                <div className="theme-options">
                                    <div 
                                        className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                        onClick={() => handleThemeChange('light')}
                                    >
                                        <div className="theme-preview light-preview">
                                            <div className="preview-bar"></div>
                                            <div className="preview-content">
                                                <div className="preview-box"></div>
                                                <div className="preview-box"></div>
                                            </div>
                                        </div>
                                        <label>Light Mode</label>
                                        {theme === 'light' && <span className="checkmark">✓</span>}
                                    </div>
                                    
                                    <div 
                                        className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                        onClick={() => handleThemeChange('dark')}
                                    >
                                        <div className="theme-preview dark-preview">
                                            <div className="preview-bar"></div>
                                            <div className="preview-content">
                                                <div className="preview-box"></div>
                                                <div className="preview-box"></div>
                                            </div>
                                        </div>
                                        <label>Dark Mode</label>
                                        {theme === 'dark' && <span className="checkmark">✓</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Background */}
                    <div className="settings-section" style={{borderTop: '1px solid var(--border-color)'}}>
                        <div className="section-header" onClick={() => toggleSection('background')}>
                            <div>
                                <h3>Background</h3>
                                <p>Select your preferred background</p>
                            </div>
                            <span className={`chevron ${expandedSection === 'background' ? 'open' : ''}`}>&#8964;</span>
                        </div>

                        {expandedSection === 'background' && (
                            <div className="section-body">
                                <div className="background-options">
                                    <div 
                                        className={`background-option ${background === 'ebequine' ? 'active' : ''}`}
                                        onClick={() => handleBackgroundChange('ebequine')}
                                    >
                                        <div className="background-preview" style={{backgroundImage: `url(${bgEbEquine})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                                        <label>EB Equine</label>
                                        {background === 'ebequine' && <span className="checkmark">✓</span>}
                                    </div>
                                    
                                    <div 
                                        className={`background-option ${background === 'coolblue' ? 'active' : ''}`}
                                        onClick={() => handleBackgroundChange('coolblue')}
                                    >
                                        <div className="background-preview" style={{backgroundImage: `url(${bgCoolBlue})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                                        <label>Cool Blue</label>
                                        {background === 'coolblue' && <span className="checkmark">✓</span>}
                                    </div>

                                    <div 
                                        className={`background-option ${background === 'rainbow' ? 'active' : ''}`}
                                        onClick={() => handleBackgroundChange('rainbow')}
                                    >
                                        <div className="background-preview" style={{backgroundImage: `url(${bgRainbow})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                                        <label>Rainbow</label>
                                        {background === 'rainbow' && <span className="checkmark">✓</span>}
                                    </div>

                                    <div 
                                        className={`background-option ${background === 'fire' ? 'active' : ''}`}
                                        onClick={() => handleBackgroundChange('fire')}
                                    >
                                        <div className="background-preview" style={{backgroundImage: `url(${bgFire})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                                        <label>Fire</label>
                                        {background === 'fire' && <span className="checkmark">✓</span>}
                                    </div>

                                    <div 
                                        className={`background-option ${background === 'spring' ? 'active' : ''}`}
                                        onClick={() => handleBackgroundChange('spring')}
                                    >
                                        <div className="background-preview" style={{backgroundImage: `url(${bgSpring})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                                        <label>Spring</label>
                                        {background === 'spring' && <span className="checkmark">✓</span>}
                                    </div>

                                    <div 
                                        className={`background-option ${background === 'metallic' ? 'active' : ''}`}
                                        onClick={() => handleBackgroundChange('metallic')}
                                    >
                                        <div className="background-preview" style={{backgroundImage: `url(${bgMetallic})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                                        <label>Metallic</label>
                                        {background === 'metallic' && <span className="checkmark">✓</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </InnerLayout>
        </SettingsStyled>
    )
}

const SettingsStyled = styled.div`
    h2 {
        color: var(--text-color);
        margin-bottom: 2rem;
        font-size: 2rem;
    }

    .settings-container {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
        border-radius: 20px;
        padding: 2rem;
    }

    .settings-section {
        padding: 1.2rem 0;

        &:first-child {
            padding-top: 0;
        }
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 0.5rem 0.25rem;
        border-radius: 8px;
        transition: background 0.2s ease;
        user-select: none;

        &:hover {
            background: var(--hover-bg);
            padding-left: 0.5rem;
            padding-right: 0.5rem;
        }

        div {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
        }

        h3 {
            color: var(--text-color);
            margin: 0;
            font-size: 1.3rem;
        }

        p {
            color: var(--text-color);
            opacity: 0.7;
            margin: 0;
            font-size: 0.95rem;
        }
    }

    .chevron {
        font-size: 1.6rem;
        color: var(--text-color);
        opacity: 0.6;
        display: inline-block;
        transition: transform 0.25s ease;
        line-height: 1;

        &.open {
            transform: rotate(180deg);
        }
    }

    .section-body {
        padding-top: 1.5rem;
    }

    .theme-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
    }

    .theme-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        padding: 1.5rem;
        border: 2px solid transparent;
        border-radius: 12px;
        transition: all 0.3s ease;

        &:hover {
            background: var(--hover-bg);
        }

        &.active {
            border-color: #222260;
            background: var(--hover-bg);
        }

        .theme-preview {
            width: 120px;
            height: 150px;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;

            &.light-preview {
                background: #f5f5f5;

                .preview-bar {
                    height: 20%;
                    background: #fcf6f9;
                    border-bottom: 1px solid #ddd;
                }

                .preview-content {
                    flex: 1;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;

                    .preview-box {
                        height: 12px;
                        background: #e0e0e0;
                        border-radius: 2px;
                    }

                    .preview-box:last-child {
                        height: 8px;
                    }
                }
            }

            &.dark-preview {
                background: #1a1a2e;

                .preview-bar {
                    height: 20%;
                    background: #16213e;
                    border-bottom: 1px solid #3a4563;
                }

                .preview-content {
                    flex: 1;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;

                    .preview-box {
                        height: 12px;
                        background: #3a4563;
                        border-radius: 2px;
                    }

                    .preview-box:last-child {
                        height: 8px;
                    }
                }
            }
        }

        label {
            color: var(--text-color);
            font-weight: 600;
            cursor: pointer;
        }

        .checkmark {
            color: #228B22;
            font-size: 1.2rem;
            font-weight: bold;
        }
    }

    .background-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
    }

    .background-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        padding: 1.5rem;
        border: 2px solid transparent;
        border-radius: 12px;
        transition: all 0.3s ease;

        &:hover {
            background: var(--hover-bg);
        }

        &.active {
            border-color: #222260;
            background: var(--hover-bg);
        }

        .background-preview {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, 0.1);
            box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
        }

        label {
            color: var(--text-color);
            font-weight: 600;
            cursor: pointer;
        }

        .checkmark {
            color: #228B22;
            font-size: 1.2rem;
            font-weight: bold;
        }
    }

    .password-form {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
        max-width: 420px;
        margin-top: 1.5rem;
    }

    .password-field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
            font-weight: 600;
            color: var(--text-color);
            font-size: 0.95rem;
        }

        input {
            padding: 0.75rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.95rem;
            font-family: inherit;
            background: var(--input-bg);
            color: var(--input-text);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;

            &:hover {
                border-color: var(--text-color);
            }

            &:focus {
                outline: none;
                border-color: #222260;
                box-shadow: 0 0 0 2px var(--hover-bg);
            }
        }
    }

    .password-error {
        color: #dc3545;
        font-size: 0.9rem;
        margin: 0;
    }

    .password-btn {
        align-self: flex-start;
        padding: 0.8rem 1.8rem;
        background: #222260;
        color: #fff;
        border: none;
        border-radius: 30px;
        font-size: 1rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);

        &:hover:not(:disabled) {
            background: #16145e;
            box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.12);
            transform: translateY(-1px);
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }
`;

export default Settings
