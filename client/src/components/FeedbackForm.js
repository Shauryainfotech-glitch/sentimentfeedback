import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const translations = {
  en: {
    slogan: "Your Opinion Counts – Improving Ahilyanagar Police Services!",
    title: "Feedback",
    fullName: "Full Name",
    phone: "Phone Number",
    description: "Opinion",
    image: "Upload Image (Optional)",
    overallRating: "Overall Rating (1-10)",
    departmentRating: "Add Department-wise Rating (Optional)",
    submit: "Submit",
    namePlaceholder: "Your Name",
    phonePlaceholder: "Your Phone Number",
    descriptionPlaceholder: "Enter your feedback",
    selectDepartment: "Department",
    add: "Add",
    remove: "Remove",
    success: "Feedback submitted successfully.",
    error: "There was an issue submitting your feedback. Please try again later.",
    descriptionNote: "Express your opinion (max 50 words)",
    departmentList: ["Traffic", "Women Safety", "Narcotic Drugs", "Cyber Crime"],
    departmentRatingsHeading: "Department Ratings",
    rating: "Rating",
    alreadyRated: "department has already been rated",
    invalidPhone: "Please enter a valid 10-digit phone number.",
    fileSizeError: "File size must be less than 10MB",
    fileTypeError: "Please select only image files (JPG, PNG, GIF, etc.)",
    descriptionRequired: "Please enter your feedback."
  },
  mr: {
    slogan: "तुमचं मत महत्वाचं आहे – अहिल्यानगर पोलीस सेवा मजबूत करा!",
    title: "अभिप्राय",
    fullName: "पूर्ण नाव",
    phone: "फोन नंबर",
    description: "अभिप्राय",
    image: "छायाचित्र अपलोड करा (पर्यायी)",
    overallRating: "एकूण रेटिंग (1-10)",
    departmentRating: "विभागानुसार रेटिंग (पर्यायी)",
    submit: "पाठवा",
    namePlaceholder: "तुमचं नाव",
    phonePlaceholder: "तुमचा फोन नंबर",
    descriptionPlaceholder: "अभिप्राय नोंदवा",
    selectDepartment: "विभाग",
    add: "जोडा",
    remove: "काढा",
    success: "अभिप्राय यशस्वीरित्या पाठवला गेला.",
    error: "तुमचा अभिप्राय पाठवण्यात काही अडचण आली आहे. कृपया नंतर पुन्हा प्रयत्न करा.",
    descriptionNote: "आपली प्रतिक्रिया व्यक्त करा (कमाल ५० शब्दांची मर्यादा )",
    departmentList: ["वाहतूक", "महिला सुरक्षा", "अमली पदार्थ विरुद्ध कारवाई", "सायबर गुन्हे"],
    departmentRatingsHeading: "विभागानुसार रेटिंग",
    rating: "रेटिंग",
    alreadyRated: "विभाग आधीच निवडलेला आहे",
    invalidPhone: "कृपया १० अंकी फोन नंबर टाका.", 
    fileSizeError: "फाईलचा आकार १०MB पेक्षा कमी असणे आवश्यक आहे",
    fileTypeError: "कृपया फक्त छायाचित्र फाईल्स निवडा (JPG, PNG, GIF, इ.)",
    descriptionRequired: "कृपया अभिप्राय नोंदवा."
  }
};

