import { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", user.id);

      if (error) console.error("Error fetching patients:", error);
      else setPatients(data);
    };

    fetchPatients();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Doctor Dashboard</h1>
      <h2 className="text-lg font-semibold mb-2">My Patients</h2>
      <ul className="bg-white shadow-lg rounded-lg p-4">
        {patients.length > 0 ? (
          patients.map((patient) => (
            <li
              key={patient.id}
              onClick={() => navigate(`/patient/${patient.id}`)}
              className="cursor-pointer p-2 hover:bg-gray-200 rounded"
            >
              {patient.name}
            </li>
          ))
        ) : (
          <p>No assigned patients.</p>
        )}
      </ul>
    </div>
  );
};

export default DoctorDashboard;
