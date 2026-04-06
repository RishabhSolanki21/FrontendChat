import React from "react"

export default function ChatHeader({username,disconnect}) {
const User = () => <span>👤</span>;
const LogOut = () => <span>🚪</span>;

    return(<>
        <div className="chat-header">
        <div className="header-content">
          <div className="user-info">
            <div className="user-avatar">
              <User />
            </div>
            <div className="user-details">
              <h2 className="user-name">{username}</h2>
              <p className="user-status">● Online</p>
            </div>
          </div>
          
          <button onClick={disconnect} className="btn-disconnect">
            <LogOut />
            Disconnect
          </button>
        </div>
      </div>
        </>)
}