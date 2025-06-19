import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // Importing both toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Required CSS for toast notifications

const translations = {
  en: {
    title: "Feedback",
    fullName: "Full Name",
    phone: "Phone Number",
    description: "Description",
    image: "Upload Image (Optional)",
    overallRating: "Overall Rating (1-10) ",
    departmentRating: "Add Department-wise Rating (Optional)",
    submit: "Submit",
    namePlaceholder: "Your Name",
    phonePlaceholder: "Your Phone Number",
    descriptionPlaceholder: "Enter Description",
    selectDepartment: "Department",
    add: "Add",
    remove: "Remove",
    success: "Your feedback has been successfully submitted. Thank you for your time and input!",
    error: "There was an issue submitting your feedback. Please try again later.",
    descriptionNote: "Write what you feel (max 50 words)",
    departmentList: [
      "Traffic",
      "Women Safety",
      "Narcotic Drugs",
      "Cyber Crime"
    ],
    departmentRatingsHeading: "Department Ratings",
    rating: "Rating",
    alreadyRated: "department has already been rated"
  },
  mr: {
    title: "अभिप्राय",
    fullName: "पूर्ण नाव",
    phone: "फोन नंबर",
    description: "माहिती",
    image: "छायाचित्र अपलोड करा ( पर्यायी )",
    overallRating: "एकूण रेटिंग (1-10) ",
    departmentRating: "विभागानुसार रेटिंग (पर्यायी)",
    submit: "पाठवा",
    namePlaceholder: "तुमचं नाव",
    phonePlaceholder: "तुमचा फोन नंबर",
    descriptionPlaceholder: "माहिती लिहा",
    selectDepartment: "विभाग",
    add: "जोडा",
    remove: "काढा",
    success: "तुम्हचा अभिप्राय यशस्वीरित्या पाठवला गेला आहे. तुमच्या वेळेसाठी आणि योगदानासाठी धन्यवाद!",
    error: "तुम्हचा अभिप्राय पाठवण्यात काही अडचण आली आहे. कृपया नंतर पुन्हा प्रयत्न करा.",
    descriptionNote: "तुम्हाला जे वाटतं ते लिहा (कमाल ५० शब्दांची सीमा)",
    departmentList: [
      "वाहतूक",
      "महिला सुरक्षा",
      "अमली पदार्थ",
      "सायबर गुन्हे"
    ],
    departmentRatingsHeading: "विभागानुसार रेटिंग",
    rating: "रेटिंग",
    alreadyRated: "विभाग आधीच निवडलेला आहे"
  }
};

const FeedbackForm = () => {
  const [language, setLanguage] = useState("mr");
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    description: "",
    overallRating: 2,
    image: null,
  });
  const [departmentRatings, setDepartmentRatings] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departmentRating, setDepartmentRating] = useState(5);
  const fileInputRef = useRef();

  // Reset department ratings when the language is changed
  useEffect(() => {
    setDepartmentRatings([]);  // Clear ratings when the language is switched
  }, [language]);

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
      toast.success(t.success, { 
        position: "top-center", 
        autoClose: 5000, 
        theme: "colored" 
      }); // Success toast message
      setFormData({ name: "", phone: "", description: "", overallRating: 1, image: null });
      setDepartmentRatings([]);
      fileInputRef.current.value = null;
    } catch (err) {
      toast.error(t.error, { 
        position: "top-center", 
        autoClose: 5000, 
        theme: "colored" 
      }); // Error toast message
    }
  };

  const addDepartmentRating = () => {
    if (!selectedDepartment) return;
    
    // Check if the department is already rated
    if (departmentRatings.find(d => d.department === selectedDepartment)) {
      toast.info(`${selectedDepartment} ${t.alreadyRated}`, { 
        position: "top-center", 
        autoClose: 5000, 
        theme: "colored" 
      }); // Info toast with customized settings
      return;
    }
    
    setDepartmentRatings([...departmentRatings, { department: selectedDepartment, rating: departmentRating }]);
    setSelectedDepartment("");
    setDepartmentRating(5);
  };

  const removeDepartmentRating = (department) => {
    setDepartmentRatings(departmentRatings.filter(d => d.department !== department));
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-end mb-3">
        <select className="form-select w-auto language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="mr">मराठी</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Centered Main Heading with Bold Text */}
      <h1 className="fw-bold text-center mb-4" style={{ color: "#0A2362" }}>
        {t.title}
      </h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="card p-4 feedback-card">
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
              {t.fullName} <span style={{ color: 'red' }}>*</span>
            </label> {/* Bold and Red Asterisk */}
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" placeholder={t.namePlaceholder} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
              {t.phone} <span style={{ color: 'red' }}>*</span>
            </label> {/* Bold and Red Asterisk */}
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-control" placeholder={t.phonePlaceholder} maxLength={10} />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
            {t.description} <span style={{ color: 'red' }}>*</span>
          </label> {/* Bold and Red Asterisk */}
          <div className="form-text mb-2" style={{ color: "#757575" }}>{t.descriptionNote}</div>
          <textarea name="description" value={formData.description} onChange={handleChange} required className="form-control" placeholder={t.descriptionPlaceholder} rows="4"></textarea>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
            {t.image}
          </label> {/* Bold Label */}
          <input type="file" name="image" className="form-control" onChange={handleChange} accept="image/*" ref={fileInputRef} />
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
            {t.overallRating} <span style={{ color: 'red' }}>*</span>
          </label> {/* Bold and Red Asterisk */}
          <input type="range" min="1" max="10" name="overallRating" value={formData.overallRating} onChange={handleChange} className="form-range" />
          <div className="range-value">{formData.overallRating} / 10</div>
        </div>

        <div className="mb-4 border rounded p-3 bg-light">
          <label className="form-label fw-bold mb-2" style={{ color: "#0A2362" }}>
            {t.departmentRatingsHeading}
          </label> {/* Bold Heading */}
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
                {t.selectDepartment}
              </label> {/* Bold Label */}
              <select className="form-select" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                <option value="">{t.selectDepartment}</option>
                {t.departmentList.map((dept, i) => (
                  <option key={i} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
                {t.rating}
              </label> {/* Bold Label */}
              <input type="range" min="1" max="10" value={departmentRating} onChange={(e) => setDepartmentRating(e.target.value)} className="form-range" />
              <div className="range-value">{departmentRating} / 10</div>
            </div>
            <div className="col-md-3">
              <button type="button" className="btn" style={{ backgroundColor: "#0A2362", color: "white", width: "100%" }} onClick={addDepartmentRating}>
                {t.add}
              </button>
            </div>
          </div>

          {departmentRatings.length > 0 && (
            <div className="mt-3">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.selectDepartment}</th>
                    <th>{t.rating}</th>
                    <th>{t.remove}</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentRatings.map((r, i) => (
                    <tr key={i}>
                      <td>{r.department}</td>
                      <td>{r.rating}</td>
                      <td>
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeDepartmentRating(r.department)}>
                          {t.remove}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-end">
          <button className="btn" style={{ backgroundColor: "#0A2362", color: "white", padding: "10px 30px" }} type="submit">
            {t.submit}
          </button>
        </div>
      </form>

      {/* ToastContainer to show toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default FeedbackForm;
