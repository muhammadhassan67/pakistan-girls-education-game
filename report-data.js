/**
 * The Real Cost of Educating a Girl in Pakistan
 * Official Report & Survey Dataset Engine with Dynamic Urdu Quotes per Round
 */

const REGIONS = {
  balochistan: { name: "Balochistan", floatMultiplier: 0.55, borrowRate: 0.64, stipendRate: 0.005 },
  kp: { name: "Khyber Pakhtunkhwa", floatMultiplier: 0.75, borrowRate: 0.305, stipendRate: 0.05 },
  punjab: { name: "Punjab", floatMultiplier: 0.80, borrowRate: 0.085, stipendRate: 0.245 },
  sindh: { name: "Sindh", floatMultiplier: 0.95, borrowRate: 0.165, stipendRate: 0.08 },
  ict: { name: "Islamabad (ICT)", floatMultiplier: 1.10, borrowRate: 0.11, stipendRate: 0.00 }
};

const STAGES = [
  { id: 1, key: "admission", title: "Stage 1: Admission Fee", mandatory: true, icon: "📋" },
  { id: 2, key: "kit", title: "Stage 2: School Kit & Uniform", mandatory: true, icon: "🎒" },
  { id: 3, key: "charges", title: "Stage 3: Other School Charges", mandatory: false, icon: "🏫" },
  { id: 4, key: "board", title: "Stage 4: Board Exam Fee", mandatory: true, icon: "📜" },
  { id: 5, key: "transport", title: "Stage 5: Transport", mandatory: false, icon: "🚌" },
  { id: 6, key: "pocket", title: "Stage 6: Food & Pocket Money", mandatory: true, icon: "🍱" }
];

