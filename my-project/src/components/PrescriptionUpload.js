import { useState } from "react";
import supabase from "../../utils/supabase";
import axios from "axios";

const GOOGLE_GEMINI_API_KEY = "AIzaSyDqZrwIe4rdHnHYfOf2eKG4uvbUeyTsVuc";

const PrescriptionUpload = ({ onClose }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image first.");

    setLoading(true);
    
    // 1️⃣ Upload image to Supabase Storage
    const { data, error } = await supabase.storage
      .from("prescriptions")
      .upload(`prescriptions/${Date.now()}-${image.name}`, image);

    if (error) {
      alert("Failed to upload image");
      setLoading(false);
      return;
    }

    // Get public URL of the uploaded image
    const imageUrl = supabase.storage.from("prescriptions").getPublicUrl(data.path).data.publicUrl;

    // 2️⃣ Extract text from image using OCR API
    const ocrResponse = await axios.post("https://api.ocr.space/parse/image", {
      apikey: "YOUR_OCR_API_KEY", // Replace with your OCR API key
      url: imageUrl,
    });

    if (!ocrResponse.data.ParsedResults) {
      alert("Failed to extract text");
      setLoading(false);
      return;
    }

    const extractedText = ocrResponse.data.ParsedResults[0].ParsedText;
    
    // 3️⃣ Call Google Gemini API to extract structured medicine details
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        prompt: `Extract structured medicine details from the following text. Format response as JSON with fields: "name", "dosage", "time".\n\nText: ${extractedText}`,
        max_tokens: 200,
      }
    );

    if (!geminiResponse.data || !geminiResponse.data.candidates) {
      alert("Failed to process prescription");
      setLoading(false);
      return;
    }

    try {
      const extractedMedicines = JSON.parse(geminiResponse.data.candidates[0].output);
      setMedicines(extractedMedicines);
    } catch (err) {
      alert("Error parsing AI response");
    }

    setLoading(false);
  };

  const saveMedicines = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user || medicines.length === 0) return;

    const medicineEntries = medicines.map((med) => ({
      user_id: user.id,
      name: med.name,
      dosage: med.dosage,
      time: med.time,
    }));

    const { error } = await supabase.from("medicines").insert(medicineEntries);

    if (error) {
      alert("Failed to save medicines");
    } else {
      alert("Medicines saved successfully");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Upload Prescription</h2>
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-3" />
        <button onClick={handleUpload} disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
          {loading ? "Processing..." : "Upload & Scan"}
        </button>

        {medicines.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium">Extracted Medicines:</h3>
            <ul className="list-disc pl-5">
              {medicines.map((med, index) => (
                <li key={index}>{med.name} - {med.dosage} - {med.time}</li>
              ))}
            </ul>
            <button onClick={saveMedicines} className="mt-3 w-full bg-green-500 text-white p-2 rounded">
              Save Medicines
            </button>
          </div>
        )}

        <button onClick={onClose} className="mt-4 w-full bg-gray-500 text-white p-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default PrescriptionUpload;
