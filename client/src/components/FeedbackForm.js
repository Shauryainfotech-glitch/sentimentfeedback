import React, { useState, useRef } from "react";
import axios from "axios";
import '../css/feedback.css';

const translations = {
  en: {
    title: "Feedback",
    fullName: "Full Name",
    phone: "Phone Number",
    description: "Description",
    image: "Upload Image (Optional)",
    overallRating: "Overall Rating (1-10) *",
    departmentRating: "Add Department-wise Rating (Optional)",
    submit: "Submit",
    namePlaceholder: "Your Name",
    phonePlaceholder: "Your Phone Number",
    descriptionPlaceholder: "Enter Description",
    selectDepartment: "Select Department",
    add: "Add",
    remove: "Remove",
    success: "Feedback submitted successfully!",
    error: "Failed to submit feedback.",
    descriptionNote: "Write what you feel (max 50 words)",
    departmentList: [
      "Traffic",
      "Women Safety",
      "Narcotic Drugs",
      "Cyber Crime"
    ]

  },
  mr: {
    title: "अभिप्राय",
    fullName: "पूर्ण नाव",
    phone: "फोन नंबर",
    description: "माहिती",
    image: "छायाचित्र अपलोड करा ( पर्यायी )",
    overallRating: "एकूण रेटिंग (1-10) *",
    departmentRating: "विभागानुसार रेटिंग (पर्यायी)",
    submit: "पाठवा",
    namePlaceholder: "तुमचं नाव",
    phonePlaceholder: "तुमचा फोन नंबर",
    descriptionPlaceholder: "माहिती लिहा",
    selectDepartment: "विभाग निवडा",
    add: "जोडा",
    remove: "काढा",
    success: "अभिप्राय यशस्वीरित्याने पाठवला!",
    error: "अभिप्राय पाठवल्यात अयशस्वी.",
    descriptionNote: "तुम्हाला जे वाटतं ते लिहा (कमाल ५० शब्दांची सीमा)",
    departmentList: [
      "वाहतूक",
      "महिला सुरक्षा",
      "अमली पदार्थ",
      "सायबर गुन्हे"
    ]
  }
};

const FeedbackForm = () => {
  const [language, setLanguage] = useState("mr");
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    description: "",
    overallRating: 1,
    image: null,
  });
  const [departmentRatings, setDepartmentRatings] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departmentRating, setDepartmentRating] = useState(5);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(formData).forEach(([key, val]) => form.append(key, val));
    form.append("departmentRatings", JSON.stringify(departmentRatings));

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/feedback`, form);
      alert(t.success);
      setFormData({ name: "", phone: "", description: "", overallRating: 1, image: null });
      setDepartmentRatings([]);
      fileInputRef.current.value = null;
    } catch (err) {
      alert(t.error);
    }
  };

  const addDepartmentRating = () => {
    if (!selectedDepartment) return;
    if (departmentRatings.find(d => d.department === selectedDepartment)) return;
    setDepartmentRatings([...departmentRatings, { department: selectedDepartment, rating: departmentRating }]);
    setSelectedDepartment("");
    setDepartmentRating(5);
  };

  return (
  <div className="container py-4">
  <div className="d-flex justify-content-end mb-3">
    <select className="form-select w-auto language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="mr">मराठी</option>
      <option value="en">English</option>
    </select>
  </div>

  <h3 className="text-center feedback-title mb-4">{t.title}</h3>

  <form onSubmit={handleSubmit} encType="multipart/form-data" className="card p-4 feedback-card">
    <div className="row mb-4">
      <div className="col-md-6">
        <label className="form-label">{t.fullName} *</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" placeholder={t.namePlaceholder} />
      </div>
      <div className="col-md-6">
        <label className="form-label">{t.phone} *</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-control" placeholder={t.phonePlaceholder} maxLength={10} />
      </div>
    </div>

    <div className="mb-4">
      <label className="form-label">{t.description} *</label>
      <div className="form-text mb-2">{t.descriptionNote}</div>
      <textarea name="description" value={formData.description} onChange={handleChange} required className="form-control" placeholder={t.descriptionPlaceholder} rows="4"></textarea>
    </div>

    <div className="mb-4">
      <label className="form-label">{t.image}</label>
      <input type="file" name="image" className="form-control" onChange={handleChange} accept="image/*" ref={fileInputRef} />
    </div>

    <div className="mb-4">
      <label className="form-label range-label">{t.overallRating}</label>
      <input type="range" min="1" max="10" name="overallRating" value={formData.overallRating} onChange={handleChange} className="form-range" />
      <div className="range-value">{formData.overallRating} / 10</div>
    </div>

    <div className="mb-4 border rounded p-3 bg-light">
      <label className="form-label fw-bold mb-2">{t.departmentRating}</label>
      <div className="row g-2 align-items-center">
        <div className="col-md-5">
          <select className="form-select" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="">{t.selectDepartment}</option>
            {t.departmentList.map((dept, i) => (
              <option key={i} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <input type="range" min="1" max="10" value={departmentRating} onChange={(e) => setDepartmentRating(e.target.value)} className="form-range" />
          <div className="range-value">{departmentRating} / 10</div>
        </div>
        <div className="col-md-3">
          <button type="button" className="btn btn-primary w-100" onClick={addDepartmentRating}>{t.add}</button>
        </div>
      </div>

      {departmentRatings.length > 0 && (
        <ul className="list-group mt-3">
          {departmentRatings.map((r, i) => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={i}>
              <span className="fw-semibold">{r.department}:</span> <span>{r.rating}</span>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setDepartmentRatings(departmentRatings.filter(d => d.department !== r.department))}>{t.remove}</button>
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="text-end">
      <button className="btn btn-success px-5" type="submit">{t.submit}</button>
    </div>
  </form>
</div>

  );
};

export default FeedbackForm;
