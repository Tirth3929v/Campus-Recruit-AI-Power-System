import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, BriefcaseIcon, DocumentCheckIcon, UserIcon } from '@heroicons/react/24/outline';

const StudentLayout = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/student', icon: HomeIcon },
    { name: 'My Applications', href: '/student/applications', icon: DocumentCheckIcon },
    { name: 'Browse Jobs', href: '/student/jobs', icon: BriefcaseIcon },
    { name: 'Profile', href: '/student/profile', icon: UserIcon },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#1f2937', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '30px', color: '#60a5fa' }}>
          Campus Recruit
        </div>
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {navigation.map((item) => (
              <li key={item.name} style={{ marginBottom: '10px' }}>
                <Link
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    color: location.pathname === item.href ? 'white' : '#9ca3af',
                    backgroundColor: location.pathname === item.href ? '#374151' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <item.icon style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ backgroundColor: 'white', padding: '15px 30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Student Portal</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#4b5563', fontWeight: '500' }}>Welcome, Student</span>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#e5e7eb' }}></div>
          </div>
        </header>
        <main style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;