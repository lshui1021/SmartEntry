import React, { useState } from 'react';

interface User {
    id: number;
    employeeId: string;
    employeeName: string;
    department: string;
    phone: string;
    roles: string[];
}

// Mock user data with more users and departments
const MOCK_USERS: User[] = [
    // IT Department
    { id: 1, employeeId: 'EMP001', employeeName: 'Alice Smith', department: 'IT', phone: '123-456-7890', roles: ['Admin'] },
    { id: 2, employeeId: 'EMP002', employeeName: 'Bob Jones', department: 'IT', phone: '123-456-7891', roles: ['User'] },
    { id: 3, employeeId: 'EMP003', employeeName: 'Charlie Day', department: 'IT', phone: '123-456-7892', roles: ['User'] },

    // HR Department
    { id: 4, employeeId: 'EMP004', employeeName: 'David Chen', department: 'HR', phone: '123-456-7893', roles: ['User'] },
    { id: 5, employeeId: 'EMP005', employeeName: 'Emily Wang', department: 'HR', phone: '123-456-7894', roles: ['User'] },

    // Security Department
    { id: 6, employeeId: 'EMP006', employeeName: 'Frank Zhang', department: 'Security', phone: '123-456-7895', roles: ['Guard'] },
    { id: 7, employeeId: 'EMP007', employeeName: 'Grace Liu', department: 'Security', phone: '123-456-7896', roles: ['Guard'] },
    { id: 8, employeeId: 'EMP008', employeeName: 'Helen Yu', department: 'Security', phone: '123-456-7897', roles: ['Guard'] },

    // Finance Department
    { id: 9, employeeId: 'EMP009', employeeName: 'Ian Patel', department: 'Finance', phone: '123-456-7898', roles: ['User'] },
    { id: 10, employeeId: 'EMP010', employeeName: 'Jack Morrison', department: 'Finance', phone: '123-456-7899', roles: ['User', 'Admin'] },

    // Operations Department
    { id: 11, employeeId: 'EMP011', employeeName: 'Karen Lee', department: 'Operations', phone: '123-456-7800', roles: ['User'] },
    { id: 12, employeeId: 'EMP012', employeeName: 'Laura Martinez', department: 'Operations', phone: '123-456-7801', roles: ['Guard'] },
];

const AVAILABLE_ROLES = ['Admin', 'User', 'Guard'];

interface RolePermissions {
    [key: string]: string[];
}

