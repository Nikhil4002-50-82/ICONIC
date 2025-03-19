import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import supabase from '../utils/supabase';

const Reminder = () => {
  const location = useLocation();
  const { patientId, isDoctor = false } = location.state || {};
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: '', dose: '', time: '', frequency: 0 });
  const [error, setError] = useState('');
  const [activePatientId, setActivePatientId] = useState(null);
  const [alarmTriggered, setAlarmTriggered] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('User not authenticated');
        return;
      }
      const userId = session.user.id;

      const storedPatientId = localStorage.getItem('activePatientId');
      const initialPatientId = isDoctor ? patientId : storedPatientId || null;
      setActivePatientId(initialPatientId);

      if (!isDoctor && !initialPatientId) {
        const { data, error } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error) {
          setError('Failed to fetch patient data');
          return;
        }
        setActivePatientId(data.id);
        localStorage.setItem('activePatientId', data.id);
      }
    };

    fetchSession();
  }, [isDoctor, patientId]);

  useEffect(() => {
    const fetchMedicines = async () => {
      if (!activePatientId) return;

      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('patient_id', activePatientId);

      if (error) {
        setError('Failed to fetch medicines');
      } else {
        setMedicines(data.map(med => ({
          ...med,
          timeLeft: calculateTimeLeft(med.time),
        })));
      }
    };

    fetchMedicines();
  }, [activePatientId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMedicines((prev) =>
        prev.map((med) => {
          if (med.timeLeft > 0) {
            const newTimeLeft = med.timeLeft - 1;
            if (newTimeLeft === 0 && !isDoctor) {
              setAlarmTriggered(med.name);
            }
            return { ...med, timeLeft: newTimeLeft };
          }
          return med;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isDoctor]);

  const calculateTimeLeft = (time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);
    if (reminderTime < now) reminderTime.setDate(reminderTime.getDate() + 1);
    return Math.max(0, Math.floor((reminderTime - now) / 1000));
  };

  const formatTimeLeft = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMedicineIntake = async (medicineName, taken) => {
    await supabase.from('medicine_intake').insert([
      { patient_id: activePatientId, medicine_name: medicineName, taken },
    ]);

    setAlarmTriggered(null);
    setMedicines((prev) =>
      prev.map((med) =>
        med.name === medicineName ? { ...med, timeLeft: calculateTimeLeft(med.time) } : med
      )
    );
  };

  const addMedicine = async () => {
    if (!newMedicine.name || !newMedicine.dose || !newMedicine.time || !newMedicine.frequency) {
      alert('Please fill all fields');
      return;
    }

    const newMed = { ...newMedicine, patient_id: activePatientId };
    const { error } = await supabase.from('medicines').insert([newMed]);

    if (error) {
      setError('Failed to add medicine');
      return;
    }

    setMedicines([...medicines, { ...newMedicine, timeLeft: calculateTimeLeft(newMedicine.time) }]);
    setNewMedicine({ name: '', dose: '', time: '', frequency: 0 });
  };

  const removeMedicine = async (medicineId) => {
    const { error } = await supabase.from('medicines').delete().eq('id', medicineId);

    if (error) {
      setError('Failed to remove medicine');
      return;
    }

    setMedicines(medicines.filter((med) => med.id !== medicineId));
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-r from-red-100 via-purple-100 to-pink-100">
        <div className="rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-center text-red-500 mb-8">Medicine Reminder</h1>
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div>
            <h2 className="text-2xl font-semibold text-red-500 mb-4">Medicine Schedule</h2>
            {medicines.length === 0 ? (
              <p className="text-gray-500 text-center">No medicines scheduled.</p>
            ) : (
              medicines.map((medicine) => (
                <div key={medicine.id} className="flex items-center justify-between p-4 bg-blue-100 rounded-lg shadow-md">
                  <div className="flex items-center space-x-4">
                    <FaBell className="text-red-500" />
                    <div>
                      <p className="text-lg font-medium">{medicine.name}</p>
                      <p className="text-sm text-gray-600">Dose: {medicine.dose}</p>
                      <p className="text-sm text-gray-600">Time: {medicine.time}</p>
                      <p className="text-sm text-gray-600">Frequency: {medicine.frequency}</p>
                    </div>
                  </div>
                  <p className="text-lg font-mono text-indigo-600">
                    {medicine.timeLeft > 0 ? formatTimeLeft(medicine.timeLeft) : 'Time’s Up!'}
                  </p>
                  {isDoctor && (
                    <button onClick={() => removeMedicine(medicine.id)} className="text-red-600 hover:underline">
                      Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {isDoctor && (
            <button onClick={addMedicine} className="bg-red-500 text-white p-2 rounded mt-4">
              Add Medicine
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Reminder;
