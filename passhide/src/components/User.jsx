import React, { useState } from 'react';

const User = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [status, setStatus] = useState('active');
  const [users, setUsers] = useState([]);

  const handleSubmit = () => {
    if (!name || !age) return;

    const newUser = {
      id: users.length + 1,
      name,
      age,
      status
    };

    setUsers([...users, newUser]);

    // clear input
    setName('');
    setAge('');
    setStatus('active');
  };

  const handleDelete = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="parent">
      <div className="child">

        {/* LEFT SIDE FORM */}
        <div className="m">
          <h2>Create User</h2>

          <p>Name</p>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <p>Age</p>
          <input
            type="number"
            placeholder="Enter age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <p>Status</p>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div>
            <button onClick={handleSubmit}>Submit</button>
          </div>
        </div>

        {/* RIGHT SIDE TABLE */}
        <div className="side">
          <h2>User List</h2>

          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Status</th>
                <th>Age</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.status}</td>
                  <td>{user.age}</td>
                  <td
                    style={{ color: 'red', cursor: 'pointer' }}
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
  
    </div>


  );
};

export default User;

