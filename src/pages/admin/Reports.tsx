import React, { useEffect, useState } from 'react';
import { getTodayAppointments } from '../../services/api';

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
}

const Reports: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadAppointments();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [appointments, searchTerm, statusFilter, dateFrom, dateTo]);

    const loadAppointments = async () => {
        try {
            const data = await getTodayAppointments();
            setAppointments(data);
        } catch (error) {
            console.error('Failed to load appointments', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...appointments];

        // Search filter (visitor name or company)
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(app =>
                app.visitor.contactName.toLowerCase().includes(lowerSearch) ||
                app.visitor.vendorName.toLowerCase().includes(lowerSearch)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status.name === statusFilter);
        }

        // Date range filter
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(app =>
                new Date(app.scheduleStartTime) >= fromDate
            );
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(app =>
                new Date(app.scheduleStartTime) <= toDate
            );
        }

        setFilteredAppointments(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFrom('');
        setDateTo('');
    };

    const exportToCSV = () => {
        // Define headers
        const headers = ['ID', '日期', '時段', '單位', '訪客', '接待人', '狀態', '進入時間', '離開時間'];
        
        // Map data to rows
        const rows = filteredAppointments.map(app => [
            app.id,
            new Date(app.scheduleStartTime).toLocaleDateString('zh-TW'),
            new Date(app.scheduleStartTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
            app.visitor.vendorName,
            app.visitor.contactName,
            app.user.employeeName,
            app.status.name,
            app.actualEnterTime ? new Date(app.actualEnterTime).toLocaleString('zh-TW') : '',
            app.actualEndTime ? new Date(app.actualEndTime).toLocaleString('zh-TW') : ''
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `visitor_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

    const getStatusColor = (status: string) => {
        switch (status) {
            case '未結案': return '#6c757d';
            case '抵達': return 'var(--success-color)';
            case '完成': return '#0d6efd';
            case '取消': return 'var(--danger-color)';
            default: return '#e9ecef';
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>報表管理</h2>
                <button
                    className="btn-primary"
                    onClick={exportToCSV}
                    disabled={filteredAppointments.length === 0}
                >
                    匯出報表 (CSV)
                </button>
            </div>

            {/* Search and Filters */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>設定篩選條件</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                    {/* Search Box */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            搜尋
                        </label>
                        <input
                            type="text"
                            placeholder="訪客姓名或單位..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '90%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            狀態
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                width: '90%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="all">所有狀態</option>
                            <option value="未結案">未結案</option>
                            <option value="抵達">抵達</option>
                            <option value="完成">完成</option>
                            <option value="取消">取消</option>
                        </select>
                    </div>

                    {/* Date From */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            開始日期
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            style={{
                                width: '90%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            截止日期
                        </label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            style={{
                                width: '90%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>

                {/* Filter Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                        顯示 {currentItems.length} of {filteredAppointments.length} 筆資料
                        {filteredAppointments.length !== appointments.length && ` (從 ${appointments.length} 筆總資料中篩選)`}
                    </div>
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
                        清除篩選
                    </button>
                </div>
            </div>

            {/* Appointments Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <thead style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>日期</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>時段</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>單位</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>訪客</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>接待人</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>狀態</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>進入時間</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>離開時間</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                    沒有找到符合條件的資料
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((app) => (
                                <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px' }}>
                                        {new Date(app.scheduleStartTime).toLocaleString('zh-TW', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        {new Date(app.scheduleStartTime).toLocaleString('zh-TW', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td style={{ padding: '15px' }}>{app.visitor.vendorName}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{app.visitor.contactName}</td>
                                    <td style={{ padding: '15px' }}>{app.user.employeeName}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            backgroundColor: getStatusColor(app.status.name),
                                            color: 'white',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {app.status.name}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', fontSize: '0.9rem', color: '#555' }}>
                                        {app.actualEnterTime ? new Date(app.actualEnterTime).toLocaleString('zh-TW', {
                                            month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        }) : '-'}
                                    </td>
                                    <td style={{ padding: '15px', fontSize: '0.9rem', color: '#555' }}>
                                        {app.actualEndTime ? new Date(app.actualEndTime).toLocaleString('zh-TW', {
                                            month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        }) : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '20px',
                    gap: '10px'
                }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: currentPage === 1 ? '#e9ecef' : 'var(--primary-color)',
                            color: currentPage === 1 ? '#6c757d' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        上一頁
                    </button>

                    <span style={{ padding: '0 15px', color: '#6c757d' }}>
                        第 {currentPage} 頁 of {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: currentPage === totalPages ? '#e9ecef' : 'var(--primary-color)',
                            color: currentPage === totalPages ? '#6c757d' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        下一頁
                    </button>
                </div>
            )}
        </div>
    );
};

export default Reports;
