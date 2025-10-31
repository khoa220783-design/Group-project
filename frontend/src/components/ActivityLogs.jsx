import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import './ActivityLogs.css';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        action: '',
        email: '',
        page: 1,
        limit: 20
    });
    const [pagination, setPagination] = useState(null);

    // Fetch logs
    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.action) params.append('action', filter.action);
            if (filter.email) params.append('email', filter.email);
            params.append('page', filter.page);
            params.append('limit', filter.limit);

            const response = await axiosInstance.get(`/api/admin/logs?${params.toString()}`);
            setLogs(response.data.logs);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/api/admin/logs/stats');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [filter.page, filter.action, filter.email]);

    // Action color mapping
    const getActionBadgeClass = (action) => {
        const actionMap = {
            'LOGIN_SUCCESS': 'success',
            'LOGIN_FAILED': 'danger',
            'LOGOUT': 'info',
            'SIGNUP': 'success',
            'PASSWORD_RESET_REQUEST': 'warning',
            'PASSWORD_RESET_SUCCESS': 'success',
            'AVATAR_UPLOAD': 'info',
            'PROFILE_UPDATE': 'info',
            'ROLE_CHANGED': 'warning',
            'USER_DELETED': 'danger',
            'ACCESS_DENIED': 'danger'
        };
        return actionMap[action] || 'secondary';
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="activity-logs-container">
            <div className="logs-header">
                <h2>📊 Activity Logs</h2>
                <p className="logs-subtitle">Ghi lại toàn bộ hoạt động của người dùng</p>
            </div>

            {/* Stats Section */}
            {stats && (
                <div className="logs-stats">
                    <div className="stat-card">
                        <div className="stat-number">{stats.totalLogs}</div>
                        <div className="stat-label">Tổng Logs</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.topUsers?.length || 0}</div>
                        <div className="stat-label">Active Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.actionStats?.length || 0}</div>
                        <div className="stat-label">Action Types</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="logs-filters">
                <div className="filter-group">
                    <label>Action:</label>
                    <select 
                        value={filter.action} 
                        onChange={(e) => setFilter({ ...filter, action: e.target.value, page: 1 })}
                    >
                        <option value="">Tất cả</option>
                        <option value="LOGIN_SUCCESS">Đăng nhập thành công</option>
                        <option value="LOGIN_FAILED">Đăng nhập thất bại</option>
                        <option value="LOGOUT">Đăng xuất</option>
                        <option value="SIGNUP">Đăng ký</option>
                        <option value="PASSWORD_RESET_REQUEST">Yêu cầu reset PW</option>
                        <option value="PASSWORD_RESET_SUCCESS">Reset PW thành công</option>
                        <option value="AVATAR_UPLOAD">Upload avatar</option>
                        <option value="ROLE_CHANGED">Thay đổi role</option>
                        <option value="USER_DELETED">Xóa user</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Email:</label>
                    <input
                        type="text"
                        placeholder="Tìm theo email..."
                        value={filter.email}
                        onChange={(e) => setFilter({ ...filter, email: e.target.value, page: 1 })}
                    />
                </div>
                <button className="btn-refresh" onClick={fetchLogs}>
                    🔄 Refresh
                </button>
            </div>

            {/* Logs Table */}
            {loading ? (
                <div className="logs-loading">⏳ Đang tải logs...</div>
            ) : (
                <>
                    <div className="logs-table-container">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Action</th>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>IP Address</th>
                                    <th>Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-logs">Không có logs nào</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id}>
                                            <td className="timestamp">{formatTimestamp(log.timestamp)}</td>
                                            <td>
                                                <span className={`badge badge-${getActionBadgeClass(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>{log.userId?.name || 'N/A'}</td>
                                            <td>{log.email || 'N/A'}</td>
                                            <td className="ip-address">{log.ipAddress || 'N/A'}</td>
                                            <td>
                                                {log.details && Object.keys(log.details).length > 0 && (
                                                    <details className="log-details">
                                                        <summary>Xem chi tiết</summary>
                                                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                                    </details>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="logs-pagination">
                            <button
                                className="btn-page"
                                disabled={filter.page === 1}
                                onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
                            >
                                ← Trước
                            </button>
                            <span className="page-info">
                                Trang {pagination.page} / {pagination.pages} ({pagination.total} logs)
                            </span>
                            <button
                                className="btn-page"
                                disabled={filter.page === pagination.pages}
                                onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Action Stats Chart (Simple) */}
            {stats && stats.actionStats && (
                <div className="action-stats-section">
                    <h3>📈 Thống kê theo Action</h3>
                    <div className="action-stats-list">
                        {stats.actionStats.map((stat) => (
                            <div key={stat._id} className="action-stat-item">
                                <span className="action-name">{stat._id}</span>
                                <div className="action-bar-wrapper">
                                    <div 
                                        className="action-bar" 
                                        style={{ width: `${(stat.count / stats.totalLogs) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="action-count">{stat.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityLogs;

