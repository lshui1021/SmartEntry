import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTodayAppointments } from '../../services/api';
import { LogIn, LogOut, Eye, ArrowLeft, UserPlus, Download } from 'lucide-react';

interface Appointment {
  id: number;
  visitor: {
    vendorName: string;
    contactName: string;
  };
  user: {
    employeeName: string;
  };
  scheduleStartTime: string;
  actualEnterTime?: string | null;
  actualEndTime?: string | null;
  status: {
    name: string;
  };
  signatures?: {
    visitorCheckIn?: string;
    guardCheckIn?: string;
    visitorCheckOut?: string;
    guardCheckOut?: string;
  };
}

type TabType = 'checkin' | 'checkout' | 'history';

const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'checkin');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const navigate = useNavigate();

  const handleSignIn = (id: number) => {
    navigate(`/kiosk/checkin/${id}`);
  };

  const handleCheckOut = (id: number) => {
    navigate(`/kiosk/checkout/${id}`);
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeDetailsModal = () => {
    setSelectedAppointment(null);
  };

  const handleExport = () => {
    const dataToExport = getFilteredAppointments();
    if (dataToExport.length === 0) {
      alert('No records to export');
      return;
    }

    const headers = ['ID', 'Vendor', 'Visitor', 'Host', 'Schedule Time', 'Enter Time', 'Exit Time', 'Status'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(app => [
        app.id,
        `"${app.visitor.vendorName}"`,
        `"${app.visitor.contactName}"`,
        `"${app.user.employeeName}"`,
        app.scheduleStartTime,
        app.actualEnterTime || '',
        app.actualEndTime || '',
        app.status.name
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `appointments_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Set active tab from URL parameter
  useEffect(() => {
    if (tabParam && ['checkin', 'checkout', 'history'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getTodayAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [...appointments];

    switch (activeTab) {
      case 'checkin':
        // Filter: Pending, Today
        filtered = filtered.filter(app => {
          const appDate = new Date(app.scheduleStartTime);
          const isToday = appDate >= today && appDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          return isToday && app.status.name === '未結案';
        });
        // Sort: Ascending by time
        filtered.sort((a, b) => new Date(a.scheduleStartTime).getTime() - new Date(b.scheduleStartTime).getTime());
        break;

      case 'checkout':
        // Filter: Arrived
        filtered = filtered.filter(app => app.status.name === '抵達');
        // Sort: Ascending by entry time (or schedule time)
        filtered.sort((a, b) => {
          const timeA = a.actualEnterTime ? new Date(a.actualEnterTime).getTime() : new Date(a.scheduleStartTime).getTime();
          const timeB = b.actualEnterTime ? new Date(b.actualEnterTime).getTime() : new Date(b.scheduleStartTime).getTime();
          return timeA - timeB;
        });
        break;

      case 'history':
        // Filter: Completed, Selected Date
        filtered = filtered.filter(app => {
          if (app.status.name !== '完成') return false;
          const appDate = new Date(app.scheduleStartTime);
          const selected = new Date(selectedDate);
          selected.setHours(0, 0, 0, 0);
          const nextDay = new Date(selected);
          nextDay.setDate(nextDay.getDate() + 1);

          return appDate >= selected && appDate < nextDay;
        });
        // Sort: Descending by time
        filtered.sort((a, b) => new Date(b.scheduleStartTime).getTime() - new Date(a.scheduleStartTime).getTime());
        break;
    }

    return filtered;
  };

  const filteredAppointments = getFilteredAppointments();

  // Grouping Logic
  const groupedAppointments = () => {
    if (activeTab === 'history') return { 'All': filteredAppointments };

    const am: Appointment[] = [];
    const pm: Appointment[] = [];

    filteredAppointments.forEach(app => {
      let timeToCheck;
      if (activeTab === 'checkin') {
        timeToCheck = new Date(app.scheduleStartTime);
      } else { // checkout
        timeToCheck = app.actualEnterTime ? new Date(app.actualEnterTime) : new Date(app.scheduleStartTime);
      }

      if (timeToCheck.getHours() < 12) {
        am.push(app);
      } else {
        pm.push(app);
      }
    });

    return {
      [activeTab === 'checkin' ? '上午待報到 (AM)' : '上午抵達 (AM)']: am,
      [activeTab === 'checkin' ? '下午待報到 (PM)' : '下午抵達 (PM)']: pm
    };
  };

  const groups = groupedAppointments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case '未結案': return '#6c757d';
      case '抵達': return 'var(--success-color)';
      case '完成': return '#0d6efd';
      case '取消': return 'var(--danger-color)';
      default: return '#e9ecee';
    }
  };

  return (
    <div className="fade-in">

      {/* Loading Spinner */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <div className="spinner" />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/kiosk')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          <ArrowLeft size={20} /> 返回
        </button>
        <h2 style={{ margin: 0 }}>
          {activeTab === 'checkin' && '訪客報到'}
          {activeTab === 'checkout' && '辦理離場'}
          {activeTab === 'history' && '歷史查詢'}
        </h2>
        <div style={{ width: '100px' }}></div>
      </div>

      {/* Check-in Specific: Walk-in Button */}
      {activeTab === 'checkin' && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/kiosk/walkin')}
            style={{
              padding: '20px 40px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '15px'
            }}
          >
            <UserPlus size={32} />
            臨時訪客登記
          </button>
        </div>
      )}

      {/* History Specific: Date Picker & Export */}
      {activeTab === 'history' && (
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>選擇日期:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
            />
          </div>
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <Download size={18} />
            匯出預約紀錄
          </button>
        </div>
      )}

      {/* List View */}
      {Object.entries(groups).map(([groupName, groupApps]) => (
        <div key={groupName} style={{ marginBottom: '30px' }}>
          {activeTab !== 'history' && (
            <h3 style={{
              borderBottom: '2px solid var(--primary-color)',
              paddingBottom: '10px',
              marginBottom: '15px',
              color: 'var(--primary-color)'
            }}>
              {groupName}
            </h3>
          )}

          {groupApps.length === 0 ? (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>無紀錄</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>單位</th>
                  {activeTab !== 'checkout' && <th>訪客</th>}
                  <th>接待窗口</th>
                  <th>
                    {activeTab === 'checkin' ? '預計抵達時間' :
                      activeTab === 'checkout' ? '實際進入時間' : '時段'}
                  </th>
                  {activeTab === 'history' && <th>狀態</th>}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {groupApps.map(app => (
                  <tr key={app.id}>
                    <td>{app.visitor.vendorName}</td>
                    {activeTab !== 'checkout' && <td>{app.visitor.contactName}</td>}
                    <td>{app.user.employeeName}</td>
                    <td style={{
                      fontSize: activeTab === 'checkin' ? '1.2rem' : '1rem',
                      fontWeight: activeTab === 'checkin' ? 'bold' : 'normal',
                      color: activeTab === 'checkin' ? 'var(--primary-color)' : 'inherit'
                    }}>
                      {activeTab === 'checkout' && app.actualEnterTime
                        ? new Date(app.actualEnterTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
                        : new Date(app.scheduleStartTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
                      }
                    </td>
                    {activeTab === 'history' && (
                      <td>
                        <span
                          style={{
                            padding: '5px 10px',
                            borderRadius: '4px',
                            backgroundColor: getStatusColor(app.status.name),
                            color: 'white',
                            fontSize: '0.85rem',
                            display: 'inline-block'
                          }}
                        >
                          {app.status.name}
                        </span>
                      </td>
                    )}
                    <td>
                      {activeTab === 'checkin' && (
                        <button
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => handleSignIn(app.id)}
                        >
                          <LogIn size={18} />
                          報到
                        </button>
                      )}
                      {activeTab === 'checkout' && (
                        <button
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => handleCheckOut(app.id)}
                        >
                          <LogOut size={18} />
                          離場
                        </button>
                      )}
                      {activeTab === 'history' && (
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => handleViewDetails(app)}
                        >
                          <Eye size={16} />
                          查看
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}

      {/* Details Modal */}
      {selectedAppointment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={closeDetailsModal}
        >
          <div
            className="card"
            style={{
              width: '500px',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              margin: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>訪客簽名紀錄</h2>

            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p><strong>單位名稱:</strong> {selectedAppointment.visitor.vendorName}</p>
              <p><strong>訪客姓名:</strong> {selectedAppointment.visitor.contactName}</p>
              <p><strong>訪問時段:</strong> {new Date(selectedAppointment.scheduleStartTime).toLocaleString('zh-TW')}</p>
            </div>


            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
              {/* 訪客進入簽名 */}
              <div>
                <h3>訪客進入簽名</h3>
                <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px', minHeight: '150px', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {selectedAppointment.signatures?.visitorCheckIn ? (
                    <img src={selectedAppointment.signatures.visitorCheckIn} alt="Visitor Check-in Signature" style={{ maxWidth: '100%', maxHeight: '130px' }} />
                  ) : (
                    <p style={{ color: '#6c757d' }}>No signature data available</p>
                  )}
                </div>
                {selectedAppointment.actualEnterTime && (
                  <p style={{ marginTop: '10px', color: '#6c757d' }}>
                    <strong>簽名時間:</strong> {new Date(selectedAppointment.actualEnterTime).toLocaleString('zh-TW')}
                  </p>
                )}
              </div>

              {/* 訪客離開簽名 */}
              <div>
                <h3>訪客離開簽名</h3>
                <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px', minHeight: '150px', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {selectedAppointment.signatures?.visitorCheckOut ? (
                    <img src={selectedAppointment.signatures.visitorCheckOut} alt="Visitor Check-out Signature" style={{ maxWidth: '100%', maxHeight: '130px' }} />
                  ) : (
                    <p style={{ color: '#6c757d' }}>No signature data available</p>
                  )}
                </div>
                {selectedAppointment.actualEndTime && (
                  <p style={{ marginTop: '10px', color: '#6c757d' }}>
                    <strong>簽名時間:</strong> {new Date(selectedAppointment.actualEndTime).toLocaleString('zh-TW')}
                  </p>
                )}
              </div>

              {/* 警衛確認離場簽名 */}
              <div>
                <h3>警衛確認離場簽名</h3>
                <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px', minHeight: '150px', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {selectedAppointment.signatures?.guardCheckOut ? (
                    <img src={selectedAppointment.signatures.guardCheckOut} alt="Guard Check-out Signature" style={{ maxWidth: '100%', maxHeight: '130px' }} />
                  ) : (
                    <p style={{ color: '#6c757d' }}>No signature data available</p>
                  )}
                </div>
                {selectedAppointment.actualEndTime && (
                  <p style={{ marginTop: '10px', color: '#6c757d' }}>
                    <strong>確認時間:</strong> {new Date(selectedAppointment.actualEndTime).toLocaleString('zh-TW')}
                  </p>
                )}
              </div>
            </div>


            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-primary"
                onClick={closeDetailsModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
