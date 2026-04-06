
export default function TabNavigation({
    setActiveTab,activeTab
}){

const Users = () => <span>👥</span>;
const MessageCircle = () => <span>💬</span>;
    return(<>
    <div className="tabs-container">
        <div className="tabs-wrapper">
          <div className="tabs-list">
            <button
              onClick={() => setActiveTab('private')}
              className={`tab-button ${activeTab === 'private' ? 'active' : ''}`}
            >
              <div className="tab-content">
                <MessageCircle />
                Private Chat
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('group')}
              className={`tab-button ${activeTab === 'group' ? 'active' : ''}`}
            >
              <div className="tab-content">
                <Users />
                Group Chat
              </div>
            </button>
            <button
              onClick={() => setActiveTab('friendlist')}
              className={`tab-button ${activeTab === 'friendlist' ? 'active' : ''}`}
            >
              <div className="tab-content">
                <Users />
                FriendList/Chats
              </div>
            </button>
          </div>
        </div>
      </div>
    </>)
}