const SCENARIOS = [
  // Seat 1: Balochistan (Quetta)
  {
    id: "quetta_325",
    code: "QUE-325",
    city: "Quetta",
    regionKey: "balochistan",
    regionName: "Balochistan",
    rowId: 325,
    class: "Class 9",
    fatherJob: "Domestic worker",
    motherJob: "Homemaker",
    childrenTotal: 3,
    childrenEnrolled: 3,
    distance: "4–6 km",
    transportMode: "Motorbike",
    mealSource: "Brought from home",
    monthlyIncome: 15000,
    incomeTranche: 3750,
    stipendAmount: 0,
    quote: "Fuel for the motorbike to travel 5 km to high school eats up our savings every month.",
    urduQuotes: {
      admission: "کوئٹہ کے گورنمنٹ اسکول میں داخلہ فیس معاف ہے۔",
      kit: "نویں جماعت کا سکول کٹ اور یونیفارم خریدنا ہے۔",
      charges: "کوئی اضافی چارجز نہیں ہیں۔",
      board: "بورڈ امتحان کا 2500 روپے کا چالان بھرنا ہے۔",
      transport: "5 کلومیٹر دور اسکول موٹر سائیکل پر جانے کا پیٹرول 5000 روپے ماہانہ بنتا ہے۔",
      pocket: "ہم گھر سے ہی کھانا ساتھ لے جاتے ہیں۔"
    },
    allowedMethods: { earnings: true, borrow: true, savings: true, stipend: false },
    costs: {
      admission: { fee: 0 },
      kit: { textbooks: 83, guides: 417, uniform: 417, stationery: 200 },
      charges: { funds: 0, fines: 0, fee: 0 },
      board: { fee: 2500 },
      transport: { fee: 5000, canWalk: true, walkDist: "4–6 km" },
      pocket: { pocketMoney: 0, meals: 0 }
    }
  },
  // Seat 2: Khyber Pakhtunkhwa (South Waziristan)
  {
    id: "swaziristan_492",
    code: "SWA-492",
    city: "South Waziristan",
    regionKey: "kp",
    regionName: "Khyber Pakhtunkhwa",
    rowId: 492,
    class: "Class 9",
    fatherJob: "Farmer",
    motherJob: "Passed away",
    childrenTotal: 5,
    childrenEnrolled: 1,
    distance: "1–3 km",
    transportMode: "Hired Rickshaw (Monthly)",
    mealSource: "Purchased at school",
    monthlyIncome: 16667,
    incomeTranche: 4167,
    stipendAmount: 0,
    quote: "My mother passed away. My father farms and manages our small savings to keep me in school.",
    urduQuotes: {
      admission: "جنوبی وزیرستان کے اسکول کی داخلہ فیس 300 روپے ہے۔",
      kit: "والد صاحب نے اسٹیشنری کے لیے 2000 روپے کی بچت رکھی ہے۔",
      charges: "کوئی اضافی فنڈز واجب الادا نہیں ہیں۔",
      board: "بورڈ فیس 2800 روپے ہے، قرض کا کوئی ذریعہ نہیں صرف بچت ہے۔",
      transport: "وزیرستان میں رکشہ کا کرایہ 1500 روپے ماہانہ ہے۔",
      pocket: "اسکول کینٹین سے کھانے کے لیے 1000 روپے درکار ہیں۔"
    },
    allowedMethods: { earnings: true, borrow: false, savings: true, stipend: false },
    singleChildInSchool: true,
    costs: {
      admission: { fee: 300 },
      kit: { textbooks: 0, guides: 167, uniform: 0, stationery: 2000 },
      charges: { funds: 0, fines: 0, fee: 0 },
      board: { fee: 2800 },
      transport: { fee: 1500, canWalk: true, walkDist: "1–3 km" },
      pocket: { pocketMoney: 500, meals: 500 }
    }
  },
  // Seat 3: Sindh (Tharparkar)
  {
    id: "tharparkar_339",
    code: "THA-339",
    city: "Tharparkar",
    regionKey: "sindh",
    regionName: "Sindh",
    rowId: 339,
    class: "Class 10",
    fatherJob: "Daily-wage labourer",
    motherJob: "Homemaker",
    childrenTotal: 5,
    childrenEnrolled: 1,
    distance: "1–3 km",
    transportMode: "Walks",
    mealSource: "Brought from home + Buys at school",
    monthlyIncome: 12000,
    incomeTranche: 3000,
    stipendAmount: 0,
    quote: "I walk to school every day under the desert sun. I am the only one of my siblings in school.",
    urduQuotes: {
      admission: "تھر کے ریگستان میں اسکول کے داخلے کے 400 روپے دینے ہیں۔",
      kit: "اسٹیشنری کا سامان 2500 روپے کا ہے، یہ بہت بڑا خرچہ ہے۔",
      charges: "اس بار اضافی اسکول فنڈز نہیں مانگے گئے۔",
      board: "بورڈ امتحان کی فیس 400 روپے ہے، ابو کے پاس پیسے ختم ہو چکے ہیں۔",
      transport: "میں روزانہ ریگستانی دھوپ میں 3 کلومیٹر پیدل چل کر اسکول جاتی ہوں۔",
      pocket: "دھوپ میں گرمی کی وجہ سے اسکول سے پانی اور کھانا خریدنا پڑتا ہے۔"
    },
    allowedMethods: { earnings: true, borrow: false, savings: false, stipend: false },
    singleChildInSchool: true,
    costs: {
      admission: { fee: 400 },
      kit: { textbooks: 83, guides: 917, uniform: 125, stationery: 2500 },
      charges: { funds: 0, fines: 0, fee: 0 },
      board: { fee: 400 },
      transport: { fee: 0, canWalk: true, walkDist: "1–3 km" },
      pocket: { pocketMoney: 1250, meals: 1250 }
    }
  },
  // Seat 4: Punjab (Chiniot Worker)
  {
    id: "chiniot_245",
    code: "CHI-245",
    city: "Chiniot",
    regionKey: "punjab",
    regionName: "Punjab",
    rowId: 245,
    class: "Class 10",
    fatherJob: "Domestic worker",
    motherJob: "Homemaker",
    childrenTotal: 4,
    childrenEnrolled: 2,
    distance: "> 10 km",
    transportMode: "Hired Rickshaw (Monthly)",
    mealSource: "Brought from home",
    monthlyIncome: 15000,
    incomeTranche: 3750,
    stipendAmount: 0,
    quote: "School is over 10 km away across the highway. Walking isn't an option for a young girl.",
    urduQuotes: {
      admission: "داخلہ فیس 1500 روپے ہے، یہ پہلے دن ہی دینی پڑے گی۔",
      kit: "یونیفارم چھوٹا ہو گیا ہے اور نئی نصابی کتابیں خریدنی ہیں۔",
      charges: "اسکول فنڈز اور جرمانے ملا کر 497 روپے بنتے ہیں۔",
      board: "بورڈ امتحان کی فیس کے بغیر رول نمبر سلپ نہیں ملے گی۔",
      transport: "اسکول 10 کلومیٹر دور شاہراہ کے پار ہے، اکیلے پیدل جانا ممکن نہیں۔",
      pocket: "پورے دن کے لیے جیب خرچ اور کھانے کا انتظام کرنا ہے۔"
    },
    allowedMethods: { earnings: true, borrow: false, savings: false, stipend: false },
    costs: {
      admission: { fee: 1500 },
      kit: { textbooks: 250, guides: 667, uniform: 1333, stationery: 500 },
      charges: { funds: 420, fines: 17, fee: 60 },
      board: { fee: 2500 },
      transport: { fee: 2500, canWalk: true, walkDist: "> 10 km" },
      pocket: { pocketMoney: 1250, meals: 0 }
    }
  },
  // Seat 5: Khyber Pakhtunkhwa (Nowshera Labourer)
  {
    id: "nowshera_509",
    code: "NOW-509",
    city: "Nowshera",
    regionKey: "kp",
    regionName: "Khyber Pakhtunkhwa",
    rowId: 509,
    class: "Class 10",
    fatherJob: "Daily-wage labourer",
    motherJob: "Homemaker",
    childrenTotal: 2,
    childrenEnrolled: 2,
    distance: "1–3 km",
    transportMode: "Hired Rickshaw (Monthly)",
    mealSource: "Free school meal + Home food",
    monthlyIncome: 12000,
    incomeTranche: 3000,
    stipendAmount: 0,
    quote: "Abba says the rickshaw is safer for Class 10, but the board exam fee is due this month too.",
    urduQuotes: {
      admission: "اسکول میں داخلہ فیس جمع کروانا ضروری ہے تاکہ میرا نام لسٹ میں آ جائے۔",
      kit: "ابو! کاپیاں ختم ہو گئی ہیں اور سائنس کے گائیڈ بکس کے لیے پیسے چاہیے۔",
      charges: "اسکول کے سالانہ فنڈز اور لائبریری چارجز دینے ہیں۔",
      board: "میٹرک کے بورڈ امتحانات کی فیس 2500 روپے ہے، یہ دینا لازمی ہے۔",
      transport: "ابو کہتے ہیں دسویں جماعت کے لیے رکشہ زیادہ محفوظ ہے، لیکن فیس کے پیسے کم پڑ رہے ہیں۔",
      pocket: "اسکول میں وقفے کے دوران پیاس کے لیے پانی اور کچھ کھانے کے پیسے چاہیے۔"
    },
    allowedMethods: { earnings: true, borrow: true, savings: false, stipend: false },
    costs: {
      admission: { fee: 200 },
      kit: { guides: 250, uniform: 417, stationery: 900, textbooks: 0 },
      charges: { funds: 0, fines: 0, fee: 0 },
      board: { fee: 2500 },
      transport: { fee: 2500, canWalk: true, walkDist: "1–3 km" },
      pocket: { pocketMoney: 500, meals: 0 }
    }
  },
  // Seat 6: Islamabad (ICT Guard/Domestic)
  {
    id: "islamabad_167",
    code: "ISL-167",
    city: "Islamabad (ICT)",
    regionKey: "ict",
    regionName: "Islamabad (ICT)",
    rowId: 167,
    class: "Class 9",
    fatherJob: "Domestic worker",
    motherJob: "Homemaker",
    childrenTotal: 3,
    childrenEnrolled: 3,
    distance: "7–10 km",
    transportMode: "School bus",
    mealSource: "Free school meal + Home food",
    monthlyIncome: 60000,
    incomeTranche: 15000,
    stipendAmount: 0,
    quote: "Living in ICT gives us better income, but school bus and guidebooks still take a heavy bite.",
    urduQuotes: {
      admission: "اسلام آباد کے اسکول کی داخلہ فیس 3000 روپے ہے۔",
      kit: "نئی گائیڈز اور یونیفارم کا خرچہ 2708 روپے ہے۔",
      charges: "اسکول فنڈز اور جرمانے 400 روپے ہیں۔",
      board: "بورڈ امتحان کی فیس 2600 روپے باسہولت ادا ہو جائے گی۔",
      transport: "7 سے 10 کلومیٹر کا اسکول بس کا کرایہ 2500 روپے ماہانہ ہے۔",
      pocket: "اسکول کینٹین اور جیب خرچ 2500 روپے ہے۔"
    },
    allowedMethods: { earnings: true, borrow: true, savings: true, stipend: false },
    costs: {
      admission: { fee: 3000 },
      kit: { textbooks: 0, guides: 708, uniform: 1500, stationery: 500 },
      charges: { funds: 333, fines: 67, fee: 0 },
      board: { fee: 2600 },
      transport: { fee: 2500, canWalk: true, walkDist: "7–10 km" },
      pocket: { pocketMoney: 2500, meals: 0 }
    }
  },
  // Seat 7: Khyber Pakhtunkhwa (Nowshera Daily Wage)
  {
    id: "nowshera_785",
    code: "NOW-785",
    city: "Nowshera",
    regionKey: "kp",
    regionName: "Khyber Pakhtunkhwa",
    rowId: 785,
    class: "Class 10",
    fatherJob: "Daily-wage labourer",
    motherJob: "Daily-wage labourer",
    childrenTotal: 5,
    childrenEnrolled: 3,
    distance: "< 1 km",
    transportMode: "Walks",
    mealSource: "Free school meal",
    monthlyIncome: 15000,
    incomeTranche: 3750,
    stipendAmount: 0,
    quote: "Both of my parents work daily wages. We walk to school, but board exam registration leaves us zero cash.",
    urduQuotes: {
      admission: "والدین دونوں دیہاڑی دار ہیں، داخلہ فیس 300 روپے ہے۔",
      kit: "گائیڈز اور یونیفارم کا خرچہ 1792 روپے بنتا ہے۔",
      charges: "اضافی فیس کوئی نہیں ہے۔",
      board: "بورڈ امتحانات کی 2500 روپے فیس کے لیے پیسے بالکل ختم ہو چکے ہیں۔",
      transport: "ہم اسکول پیدل جاتے ہیں اس لیے کرایہ صفر ہے۔",
      pocket: "اسکول سے مفت کھانا ملتا ہے لیکن جیب خرچ 1250 روپے ہے۔"
    },
    allowedMethods: { earnings: true, borrow: false, savings: false, stipend: false },
    costs: {
      admission: { fee: 300 },
      kit: { textbooks: 0, guides: 292, uniform: 500, stationery: 1000 },
      charges: { funds: 0, fines: 0, fee: 0 },
      board: { fee: 2500 },
      transport: { fee: 0, canWalk: true, walkDist: "< 1 km" },
      pocket: { pocketMoney: 1250, meals: 0 }
    }
  },
  // Seat 8: Punjab (Chiniot Farmer)
  {
    id: "chiniot_435",
    code: "CHI-435",
    city: "Chiniot",
    regionKey: "punjab",
    regionName: "Punjab",
    rowId: 435,
    class: "Class 9",
    fatherJob: "Farmer",
    motherJob: "Homemaker",
    childrenTotal: 4,
    childrenEnrolled: 1,
    distance: "1–3 km",
    transportMode: "Motorbike (No cost listed)",
    mealSource: "Free school meal + Home food",
    monthlyIncome: 17000,
    incomeTranche: 4250,
    stipendAmount: 1250,
    quote: "The government stipend of Rs 1,250 helps, but when board fees arrive, it barely covers the gap.",
    urduQuotes: {
      admission: "داخلی فیس 2000 روپے ہے، جو ہماری پہلی فصل کی رقم سے دی جائے گی۔",
      kit: "نصابی گائیڈز اور کاپیاں خریدنی ہیں۔",
      charges: "اسکول فنڈز اور دیگر اخراجات 270 روپے ہیں۔",
      board: "حکومت کا 1250 روپے کا وظیفہ ملا ہے لیکن بورڈ فیس 1700 روپے ہے۔",
      transport: "ابو مجھے موٹر سائیکل پر ڈراپ کر دیتے ہیں۔",
      pocket: "اسکول میں جیب خرچ کے لیے 2500 روپے چاہیے۔"
    },
    allowedMethods: { earnings: true, borrow: false, savings: false, stipend: true },
    singleChildInSchool: true,
    costs: {
      admission: { fee: 2000 },
      kit: { textbooks: 292, guides: 417, uniform: 583, stationery: 1000 },
      charges: { funds: 208, fines: 42, fee: 20 },
      board: { fee: 1700 },
      transport: { fee: 0, canWalk: true, walkDist: "1–3 km" },
      pocket: { pocketMoney: 2500, meals: 0 }
    }
  }
];

