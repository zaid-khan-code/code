export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Programming":   ["code","bug","error","compile","javascript","typescript","react","node","python","sql","api","git","docker","css","html","function","variable","debug","syntax","runtime","algorithm","database","backend","frontend","framework","library","npm","package"],
  "Design":        ["figma","ui","ux","color","typography","wireframe","mockup","logo","illustration","design","layout","spacing","font","icon","visual","prototype","figma","sketch","adobe","canva","poster","banner","graphic"],
  "Academic":      ["math","physics","chemistry","biology","thesis","essay","research","homework","assignment","exam","study","lecture","textbook","formula","equation","proof","theory","university","college","course","grade"],
  "Career":        ["resume","cv","interview","job","internship","linkedin","offer","salary","career","hire","apply","application","cover letter","portfolio","work experience","references","networking","promotion"],
  "Business":      ["marketing","seo","startup","pitch","customer","funnel","conversion","business","revenue","profit","strategy","product","market","brand","campaign","analytics","growth","sales","leads"],
  "Data":          ["excel","spreadsheet","data","analysis","pandas","numpy","model","ml","machine learning","dataset","visualization","chart","graph","statistics","regression","classification","neural","ai","predict"],
  "Language":      ["translate","translation","grammar","ielts","toefl","arabic","urdu","english","french","spanish","language","writing","reading","speaking","listening","vocabulary","pronunciation"],
  "Other":         [],
};

export const URGENCY_KEYWORDS = {
  critical: ["asap","urgent","today","deadline today","emergency","immediately","right now","in 1 hour","in one hour","in 2 hours","tonight","due tonight","submit tonight","submit today","last chance"],
  high:     ["tomorrow","tonight","within 24","by end of day","soon","quick","quickly","need fast","before demo","demo day","submission","by morning","by evening","within hours"],
  medium:   ["this week","a few days","when possible","few days","next few","in a few","couple days","by friday","by monday","within the week"],
  low:      ["whenever","no rush","eventually","long term","someday","not urgent","take your time","no deadline","flexible","whenever you can"],
};

export const RESPONSE_TEMPLATES = [
  "Happy to help. Can you share what you've already tried?",
  "I think I can assist. Is the deadline firm?",
  "I've worked on similar before — shoot me a message with the details.",
  "Let me know the exact error/output you're seeing and I'll take a look.",
  "I can pair on this tonight — does a 30-min call work?",
  "Can you share more context about your setup? That'll help me give better advice.",
  "I've handled this type of problem before. DM me and we can work through it.",
];

export const SKILL_INTEREST_MAP: Record<string, string[]> = {
  "JavaScript":      ["Web Dev","Open Source"],
  "TypeScript":      ["Web Dev","Open Source"],
  "React":           ["Web Dev","Design Systems"],
  "Node.js":         ["Web Dev","Open Source"],
  "Python":          ["AI/ML","Data Science","Open Source"],
  "Machine Learning":["AI/ML","Data Science"],
  "Data Analysis":   ["Data Science"],
  "Figma":           ["Design Systems"],
  "UI Design":       ["Design Systems"],
  "UX Research":     ["Design Systems"],
  "Marketing":       ["Startups","Community"],
  "Writing":         ["Writing"],
  "Public Speaking": ["Teaching","Community"],
  "Career Advice":   ["Teaching","Productivity"],
  "Teaching":        ["Teaching","Community"],
};
