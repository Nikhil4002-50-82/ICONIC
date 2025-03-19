import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react'; // If using Clerk for authentication
import supabase from '../utils/supabase';

const DoctorDashboard = () => {
  const { state } = useLocation();
  const { user, isLoaded } = useUser(); // Clerk authentication
  const doctorId = state?.doctorId || (isLoaded ? user?.id : null);

  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [newPatient, setNewPatient] = useState({ email: '', name: '', patientId: '' });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (!doctorId) {
          setError('Doctor ID is not available');
          return;
        }

        const { data, error } = await supabase
          .from('doctor_patients')
          .select('*')
          .eq('doctor_id', doctorId);

        if (error) throw error;

        setPatients(data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError(error.message || 'Error fetching patients');
      }
    };

    if (doctorId) fetchPatients();
  }, [doctorId]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (!doctorId) {
        setError('Doctor ID is missing');
        return;
      }

      const { data, error } = await supabase
        .from('doctor_patients')
        .insert([{ doctor_id: doctorId, ...newPatient }])
        .select()
        .single();

      if (error) throw error;

      setPatients([...patients, data]);
      setSuccessMessage('Patient added successfully!');
      setNewPatient({ email: '', name: '', patientId: '' });
    } catch (error) {
      console.error('Error adding patient:', error);
      setError(error.message || 'Error adding patient');
    }
  };

  const handleManageReminders = (patientId) => {
    window.localStorage.setItem('activePatientId', patientId);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold text-center text-brightRed mb-8">Doctor Dashboard</h1>

      {/* Add Patient Form */}
      <div className="w-full max-w-4xl mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-brightRed mb-4">Add New Patient</h2>
        {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
        {error && !patients.length && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleAddPatient} className="space-y-4">
          <div>
            <label className="block text-lg font-medium">Patient Email</label>
            <input
              type="email"
              value={newPatient.email}
              onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter patient’s email"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-medium">Patient Name</label>
            <input
              type="text"
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter patient’s name (optional)"
            />
          </div>
          <div>
            <label className="block text-lg font-medium">Patient ID</label>
            <input
              type="text"
              value={newPatient.patientId}
              onChange={(e) => setNewPatient({ ...newPatient, patientId: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter unique patient ID (optional)"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-brightRed text-white rounded hover:bg-red-700"
          >
            Add Patient
          </button>
        </form>
      </div>

      {/* Patient List */}
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-brightRed mb-4">Assigned Patients</h2>
        {error && patients.length === 0 ? (
          <p className="text-center text-red-600">{error}</p>
        ) : patients.length === 0 ? (
          <p className="text-center text-gray-600">No patients assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {patients.map((patient) => (
              <div
                key={patient.patientId}
                className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center"
              >
                <p className="text-lg font-medium">{patient.name} (ID: {patient.patientId})</p>
                <div>
                  <Link
                    to={`/report`}
                    state={{ userId: patient.patientId }}
                    className="text-brightRed hover:underline mr-4"
                  >
                    View Report
                  </Link>
                  <Link
                    to={`/reminder`}
                    state={{ patientId: patient.patientId, isDoctor: true }}
                    className="text-brightRed hover:underline"
                    onClick={() => handleManageReminders(patient.patientId)}
                  >
                    Manage Reminders
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