const policeStations = [
  { en: "Akole", mr: "अकोले" },
  { en: "Ashwi", mr: "अश्वी" },
  { en: "Belavandi", mr: "बेलवंडी" },
  { en: "Bhingar Camp", mr: "भिंगार कॅम्प" },
  { en: "Ghargaon", mr: "घरगाव" },
  { en: "Jamkhed", mr: "जामखेड" },
  { en: "Karjat", mr: "कर्जत" },
  { en: "Kharda", mr: "खरडा" },
  { en: "Kopargaon City", mr: "कोपरगाव शहर" },
  { en: "Kopargaon Rural", mr: "कोपरगाव ग्रामीण" },
  { en: "Kotwali", mr: "कोतवाली" },
  { en: "Loni", mr: "लोणी" },
  { en: "MIDC", mr: "MIDC" },
  { en: "Mirajgaon", mr: "मिरजगाव" },
  { en: "Nagar Taluka", mr: "नगर तालुका" },
  { en: "Newasa", mr: "नेवासा" },
  { en: "Parner", mr: "पारनेर" },
  { en: "Pathardi", mr: "पाथर्डी" },
  { en: "Rahata", mr: "राहाता" },
  { en: "Rahuri", mr: "राहुरी" },
  { en: "Rajur", mr: "राजूर" },
  { en: "Sangamner City", mr: "संगमनेर शहर" },
  { en: "Sangamner Rural", mr: "संगमनेर ग्रामीण" },
  { en: "Shani Shingnapur", mr: "शनि शिंगणापूर" },
  { en: "Shevgaon", mr: "शेवगाव" },
  { en: "Shirdi", mr: "शिर्डी" },
  { en: "Shrigonda", mr: "श्रीगोंदा" },
  { en: "Shrirampur City", mr: "श्रीरामपूर शहर" },
  { en: "Shrirampur Rural", mr: "श्रीरामपूर ग्रामीण" },
  { en: "Sonai", mr: "सोनई" },
  { en: "Supa", mr: "सुपा" },
  { en: "Tofkhana", mr: "तोफखाना" }
];

