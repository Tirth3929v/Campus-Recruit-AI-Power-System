import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, CheckCircle, Search, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchTickets();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', { credentials: 'include' });
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/tickets', { credentials: 'include' });
      if (res.ok) setTickets(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleUpdateTicket = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/admin/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      fetchTickets();
    } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', { method: 'POST', credentials: 'include' });
      if (logout) logout();
      navigate('/login');
    } catch (e) { console.error(e); }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTickets = tickets.filter(t => t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || t.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
          <LayoutDashboard className="text-purple-500" /> Admin
        </h1>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <Users size={20} /> Users
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'tickets' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <MessageSquare size={20} /> Support Tickets
          </button>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{activeTab === 'users' ? 'User Management' : 'Support Tickets'}</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </header>

        {activeTab === 'users' ? (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-700/50 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-gray-400">{user.email}</td>
                    <td className="p-4 text-gray-400">{user.course}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold">
                        {user.streak} Days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{ticket.subject}</h3>
                    <p className="text-sm text-gray-400">From: {ticket.name} ({ticket.email})</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'Closed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-gray-300 mb-6 bg-gray-900/50 p-4 rounded-xl">{ticket.message}</p>
                <div className="flex justify-end gap-3">
                  {ticket.status !== 'Closed' && (
                    <button 
                      onClick={() => handleUpdateTicket(ticket.id, 'Closed')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      <CheckCircle size={16} /> Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
