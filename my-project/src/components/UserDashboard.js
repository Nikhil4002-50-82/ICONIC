import { useEffect, useState } from "react";
import supabase from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import PrescriptionUpload from "./PrescriptionUpload";

const UserDashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("medicines")
        .select("id, name, dosage, time, status")
        .eq("user_id", (await supabase.auth.getUser()).data.user.id);

      if (error) console.error("Error fetching medicines:", error);
      setMedicines(data || []);
      setLoading(false);
    };

    fetchMedicines();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">My Medicines</h2>
      {loading ? (
        <p>Loading...</p>
      ) : medicines.length === 0 ? (
        <div className="text-center">
          <p>You have no medicines listed.</p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Upload Prescription
          </button>
        </div>
      ) : (
        <ul className="bg-white shadow rounded-lg p-4">
          {medicines.map((med) => (
            <li key={med.id} className="p-3 border-b">
              <h3 className="font-medium">{med.name} ({med.dosage})</h3>
              <p className="text-sm text-gray-500">Time: {med.time}</p>
              <p className={`text-sm font-semibold ${med.status === "taken" ? "text-green-500" : "text-red-500"}`}>
                Status: {med.status}
              </p>
            </li>
          ))}
        </ul>
      )}

      {showUpload && <PrescriptionUpload onClose={() => setShowUpload(false)} />}
    </div>
  );
};

export default UserDashboard;