const ROLE_PERMISSIONS: RolePermissions = {
    'Admin': [
        'View all appointments',
        'Create appointments',
        'Edit appointments',
        'Cancel appointments',
        'View reports',
        'Export data',
        'Manage users',
        'Manage roles'
    ],
    'User': [
        'View own appointments',
        'Create appointments',
        'View reports'
    ],
    'Guard': [
        'View today appointments',
        'Check-in visitors',
        'Check-out visitors',
        'Register walk-ins'
    ]
};

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');

    // Batch operations
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [batchRole, setBatchRole] = useState<string>('');
    const [batchAction, setBatchAction] = useState<'add' | 'remove' | ''>('');

    // Single edit
    const [editingUser, setEditingUser] = useState<number | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    // Permissions view
    const [showPermissions, setShowPermissions] = useState<string | null>(null);

    // Get unique departments
    const departments = Array.from(new Set(users.map(u => u.department))).sort();

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
        const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
        return matchesSearch && matchesRole && matchesDepartment;
    });

    // Group users by department for display
    const usersByDepartment = filteredUsers.reduce((acc, user) => {
        if (!acc[user.department]) {
            acc[user.department] = [];
        }
        acc[user.department].push(user);
        return acc;
    }, {} as Record<string, User[]>);

    const handleSelectUser = (userId: number) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSelectAllInDepartment = (department: string) => {
        const deptUsers = usersByDepartment[department];
        const deptUserIds = deptUsers.map(u => u.id);
        const allSelected = deptUserIds.every(id => selectedUsers.includes(id));

        if (allSelected) {
            setSelectedUsers(selectedUsers.filter(id => !deptUserIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedUsers, ...deptUserIds])];
            setSelectedUsers(newSelected);
        }
    };

    const handleBatchAssign = () => {
        if (!batchRole || selectedUsers.length === 0) {
            alert('Please select a role and at least one user');
            return;
        }

        setUsers(users.map(user => {
            if (selectedUsers.includes(user.id)) {
                if (batchAction === 'add') {
                    // Add role if not already present
                    if (!user.roles.includes(batchRole)) {
                        return { ...user, roles: [...user.roles, batchRole] };
                    }
                } else if (batchAction === 'remove') {
                    // Remove role
                    return { ...user, roles: user.roles.filter(r => r !== batchRole) };
                }
            }
            return user;
        }));

        // Clear selections
        setSelectedUsers([]);
        setBatchRole('');
        setBatchAction('');
        alert(`Successfully ${batchAction === 'add' ? 'added' : 'removed'} ${batchRole} role for ${selectedUsers.length} user(s)`);
    };

    const handleEditRole = (userId: number) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setEditingUser(userId);
            setSelectedRoles([...user.roles]);
        }
    };

    const handleSaveRole = () => {
        if (editingUser !== null) {
            setUsers(users.map(user =>
                user.id === editingUser ? { ...user, roles: [...selectedRoles] } : user
            ));
            setEditingUser(null);
            setSelectedRoles([]);
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setSelectedRoles([]);
    };

    const toggleRole = (role: string) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Admin': return '#dc3545';
            case 'User': return '#0d6efd';
            case 'Guard': return '#198754';
            default: return '#6c757d';
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('all');
        setDepartmentFilter('all');
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '10px' }}>User Management (RBAC)</h2>
                <p style={{ color: '#6c757d', margin: 0 }}>
                    Manage user roles and permissions - {users.length} total users
                </p>
            </div>

            {/* Batch Operations Panel */}
            <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f8f9fa', borderLeft: '4px solid var(--primary-color)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px' }}>🔄 Batch Role Assignment</h3>
                <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '15px' }}>
                    Select users below, then choose a role and action to apply changes to multiple users at once
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Role
                        </label>
                        <select
                            value={batchRole}
                            onChange={(e) => setBatchRole(e.target.value)}
                            style={{
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                minWidth: '150px'
                            }}
                        >
                            <option value="">Select Role</option>
                            {AVAILABLE_ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Action
                        </label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                                onClick={() => setBatchAction('add')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: batchAction === 'add' ? 'var(--success-color)' : 'white',
                                    color: batchAction === 'add' ? 'white' : '#333',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: batchAction === 'add' ? 'bold' : 'normal'
                                }}
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setBatchAction('remove')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: batchAction === 'remove' ? 'var(--danger-color)' : 'white',
                                    color: batchAction === 'remove' ? 'white' : '#333',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: batchAction === 'remove' ? 'bold' : 'normal'
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                        <div>
                            <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                                Selected: <strong>{selectedUsers.length}</strong> user(s)
                            </span>
                        </div>
                        <button
                            onClick={handleBatchAssign}
                            disabled={!batchRole || selectedUsers.length === 0 || !batchAction}
                            className="btn-primary"
                            style={{
                                opacity: (!batchRole || selectedUsers.length === 0 || !batchAction) ? 0.5 : 1,
                                cursor: (!batchRole || selectedUsers.length === 0 || !batchAction) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Apply to {selectedUsers.length} User(s)
                        </button>
                        {selectedUsers.length > 0 && (
                            <button
                                onClick={() => setSelectedUsers([])}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'transparent',
                                    color: '#6c757d',
                                    border: '1px solid #6c757d',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            🔍 Search Users
                        </label>
                        <input
                            type="text"
                            placeholder="Name, Employee ID, or Department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            🏢 Department
                        </label>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            👤 Role
                        </label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="all">All Roles</option>
                            {AVAILABLE_ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                        Showing {filteredUsers.length} of {users.length} users
                    </span>
                    <button
                        onClick={clearFilters}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: 'var(--primary-color)',
                            border: '1px solid var(--primary-color)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Users Table - Grouped by Department */}
            <div style={{ marginBottom: '30px' }}>
                {Object.entries(usersByDepartment).sort().map(([department, deptUsers]) => (
                    <div key={department} style={{ marginBottom: '30px' }}>
                        {/* Department Header */}
                        <div style={{
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            padding: '15px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: '8px 8px 0 0'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                                    🏢 {department}
                                </h3>
                                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                    {deptUsers.length} user(s)
                                </span>
                            </div>
                            <button
                                onClick={() => handleSelectAllInDepartment(department)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'white',
                                    color: 'var(--primary-color)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {deptUsers.every(u => selectedUsers.includes(u.id)) ? '☑ Deselect All' : '☐ Select All'}
                            </button>
                        </div>

                        {/* Department Users Table */}
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            borderRadius: '0 0 8px 8px',
                            overflow: 'hidden'
                        }}>
                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'center', width: '50px' }}>Select</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Employee ID</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Roles</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deptUsers.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>{user.employeeId}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.employeeName}</td>
                                        <td style={{ padding: '12px' }}>{user.phone}</td>
                                        <td style={{ padding: '12px' }}>
                                            {editingUser === user.id ? (
                                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                    {AVAILABLE_ROLES.map(role => (
                                                        <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRoles.includes(role)}
                                                                onChange={() => toggleRole(role)}
                                                            />
                                                            <span>{role}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                    {user.roles.map(role => (
                                                        <span
                                                            key={role}
                                                            style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '12px',
                                                                backgroundColor: getRoleBadgeColor(role),
                                                                color: 'white',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {editingUser === user.id ? (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={handleSaveRole}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: 'var(--success-color)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#6c757d',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditRole(user.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: 'transparent',
                                                        color: 'var(--primary-color)',
                                                        border: '1px solid var(--primary-color)',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    Edit Roles
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* Role Permissions Reference */}
            <div className="card">
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Role Permissions Reference</h3>
                <p style={{ color: '#6c757d', marginBottom: '20px', fontSize: '0.95rem' }}>
                    Click on a role to view its permissions
                </p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {AVAILABLE_ROLES.map(role => (
                        <button
                            key={role}
                            onClick={() => setShowPermissions(showPermissions === role ? null : role)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: showPermissions === role ? getRoleBadgeColor(role) : 'white',
                                color: showPermissions === role ? 'white' : getRoleBadgeColor(role),
                                border: `2px solid ${getRoleBadgeColor(role)}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            {role}
                        </button>
                    ))}
                </div>

                {showPermissions && (
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${getRoleBadgeColor(showPermissions)}`
                    }}>
                        <h4 style={{ marginTop: 0, color: getRoleBadgeColor(showPermissions) }}>
                            {showPermissions} Permissions
                        </h4>
                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                            {ROLE_PERMISSIONS[showPermissions]?.map((permission, index) => (
                                <li key={index} style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
                                    {permission}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