const FeedbackForm = () => {
  const [language, setLanguage] = useState("mr");
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    description: "",
    overallRating: 2,
  });
  const [departmentRatings, setDepartmentRatings] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departmentRating, setDepartmentRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPoliceStation, setSelectedPoliceStation] = useState("");

  // Function to update the visual progress bar of range inputs
  const updateRangeProgress = (rangeInput) => {
    if (!rangeInput) return;
    const value = rangeInput.value;
    const max = rangeInput.max || 10;
    const min = rangeInput.min || 1;
    const percentage = ((value - min) / (max - min)) * 100;
    rangeInput.style.backgroundSize = `${percentage}% 100%`;
  };

  // Initialize range inputs and add event listeners
  useEffect(() => {
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
      updateRangeProgress(input);
      input.addEventListener('input', () => updateRangeProgress(input));
      input.addEventListener('change', () => updateRangeProgress(input));
    });
    return () => {
      rangeInputs.forEach(input => {
        input.removeEventListener('input', () => updateRangeProgress(input));
        input.removeEventListener('change', () => updateRangeProgress(input));
      });
    };
  }, []);

  useEffect(() => {
    setFormData({
      name: "",
      phone: "",
      description: "",
      overallRating: 2,
    });
    setDepartmentRatings([]);
  }, [language]);

  useEffect(() => {
    const overallRatingInput = document.querySelector('input[name="overallRating"]');
    if (overallRatingInput) {
      updateRangeProgress(overallRatingInput);
    }
  }, [formData.overallRating]);

  useEffect(() => {
    const departmentRatingInput = document.querySelector('.department-rating-slider');
    if (departmentRatingInput) {
      updateRangeProgress(departmentRatingInput);
    }
  }, [departmentRating]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (e.target.type === "range") {
      updateRangeProgress(e.target);
    }

    if (name === "phone") {
      const numeric = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, phone: numeric }));
    } else if (name === "description") {
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length <= 50) {
        setFormData((prev) => ({ ...prev, description: value }));
      }
    } else if (name === "policeStation") {
      setSelectedPoliceStation(value);
      return;
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Check if description is empty
    if (!formData.description.trim()) {
      toast.error(t.descriptionRequired, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
      return; // Prevent form submission if description is empty
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast.error(t.invalidPhone, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
      return; // Prevent form submission if phone is invalid
    }

    if (!selectedPoliceStation) {
      toast.error("Please select a police station.", {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
      return;
    }

    setIsSubmitting(true);
    const startTime = Date.now();

    try {
      const payload = {
        ...formData,
        departmentRatings,
        policeStation: selectedPoliceStation,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/feedback`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const endTime = Date.now();
      const submissionTime = endTime - startTime;
      console.log(`✅ Feedback submitted in ${submissionTime}ms`);

      toast.success(t.success, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });

      setFormData({
        name: "",
        phone: "",
        description: "",
        overallRating: 2,
      });
      setDepartmentRatings([]);
      setSelectedPoliceStation("");

    } catch (err) {
      const endTime = Date.now();
      const submissionTime = endTime - startTime;
      console.error(`❌ Feedback submission failed after ${submissionTime}ms:`, err);

      let errorMessage = t.error;

      if (err.response?.status === 413) {
        errorMessage = language === "mr"
          ? "फाईल खूप मोठी आहे. कृपया लहान फाईल निवडा."
          : "File is too large. Please select a smaller file.";
      }

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDepartmentRating = () => {
    if (!selectedDepartment) return;
    if (departmentRatings.find((d) => d.department === selectedDepartment)) {
      toast.info(`${selectedDepartment} ${t.alreadyRated}`, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
      return;
    }

    setDepartmentRatings((prev) => [
      ...prev,
      { department: selectedDepartment, rating: departmentRating },
    ]);
    setSelectedDepartment("");
    setDepartmentRating(5);

    setTimeout(() => {
      const departmentRatingInput = document.querySelector('.department-rating-slider');
      if (departmentRatingInput) {
        updateRangeProgress(departmentRatingInput);
      }
    }, 0);
  };

  const removeDepartmentRating = (department) => {
    setDepartmentRatings((prev) =>
      prev.filter((d) => d.department !== department)
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-end mb-3">
        <select
          className="form-select w-auto"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="mr">मराठी</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="text-center mb-4 p-3" style={{ backgroundColor: "#f0f4ff", borderRadius: "5px", borderLeft: "5px solid #0A2362" }}>
        <h3 className="fw-bold" style={{ color: "#0A2362" }}>{t.slogan}</h3>
      </div>

      <h1 className="fw-bold text-center mb-4" style={{ color: "#0A2362" }}>
        {t.title}
      </h1>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="card p-4"
      >
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
              {t.fullName}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              placeholder={t.namePlaceholder}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
              {t.phone}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
              placeholder={t.phonePlaceholder}
              maxLength={10}
              inputMode="numeric"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
            {language === "mr" ? "तुमची पोलीस स्टेशन हद्द निवडा" : "Select your police station Boundary"} <span style={{ color: "red" }}>*</span>
          </label>
          <select
            className="form-select"
            name="policeStation"
            value={selectedPoliceStation}
            onChange={handleChange}
            required
          >
            <option value="">{language === "mr" ? "पोलीस स्टेशन निवडा" : "Select Police Station"}</option>
            {policeStations.map((station, i) => (
              <option key={i} value={station.en}>
                {language === "mr" ? station.mr : station.en}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
            {t.description} <span style={{ color: "red" }}>*</span>
          </label>
          <div className="form-text mb-2" style={{ color: "#757575" }}>
            {t.descriptionNote}
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            placeholder={t.descriptionPlaceholder}
            rows="4"
          ></textarea>
          <div className="form-text text-end text-muted mt-1">
            {formData.description.trim().split(/\s+/).filter(Boolean).length} / 50{" "}
            {language === "mr" ? "शब्द" : "words"}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold" style={{ color: "#0A2362" }}>
            {t.overallRating} <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            name="overallRating"
            value={formData.overallRating}
            onChange={handleChange}
            className="form-range"
          />
          <div className="range-value">{formData.overallRating} / 10</div>
        </div>

        <div className="mb-4 border rounded p-3 bg-light">
          <label className="form-label fw-bold mb-2" style={{ color: "#0A2362" }}>
            {t.departmentRatingsHeading}
          </label>
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <select
                className="form-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">{t.selectDepartment}</option>
                {t.departmentList.map((dept, i) => (
                  <option key={i} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="range"
                min="1"
                max="10"
                value={departmentRating}
                onChange={(e) => setDepartmentRating(e.target.value)}
                className="form-range department-rating-slider"
              />
              <div className="range-value">{departmentRating} / 10</div>
            </div>
            <div className="col-md-3">
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: "#0A2362",
                  color: "white",
                  padding: "10px 30px",
                  width: "100%",
                }}
                onClick={addDepartmentRating}
              >
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
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeDepartmentRating(r.department)}
                        >
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
          <button
            className="btn"
            style={{
              backgroundColor: "#0A2362",
              color: "white",
              padding: "10px 30px",
            }}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {language === "mr" ? "पाठवत आहे..." : "Submitting..."}
              </>
            ) : (
              t.submit
            )}
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
};

export default FeedbackForm;
