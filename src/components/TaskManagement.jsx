import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2, Check, User, Calendar, AlertCircle } from 'lucide-react';

export default function TaskManagement({ currentUser, allUsers, customers, quotes }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToUserId: '',
    priority: 'Orta',
    status: 'Bekliyor',
    dueDate: '',
    relatedCustomerId: '',
    relatedQuoteId: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.ok) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Görevler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const assignedUser = allUsers.find(u => u.id === formData.assignedToUserId);
    
    const taskData = {
      ...formData,
      assignedToUserName: assignedUser?.name || '',
      createdByUserId: currentUser?.id,
      createdByUserName: currentUser?.name,
      taskId: editingTask?.TaskId || `TSK-${Date.now()}`
    };

    try {
      const url = editingTask 
        ? `/api/tasks/${editingTask.TaskId}`
        : '/api/tasks';
      
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      const result = await response.json();
      
      if (result.ok) {
        fetchTasks();
        resetForm();
      }
    } catch (error) {
      console.error('Görev kaydedilemedi:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.Title,
      description: task.Description || '',
      assignedToUserId: task.AssignedToUserId || '',
      priority: task.Priority,
      status: task.Status,
      dueDate: task.DueDate ? task.DueDate.split('T')[0] : '',
      relatedCustomerId: task.RelatedCustomerId || '',
      relatedQuoteId: task.RelatedQuoteId || ''
    });
    setShowForm(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      
      if (result.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Görev durumu güncellenemedi:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Görev silinemedi:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedToUserId: '',
      priority: 'Orta',
      status: 'Bekliyor',
      dueDate: '',
      relatedCustomerId: '',
      relatedQuoteId: ''
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.Status === filterStatus;
    const assigneeMatch = filterAssignee === 'all' || task.AssignedToUserId === filterAssignee;
    return statusMatch && assigneeMatch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Acil': return { bg: '#FEE2E2', text: '#991B1B', border: '#DC2626' };
      case 'Yüksek': return { bg: '#FFEDD5', text: '#9A3412', border: '#EA580C' };
      case 'Orta': return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' };
      case 'Düşük': return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' };
      default: return { bg: '#F3F4F6', text: '#374151', border: '#6B7280' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Tamamlandı': return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' };
      case 'Devam Ediyor': return { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' };
      case 'Bekliyor': return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' };
      case 'İptal': return { bg: '#F3F4F6', text: '#374151', border: '#6B7280' };
      default: return { bg: '#F3F4F6', text: '#374151', border: '#6B7280' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Görevler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '16px', 
      paddingBottom: '80px', 
      maxWidth: '1200px', 
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h2 style={{ margin: 0, color: '#1F2937', fontSize: '20px', fontWeight: '600' }}>
          Görev Yönetimi
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            background: showForm ? '#EF4444' : '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          {showForm ? <><X size={18} /> İptal</> : <><Plus size={18} /> Yeni Görev</>}
        </button>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px', 
        marginBottom: '20px'
      }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="Bekliyor">Bekliyor</option>
          <option value="Devam Ediyor">Devam Ediyor</option>
          <option value="Tamamlandı">Tamamlandı</option>
          <option value="İptal">İptal</option>
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">Tüm Kullanıcılar</option>
          {allUsers.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

      {/* Task Form */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
            {editingTask ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Görev Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Görev başlığını girin"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  placeholder="Görev detaylarını girin"
                />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px' 
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    Atanan Kişi
                  </label>
                  <select
                    value={formData.assignedToUserId}
                    onChange={(e) => setFormData({ ...formData, assignedToUserId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Seçiniz...</option>
                    {allUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    Öncelik
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Düşük">Düşük</option>
                    <option value="Orta">Orta</option>
                    <option value="Yüksek">Yüksek</option>
                    <option value="Acil">Acil</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Bekliyor">Bekliyor</option>
                    <option value="Devam Ediyor">Devam Ediyor</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                    <option value="İptal">İptal</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  {editingTask ? 'Güncelle' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#F3F4F6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  İptal
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Task Count */}
      <div style={{ marginBottom: '16px', color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>
        {filteredTasks.length} Görev
      </div>

      {/* Tasks List */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {filteredTasks.map(task => {
          const priorityColors = getPriorityColor(task.Priority);
          const statusColors = getStatusColor(task.Status);
          
          return (
            <div
              key={task.TaskId}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Task Header */}
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '8px'
                }}>
                  {task.Title}
                </h3>
                {task.Description && (
                  <p style={{ 
                    margin: 0, 
                    fontSize: '13px', 
                    color: '#6B7280',
                    lineHeight: '1.5'
                  }}>
                    {task.Description}
                  </p>
                )}
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: statusColors.bg,
                  color: statusColors.text,
                  border: `1px solid ${statusColors.border}`
                }}>
                  {task.Status}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: priorityColors.bg,
                  color: priorityColors.text,
                  border: `1px solid ${priorityColors.border}`
                }}>
                  {task.Priority}
                </span>
              </div>

              {/* Task Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {task.AssignedToUserName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280' }}>
                    <User size={14} />
                    <span>{task.AssignedToUserName}</span>
                  </div>
                )}
                {task.DueDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280' }}>
                    <Calendar size={14} />
                    <span>{new Date(task.DueDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                )}
                {task.CreatedByUserName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9CA3AF' }}>
                    <AlertCircle size={14} />
                    <span>Oluşturan: {task.CreatedByUserName}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginTop: '4px',
                borderTop: '1px solid #E5E7EB',
                paddingTop: '12px'
              }}>
                <button
                  onClick={() => handleEdit(task)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  <Edit size={14} />
                  Düzenle
                </button>
                {task.Status !== 'Tamamlandı' && (
                  <button
                    onClick={() => handleStatusChange(task.TaskId, 'Tamamlandı')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    <Check size={14} />
                    Tamamla
                  </button>
                )}
                <button
                  onClick={() => handleDelete(task.TaskId)}
                  style={{
                    padding: '8px 12px',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#9CA3AF',
          fontSize: '14px'
        }}>
          Henüz görev bulunmuyor. Yeni görev oluşturmak için yukarıdaki butona tıklayın.
        </div>
      )}
    </div>
  );
}
