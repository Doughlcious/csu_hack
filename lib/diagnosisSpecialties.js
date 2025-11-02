export const specialtyMatchers = [
  {
    label: "Dermatology clinics",
    keyword: "dermatology clinic",
    placeType: "doctor",
    matches: ["dermat", "eczema", "psoriasis", "acne", "rash", "skin"],
    note: "Skin-focused specialists near you.",
    radius: 7000,
  },
  {
    label: "Cardiology specialists",
    keyword: "cardiologist",
    placeType: "doctor",
    matches: ["cardio", "chest pain", "heart", "arrhythm", "angina"],
    note: "Heart-focused care for your symptoms.",
    radius: 9000,
  },
  {
    label: "Neurology specialists",
    keyword: "neurologist",
    placeType: "doctor",
    matches: ["neuro", "brain", "migraine", "stroke", "seiz", "nerve"],
    note: "Brain and nerve specialists near you.",
    radius: 9000,
  },
  {
    label: "Pulmonology & respiratory care",
    keyword: "pulmonologist",
    placeType: "doctor",
    matches: ["asthma", "respir", "lung", "pulmon", "copd", "bronch"],
    note: "Breathing and lung experts close by.",
    radius: 9000,
  },
  {
    label: "Orthopedic & injury clinics",
    keyword: "orthopedic clinic",
    placeType: "doctor",
    matches: ["orthoped", "fracture", "sprain", "joint", "bone", "muscle"],
    note: "Bone, joint, and sports medicine support.",
    radius: 9000,
  },
  {
    label: "Mental health clinics",
    keyword: "mental health clinic",
    placeType: "doctor",
    matches: ["mental", "anxiety", "depress", "psych", "ptsd", "stress"],
    note: "Behavioral health and therapy resources.",
    radius: 8000,
  },
  {
    label: "Endocrinology specialists",
    keyword: "endocrinologist",
    placeType: "doctor",
    matches: ["endocr", "diabet", "thyroid", "hormone"],
    note: "Hormone and metabolic care near you.",
    radius: 9000,
  },
  {
    label: "Allergy & immunology clinics",
    keyword: "allergist",
    placeType: "doctor",
    matches: ["allerg", "immun", "hives"],
    note: "Allergy-focused clinics around you.",
    radius: 8000,
  },
  {
    label: "OB/GYN & reproductive health",
    keyword: "obgyn",
    placeType: "doctor",
    matches: ["preg", "ob", "gyn", "uterus", "menstru", "fertility"],
    note: "Reproductive care and prenatal support.",
    radius: 8000,
  },
  {
    label: "Urology & kidney clinics",
    keyword: "urologist",
    placeType: "doctor",
    matches: ["urolog", "kidney", "renal", "urinary", "prostate"],
    note: "Kidney and urinary health specialists.",
    radius: 9000,
  },
  {
    label: "Pediatric care centers",
    keyword: "pediatric clinic",
    placeType: "doctor",
    matches: ["pediatric", "child", "infant", "newborn"],
    note: "Care teams experienced with children.",
    radius: 7000,
  },
  {
    label: "Gastroenterology clinics",
    keyword: "gastroenterologist",
    placeType: "doctor",
    matches: ["gastro", "stomach", "abdomen", "ulcer", "digest", "ibd"],
    note: "Digestive health experts near you.",
    radius: 9000,
  },
  {
    label: "Ophthalmology & eye care",
    keyword: "ophthalmologist",
    placeType: "doctor",
    matches: ["eye", "vision", "optic", "glaucoma"],
    note: "Eye and vision specialists nearby.",
    radius: 7000,
  },
];

const DEFAULT_SPECIALTY = {
  label: "Hospitals & urgent care",
  keyword: "",
  placeType: "hospital",
  note: "General hospitals and clinics around you.",
  radius: 7000,
};

export const deriveSpecialtySearch = (analysis) => {
  if (!analysis) return DEFAULT_SPECIALTY;

  if (analysis.emergency) {
    return {
      label: "Emergency departments near you",
      keyword: "emergency room",
      placeType: "hospital",
      note: "Call 911 if you feel unsafe traveling. These ERs can stabilize you quickly.",
      radius: 10000,
    };
  }

  const careLevel = analysis.recommendedCareLevel?.toLowerCase() ?? "";
  if (careLevel.includes("urgent")) {
    return {
      label: "Urgent care centers",
      keyword: "urgent care",
      placeType: "hospital",
      note: "Walk-in urgent care clinics nearby.",
      radius: 8000,
    };
  }

  if (careLevel.includes("primary")) {
    return {
      label: "Primary care clinics",
      keyword: "primary care doctor",
      placeType: "doctor",
      note: "Family doctors who can coordinate next steps.",
      radius: 8000,
    };
  }

  const conditionName =
    analysis.conditions?.[0]?.name?.toLowerCase().trim() ?? "";

  if (conditionName) {
    const matched = specialtyMatchers.find((matcher) =>
      matcher.matches.some((keyword) => conditionName.includes(keyword))
    );

    if (matched) {
      return matched;
    }
  }

  return DEFAULT_SPECIALTY;
};
