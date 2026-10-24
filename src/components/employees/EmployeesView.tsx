// src/components/employees/EmployeesView.tsx

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  Building2, 
  Phone, 
  Mail, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  Check, 
  X, 
  Palette, 
  Sparkles,
  Database,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee, UserRole } from '../../types';

// Paleta de presets visuales inspirados en el diseño de Zona P
const COLOR_PRESETS = [
  { name: 'Azul Cielo (Clásico)', bg: '#BAE6FD', text: '#0284C7', border: '#7DD3FC' },
  { name: 'Verde Esmeralda', bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
  { name: 'Fucsia / Magenta', bg: '#F0ABFC', text: '#701A75', border: '#E879F9' },
  { name: 'Ámbar Cálido', bg: '#FEF3C7', text: '#78350F', border: '#FDE68A' },
  { name: 'Naranja Vibrante', bg: '#FED7AA', text: '#7C2D12', border: '#FDBA74' },
  { name: 'Rosa Pastel', bg: '#FECDD3', text: '#881337', border: '#FDA4AF' },
  { name: 'Cian Profundo', bg: '#E0F7FA', text: '#006064', border: '#B2EBF2' },
  { name: 'Índigo Corporativo', bg: '#C7D2FE', text: '#312E81', border: '#A5B4FC' },
  { name: 'Púrpura Intenso', bg: '#E9D5FF', text: '#581C87', border: '#D8B4FE' },
  { name: 'Pizarra Neutro', bg: '#F1F5F9', text: '#0F172A', border: '#CBD5E1' },
];

export const EmployeesView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    puestoAssignments,
    employeeWeeklyLabor,
    currentRole
  } = useApp();

  // Filtros locales
  const [searchTerm, setSearchTerm] = useState('');
  const [sedeFilter, setSedeFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Employee | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    cedula: '',
    role: 'Operario de Parqueadero',
    systemRole: 'operator' as UserRole,
    sedeDefault: 1 as 1 | 2 | 3,
    phone: '',
    email: '',
    colorBg: '#BAE6FD',
    colorText: '#0284C7',
    colorBorder: '#7DD3FC'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Abrir modal para crear
  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      cedula: '',
      role: 'Operario de Parqueadero',
      systemRole: 'operator',
      sedeDefault: 1,
      phone: '+57 300 000 0000',
      email: '',
      colorBg: '#BAE6FD',
      colorText: '#0284C7',
      colorBorder: '#7DD3FC'
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      cedula: emp.cedula,
      role: emp.role,
      systemRole: emp.systemRole || 'operator',
      sedeDefault: emp.sedeDefault,
      phone: emp.phone,
      email: emp.email,
      colorBg: emp.colorBg || '#BAE6FD',
      colorText: emp.colorText || '#0284C7',
      colorBorder: emp.colorBorder || '#7DD3FC'
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Validar y guardar (alta o edición)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'El nombre completo es obligatorio';
    if (!formData.cedula.trim()) errors.cedula = 'El número de cédula es obligatorio';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingEmployee) {
      // Actualizar
      await updateEmployee(editingEmployee.id, {
        name: formData.name.trim(),
        cedula: formData.cedula.trim(),
        role: formData.role.trim(),
        systemRole: formData.systemRole,
        sedeDefault: formData.sedeDefault,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        colorBg: formData.colorBg,
        colorText: formData.colorText,
        colorBorder: formData.colorBorder
      });
    } else {
      // Crear nuevo
      await addEmployee({
        name: formData.name.trim(),
        cedula: formData.cedula.trim(),
        role: formData.role.trim(),
        systemRole: formData.systemRole,
        sedeDefault: formData.sedeDefault,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        active: true,
        colorBg: formData.colorBg,
        colorText: formData.colorText,
        colorBorder: formData.colorBorder
      });
    }

    setIsFormModalOpen(false);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    await deleteEmployee(deleteConfirmTarget.id);
    setDeleteConfirmTarget(null);
  };

  // Calcular turnos asignados a un empleado en la semana
  const getEmployeeActiveAssignmentsCount = (empId: string) => {
    return puestoAssignments.filter(a => a.employeeId === empId).length;
  };

  // Empleados filtrados
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSede = sedeFilter === 'all' || emp.sedeDefault === sedeFilter;
      const matchesRole = roleFilter === 'all' || 
        (roleFilter === 'operator' && (emp.systemRole === 'operator' || !emp.systemRole)) ||
        (roleFilter === 'coordinator' && emp.systemRole === 'coordinator') ||
        (roleFilter === 'admin' && emp.systemRole === 'admin');

      return matchesSearch && matchesSede && matchesRole;
    });
  }, [employees, searchTerm, sedeFilter, roleFilter]);

  // Sedes nombres y colores
  const sedeLabels: Record<1 | 2 | 3, { name: string; dot: string; badge: string }> = {
    1: { name: 'S1 Centro', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    2: { name: 'S2 Norte', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    3: { name: 'S3 Laureles', dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const isAllowedToManage = currentRole === 'admin' || currentRole === 'coordinator' || currentRole === 'hr_auditor';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Gestión de Personal & Empleados
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-600" />
              SQLite Activo
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Directorio de operarios, cajeros y supervisores de Zona P • Modificaciones sincronizadas en tiempo real con <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono text-xs">database/zonap.db</code>.
          </p>
        </div>

        {/* Primary Action Button */}
        {isAllowedToManage && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all shadow-emerald-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Empleado</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Empleados</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{employees.length}</div>
          <span className="text-[11px] text-slate-400">Activos en nómina</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Sede 1 Centro</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-extrabold text-blue-700">
            {employees.filter(e => e.sedeDefault === 1).length}
          </div>
          <span className="text-[11px] text-slate-400">Operarios sede Centro</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Sede 2 Norte</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {employees.filter(e => e.sedeDefault === 2).length}
          </div>
          <span className="text-[11px] text-slate-400">Operarios sede Norte</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Sede 3 Laureles</span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </div>
          <div className="text-2xl font-extrabold text-purple-700">
            {employees.filter(e => e.sedeDefault === 3).length}
          </div>
          <span className="text-[11px] text-slate-400">Operarios sede Laureles</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, cédula o cargo..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sede Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Sede:</span>
          <button
            onClick={() => setSedeFilter('all')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              sedeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({employees.length})
          </button>
          <button
            onClick={() => setSedeFilter(1)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              sedeFilter === 1
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Centro ({employees.filter(e => e.sedeDefault === 1).length})
          </button>
          <button
            onClick={() => setSedeFilter(2)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              sedeFilter === 2
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Norte ({employees.filter(e => e.sedeDefault === 2).length})
          </button>
          <button
            onClick={() => setSedeFilter(3)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              sedeFilter === 3
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Laureles ({employees.filter(e => e.sedeDefault === 3).length})
          </button>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none focus:border-emerald-500"
          >
            <option value="all">Todos los Roles de Sistema</option>
            <option value="operator">👷 Operarios</option>
            <option value="coordinator">👔 Coordinadores</option>
            <option value="admin">🛡️ Administradores</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Cargo & Permiso</th>
                <th className="py-3 px-4">Sede Principal</th>
                <th className="py-3 px-4">Contacto (WhatsApp / Correo)</th>
                <th className="py-3 px-4 text-center">Píldora en Malla</th>
                <th className="py-3 px-4 text-center">Horas Semana (Tope 42h)</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-medium text-slate-600">No se encontraron empleados</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Prueba cambiando los filtros o la búsqueda.</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const labor = employeeWeeklyLabor[emp.id] || { totalHours: 0, isOverLimit: false, percentageOfCapacity: 0 };
                  const activeShiftsCount = getEmployeeActiveAssignmentsCount(emp.id);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Cédula */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border"
                            style={{ 
                              backgroundColor: emp.colorBg || '#BAE6FD', 
                              color: emp.colorText || '#0284C7',
                              borderColor: emp.colorBorder || '#7DD3FC'
                            }}
                          >
                            {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{emp.name}</div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                              <CreditCard className="w-3 h-3" />
                              <span>CC: {emp.cedula}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cargo & System Role */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{emp.role}</div>
                        <div className="mt-0.5">
                          {emp.systemRole === 'admin' ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              🛡️ Admin
                            </span>
                          ) : emp.systemRole === 'coordinator' ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                              👔 Coordinador
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              👷 Operario
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sede */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sedeLabels[emp.sedeDefault].badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sedeLabels[emp.sedeDefault].dot}`}></span>
                          {sedeLabels[emp.sedeDefault].name}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{emp.phone || 'Sin registrar'}</span>
                          </div>
                          {emp.email && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[180px]">{emp.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Color Badge Preview in Schedule */}
                      <td className="py-3 px-4 text-center">
                        <div 
                          className="inline-block px-2.5 py-1 rounded text-xs font-semibold shadow-2xs border truncate max-w-[140px]"
                          style={{
                            backgroundColor: emp.colorBg || '#BAE6FD',
                            color: emp.colorText || '#0284C7',
                            borderColor: emp.colorBorder || '#7DD3FC'
                          }}
                          title={`Color de celda en la malla para ${emp.name}`}
                        >
                          {emp.name.split(' ')[0]} (06-14)
                        </div>
                      </td>

                      {/* Weekly Capacity Bar */}
                      <td className="py-3 px-4">
                        <div className="w-36 mx-auto space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`font-semibold ${labor.isOverLimit ? 'text-red-700' : 'text-slate-700'}`}>
                              {labor.totalHours.toFixed(1)}h / 42h
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {activeShiftsCount} {activeShiftsCount === 1 ? 'turno' : 'turnos'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                labor.isOverLimit 
                                  ? 'bg-red-500' 
                                  : labor.percentageOfCapacity > 85 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(labor.percentageOfCapacity, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            disabled={!isAllowedToManage}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Editar datos del empleado"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => setDeleteConfirmTarget(emp)}
                            disabled={!isAllowedToManage}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Eliminar empleado de SQLite"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with summary */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500 flex items-center justify-between">
          <span>Mostrando <strong>{filteredEmployees.length}</strong> de <strong>{employees.length}</strong> colaboradores</span>
          <span className="text-[11px] text-slate-400">Preservación de auditoría inmutable de novedades (RF-03)</span>
        </div>
      </div>

      {/* --- MODAL DE CREACIÓN / EDICIÓN --- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  {editingEmployee ? <Edit3 className="w-4 h-4 text-emerald-700" /> : <UserPlus className="w-4 h-4 text-emerald-700" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingEmployee ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Se guardará de forma permanente en <span className="font-mono text-emerald-700">database/zonap.db</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Nombres */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Carlos Alberto Restrepo"
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg outline-none transition-all ${
                    formErrors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'
                  }`}
                />
                {formErrors.name && <p className="text-[11px] text-red-500 mt-1">{formErrors.name}</p>}
              </div>

              {/* Cédula & Teléfono */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cédula / Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    placeholder="Ej: 1.036.789.123"
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg outline-none transition-all ${
                      formErrors.cedula ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                  {formErrors.cedula && <p className="text-[11px] text-red-500 mt-1">{formErrors.cedula}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono (WhatsApp n8n)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 312 000 0000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Cargo & Sede */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo Operativo
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Ej: Operario de Puesto"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sede Asignada
                  </label>
                  <select
                    value={formData.sedeDefault}
                    onChange={(e) => setFormData({ ...formData, sedeDefault: Number(e.target.value) as 1 | 2 | 3 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  >
                    <option value={1}>Parqueadero S1 Centro</option>
                    <option value={2}>Parqueadero S2 Norte</option>
                    <option value={3}>Parqueadero S3 Laureles</option>
                  </select>
                </div>
              </div>

              {/* Email & Rol en el sistema */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ejemplo@zonap.co"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rol de Sistema
                  </label>
                  <select
                    value={formData.systemRole}
                    onChange={(e) => setFormData({ ...formData, systemRole: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  >
                    <option value="operator">👷 Operario (Consulta)</option>
                    <option value="coordinator">👔 Coordinador de Sede</option>
                    <option value="hr_auditor">📋 Auditor RRHH</option>
                    <option value="admin">🛡️ Administrador General</option>
                  </select>
                </div>
              </div>

              {/* Selector de Paleta de Color para la Celda de Turno */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-emerald-600" />
                    Color de Bloque en Malla
                  </label>
                  {/* Vista Previa en Vivo */}
                  <div 
                    className="px-2.5 py-1 rounded text-xs font-bold border shadow-2xs"
                    style={{
                      backgroundColor: formData.colorBg,
                      color: formData.colorText,
                      borderColor: formData.colorBorder
                    }}
                  >
                    {formData.name.split(' ')[0] || 'Operario'} (06-14)
                  </div>
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PRESETS.map((preset, idx) => {
                    const isSelected = formData.colorBg === preset.bg;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          colorBg: preset.bg,
                          colorText: preset.text,
                          colorBorder: preset.border
                        })}
                        className={`p-2 rounded-lg text-center text-[10px] font-bold border transition-all flex flex-col items-center justify-center relative ${
                          isSelected ? 'ring-2 ring-emerald-600 shadow-xs' : 'hover:opacity-90'
                        }`}
                        style={{
                          backgroundColor: preset.bg,
                          color: preset.text,
                          borderColor: preset.border
                        }}
                        title={preset.name}
                      >
                        {isSelected && (
                          <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                            <Check className="w-2 h-2" />
                          </span>
                        )}
                        <span>{preset.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg shadow-sm transition-all"
                >
                  {editingEmployee ? 'Guardar Cambios' : 'Guardar en SQLite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="font-bold text-slate-900 text-lg">
                  ¿Eliminar a {deleteConfirmTarget.name}?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Esta acción desvinculará a este colaborador y liberará{' '}
                  <strong className="text-red-700">
                    {getEmployeeActiveAssignmentsCount(deleteConfirmTarget.id)} turnos
                  </strong>{' '}
                  asignados en la malla de turnos semanal para mantener la consistencia en SQLite.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Cédula:</span>
                  <span className="font-semibold text-slate-800">{deleteConfirmTarget.cedula}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cargo:</span>
                  <span className="font-semibold text-slate-800">{deleteConfirmTarget.role}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sede:</span>
                  <span className="font-semibold text-slate-800">{sedeLabels[deleteConfirmTarget.sedeDefault].name}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="w-1/2 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg shadow-sm transition-all"
                >
                  Eliminar Empleado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};