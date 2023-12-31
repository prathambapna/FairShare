import React, { Fragment, useState } from 'react';
import "./SearchBarPayer.css";

const SearchBarPayer = ({allUsers,onAddUser}) => {

    const [selectedUser, setSelectedUser] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);


    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        const filteredUsers = allUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredUsers(filteredUsers);
    };

    const handleUserSelection = (user) => {
        setSelectedUser(user);
        setDropdownOpen(false);
        onAddUser(user);
        setFilteredUsers([]);
    };

    return (
        <Fragment>
            <div className="SearchBarPayerContainer">
                <input
                    className="SearchPayerInput"
                    type="text"
                    placeholder="Search payer by name or email"
                    value={searchQuery}
                    onChange={handleSearch}
                    onClick={() => setDropdownOpen(!dropdownOpen)} 
                />
                {dropdownOpen && <ul className="payerList">
                    {filteredUsers.map((user) => (
                        <li key={user._id} className="payerListItem">
                        <div>
                            <span className="payerName">{user.name}</span> -{' '}
                            <span className="payerEmail">{user.email}</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={selectedUser && selectedUser._id===user._id}
                            onChange={() => handleUserSelection(user)}
                        />
                        </li>
                    ))}
                </ul>}
            </div>
        </Fragment>
    )
}

export default SearchBarPayer