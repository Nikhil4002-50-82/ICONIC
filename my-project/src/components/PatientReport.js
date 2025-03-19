import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Bar } from "react-chartjs-2";

const PatientDashboard = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      const { data: patientData } = await supabase.from("patients").select("*").eq("id", id).single();
      setPatient(patientData);

      const { data: medData } = await supabase
        .from("medicines")
        .select("name, taken, missed")
        .eq("user_id", id);

      setMedicines(medData);

      const chartData = {
        labels: medData.map((m) => m.name),
        datasets: [
          { label: "Taken", data: medData.map((m) => m.taken), backgroundColor: "green" },
          { label: "Missed", data: medData.map((m) => m.missed), backgroundColor: "red" },
        ],
      };
      setReportData(chartData);
    };

    fetchPatientData();
  }, [id]);

  return (
    <div className="p-6">
      {patient ? (
        <>
          <h1 className="text-2xl font-bold">{patient.name}'s Dashboard</h1>
          <h2 className="text-lg font-semibold mt-4">Medicine Report</h2>
          {reportData ? <Bar data={reportData} /> : <p>Loading chart...</p>}
        </>
      ) : (
        <p>Loading patient data...</p>
      )}
    </div>
  );
};

export default PatientDashboard;