function computeTotalSixRoundCost(persona) {
  let c = persona.costs;
  let stage1 = c.admission.fee || 0;
  let stage2 = (c.kit.textbooks || 0) + (c.kit.guides || 0) + (c.kit.uniform || 0) + (c.kit.stationery || 0);
  let stage3 = (c.charges.funds || 0) + (c.charges.fines || 0) + (c.charges.fee || 0);
  let stage4 = c.board.fee || 0;
  let stage5 = c.transport.fee || 0;
  let stage6 = (c.pocket.pocketMoney || 0) + (c.pocket.meals || 0);
  return stage1 + stage2 + stage3 + stage4 + stage5 + stage6;
}

function getPersonaStartingFloat(persona) {
  const reg = REGIONS[persona.regionKey] || REGIONS.punjab;
  const totalCost = computeTotalSixRoundCost(persona);
  return Math.round(totalCost * reg.floatMultiplier);
}

function evaluateVerdictTier(totalSpent, startingFloat, borrowCount, cutCount) {
  if (cutCount >= 2) {
    return {
      tier: "something_gave",
      headline: "Something had to give — and it was hers.",
      description: "You had to sacrifice basic necessities (uniform, stationery, or meals) to protect the household float."
    };
  }

  const strain = totalSpent / (startingFloat || 1);

  if (strain < 0.5) {
    return {
      tier: "comfortable",
      headline: "A margin most families in this survey don't have.",
      description: "Your household managed the expenses smoothly without incurring crippling debt."
    };
  } else if (strain < 0.9 && borrowCount === 0) {
    return {
      tier: "stretched",
      headline: "Right where the real median family sits.",
      description: "Every single rupee was stretched to its absolute limit, leaving zero buffer for emergencies."
    };
  } else if (strain < 1.5 || borrowCount >= 1) {
    return {
      tier: "edge_borrowed",
      headline: "Still enrolled. Only because you borrowed.",
      description: "The cash gap forced your household into debt to pay for essential school milestones."
    };
  } else {
    return {
      tier: "crisis",
      headline: "Underwater. This is what most Balochistan & KP families face every year.",
      description: "School expenditure completely overwhelmed your household's available float."
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = { REGIONS, STAGES, SCENARIOS, computeTotalSixRoundCost, getPersonaStartingFloat, evaluateVerdictTier };
}
