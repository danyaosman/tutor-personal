import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export type EduLang = "en" | "ar";

type LanguageToggleProps = {
  lang: EduLang;
  setLang: (lang: EduLang) => void;
};

type EduFooterProps = {
  lang: EduLang;
};

const textNodeOriginals = new WeakMap<Text, string>();
const elementOriginals = new WeakMap<HTMLElement, Record<string, string>>();

const translations: Record<string, string> = {
  "Choose role": "اختيار الدور",
  Login: "تسجيل الدخول",
  "Get Started": "ابدأ الآن",
  "AI Tutor - Digital Twin Learning": "مدرس ذكي - تعلم بتوأم رقمي",
  "Learn from a teacher's": "تعلم من أسلوب",
  "Digital Twin": "التوأم الرقمي",
  "EduMind helps teachers turn course resources and teaching style into an AI learning experience. Students can ask questions, take quizzes, and review the topics they need to improve.":
    "تساعد EduMind المدرسين على تحويل مصادر الكورس وأسلوب الشرح إلى تجربة تعليمية ذكية. يستطيع الطلاب طرح الأسئلة، حل الاختبارات، ومراجعة المواضيع التي يحتاجون إلى تحسينها.",
  "Join as Teacher": "انضم كمدرس",
  "Join as Student": "انضم كطالب",
  "Digital Twin Ready": "التوأم الرقمي جاهز",
  "Upload PDF": "رفع ملف PDF",
  "Add teaching style": "إضافة أسلوب الشرح",
  "AI Tutor teaches": "المدرس الذكي يشرح",
  "Weak topics appear": "ظهور نقاط الضعف",
  "How it works": "كيف تعمل المنصة؟",
  "One course becomes a personalized AI learning space": "كورس واحد يتحول إلى مساحة تعليمية شخصية",
  "Teacher creates a course": "المدرس ينشئ الكورس",
  "Course information, grade, description, goals, and resources stay connected to the backend.":
    "تبقى معلومات الكورس، المرحلة، الوصف، الأهداف، والمصادر مرتبطة بالباكند.",
  "Uploads resources": "يرفع المصادر",
  "PDF files become searchable course knowledge for student questions.":
    "تتحول ملفات PDF إلى معرفة قابلة للبحث لأسئلة الطلاب.",
  "Digital Twin teaches": "التوأم الرقمي يشرح",
  "The AI answers using course material and teacher guidance.":
    "يجيب الذكاء الاصطناعي اعتماداً على مادة الكورس وتوجيهات المدرس.",
  "Practice finds gaps": "التدريب يكشف الفجوات",
  "Quizzes, flashcards, and progress views help students review weak topics.":
    "تساعد الاختبارات والبطاقات وصفحات التقدم الطلاب على مراجعة المواضيع الضعيفة.",
  Teacher: "مدرس",
  Student: "طالب",
  "Build your teaching twin": "ابن توأمك التعليمي",
  "Create courses, upload PDFs, add teaching instructions, and follow student progress.":
    "أنشئ الكورسات، ارفع ملفات PDF، أضف تعليمات الشرح، وتابع تقدم الطلاب.",
  "Learn with AI support": "تعلم بدعم ذكي",
  "Join courses, ask the AI Tutor questions, take quizzes, and improve weak topics.":
    "انضم للكورسات، اسأل المدرس الذكي، حل الاختبارات، وحسن نقاط ضعفك.",
  Platform: "المنصة",
  Home: "الرئيسية",
  "Choose role": "اختيار الدور",
  Workspaces: "المسارات",
  "Teacher space": "مساحة المدرس",
  "Student space": "مساحة الطالب",
  System: "النظام",
  "Smart learning interface project": "مشروع واجهة تعليمية ذكية",
  Courses: "الكورسات",
  Syllabus: "الخطة",
  Analytics: "التحليلات",
  Settings: "الإعدادات",
  Quizzes: "الاختبارات",
  Flashcards: "البطاقات",
  Progress: "التقدم",
  Logout: "تسجيل الخروج",
  "Create account": "إنشاء حساب",
  EduMind: "EduMind",
  "Welcome back": "مرحباً بعودتك",
  "Sign in to continue building your AI teaching twin.": "سجل الدخول لمتابعة استخدام منصتك التعليمية الذكية.",
  Username: "اسم المستخدم",
  Password: "كلمة المرور",
  "Sign In": "تسجيل الدخول",
  "Signing in...": "جاري تسجيل الدخول...",
  "Create one": "أنشئ حساباً",
  "Don't have an account?": "ليس لديك حساب؟",
  "Create your account": "إنشاء حساب",
  "Start learning or training your AI teaching twin in minutes.": "ابدأ التعلم أو تدريب التوأم التعليمي خلال دقائق.",
  "Teacher account": "حساب المدرس",
  "Student account": "حساب الطالب",
  "Build your teaching twin.": "ابن توأمك التعليمي.",
  "Start learning smarter.": "ابدأ تعلماً أذكى.",
  "Create courses, upload PDFs, add teaching instructions, and follow student progress from one clean dashboard.":
    "أنشئ الكورسات، ارفع ملفات PDF، أضف تعليمات الشرح، وتابع تقدم الطلاب من لوحة واحدة.",
  "Join courses, chat with your teacher's Digital Twin, take quizzes, and understand your weak topics faster.":
    "انضم للكورسات، تحدث مع التوأم الرقمي للمدرس، حل الاختبارات، وافهم نقاط ضعفك بسرعة.",
  "I am a Teacher": "أنا مدرس",
  "I am a Student": "أنا طالب",
  "First name": "الاسم الأول",
  "First Name": "الاسم الأول",
  "Last name": "اسم العائلة",
  "Last Name": "اسم العائلة",
  Email: "البريد الإلكتروني",
  Phone: "الهاتف",
  "I am a": "أنا",
  "Grade Level": "المرحلة الدراسية",
  "Create Account": "إنشاء الحساب",
  "Creating account...": "جاري إنشاء الحساب...",
  "Already have an account?": "لديك حساب بالفعل؟",
  "Sign in": "تسجيل الدخول",
  "Choose your workspace": "اختر مساحة العمل",
  "How will you use EduMind?": "كيف ستستخدم EduMind؟",
  "Choose the backend-supported role for the demo flow: teacher or student.":
    "اختر الدور المدعوم في الباكند لمسار العرض: مدرس أو طالب.",
  "Build courses and Digital Twins": "ابن الكورسات والتوائم الرقمية",
  "Create courses, upload PDFs, tune teaching guidance, and inspect student progress.":
    "أنشئ الكورسات، ارفع ملفات PDF، اضبط توجيهات الشرح، وتابع تقدم الطلاب.",
  "Create teacher account": "إنشاء حساب مدرس",
  "Create student account": "إنشاء حساب طالب",
  "My Courses": "كورساتي",
  "View your enrolled courses or browse active courses from tutors.": "اعرض كورساتك المسجلة أو تصفح الكورسات النشطة من المدرسين.",
  "Create, manage, and organize the courses you teach.": "أنشئ وأدر ونظم الكورسات التي تدرسها.",
  "Update your tutor profile and the guidance used for your teaching twin.":
    "حدّث ملف المدرس والتوجيهات المستخدمة في التوأم التعليمي.",
  "Keep your learner profile current for course recommendations and progress reporting.":
    "حافظ على تحديث ملف الطالب لتوصيات الكورسات وتقارير التقدم.",
  "Take practice quizzes generated from your enrolled course PDFs.":
    "حل اختبارات تدريبية مولدة من ملفات PDF الخاصة بالكورسات المسجلة.",
  "Review flashcards generated from your enrolled course PDFs.":
    "راجع البطاقات التعليمية المولدة من ملفات PDF الخاصة بالكورسات المسجلة.",
  "Track your course activity, quiz performance, flashcards, and AI tutor usage.":
    "تابع نشاط الكورسات، أداء الاختبارات، البطاقات، واستخدام المدرس الذكي.",
  "Shape how the AI tutor explains your course material to learners.":
    "حدد كيف يشرح المدرس الذكي مادة الكورس للطلاب.",
  "Generate and refine course syllabi from your uploaded materials.":
    "ولّد وعدّل خطط الكورسات من المواد المرفوعة.",
  "Understand course performance, learner activity, and weak topic signals.":
    "افهم أداء الكورسات، نشاط الطلاب، وإشارات المواضيع الضعيفة.",
  "View your enrolled courses or browse active courses from tutors.": "اعرض كورساتك أو تصفح الكورسات النشطة من المدرسين.",
  "Browse Catalog": "تصفح الكتالوج",
  "Generate from a Course": "توليد من كورس",
  "Open Courses": "فتح الكورسات",
  Open: "فتح",
  Close: "إغلاق",
  "View Previous": "عرض السابق",
  Start: "ابدأ",
  Retake: "إعادة",
  "Submit Quiz": "تسليم الاختبار",
  Previous: "السابق",
  Next: "التالي",
  "Save Settings": "حفظ الإعدادات",
  "Saving...": "جاري الحفظ...",
  "Profile saved.": "تم حفظ الملف الشخصي.",
  "Tutor Profile": "ملف المدرس",
  "Learner Profile": "ملف الطالب",
  "Teaching Style Summary": "ملخص أسلوب الشرح",
  "AI Instructions": "تعليمات الذكاء الاصطناعي",
  Bio: "نبذة",
  "Current Weakness Summary": "ملخص نقاط الضعف الحالي",
  "Loading profile...": "جاري تحميل الملف الشخصي...",
  "Loading quizzes...": "جاري تحميل الاختبارات...",
  "Loading flashcard sets...": "جاري تحميل البطاقات...",
  "Loading progress...": "جاري تحميل التقدم...",
  "No quizzes yet": "لا توجد اختبارات بعد",
  "No flashcards yet": "لا توجد بطاقات بعد",
  "Course Progress": "تقدم الكورس",
  "Recent Quiz Attempts": "محاولات الاختبارات الأخيرة",
  "Quiz Attempt": "محاولة الاختبار",
  "Enrolled Courses": "الكورسات المسجلة",
  "Quiz Attempts": "محاولات الاختبار",
  "Best Score": "أفضل نتيجة",
  "Average Score": "متوسط النتيجة",
  "Chat Sessions": "جلسات المحادثة",
  "Student Messages": "رسائل الطالب",
  "No enrolled courses yet": "لا توجد كورسات مسجلة بعد",
  "Browse Courses": "تصفح الكورسات",
  "No quiz attempts yet.": "لا توجد محاولات اختبار بعد.",
  "Correct": "صحيح",
  "Incorrect": "غير صحيح",
  "Selected Choice": "الإجابة المختارة",
  "Correct Choice": "الإجابة الصحيحة",
  "Quiz": "اختبار",
  "Course": "الكورس",
  Questions: "الأسئلة",
  Attempts: "المحاولات",
  Status: "الحالة",
  Action: "الإجراء",
  Ready: "جاهز",
  Completed: "مكتمل",
  Sets: "المجموعات",
  "Flashcard Review": "مراجعة البطاقات",
  Front: "الأمام",
  Back: "الخلف",
  "Click to flip": "اضغط للقلب",
  "All enrolled courses": "كل الكورسات المسجلة",
  "Filter by course": "تصفية حسب الكورس",
  "Browse active courses": "تصفح الكورسات النشطة",
  "Loading active courses...": "جاري تحميل الكورسات النشطة...",
  "No active courses are available right now.": "لا توجد كورسات نشطة حالياً.",
  "No courses match your search.": "لا توجد كورسات تطابق البحث.",
  Enroll: "تسجيل",
  Enrolled: "مسجل",
  "Enrolling...": "جاري التسجيل...",
  "Open Notebook": "فتح الدفتر",
  Unenroll: "إلغاء التسجيل",
  "Unenrolling...": "جاري إلغاء التسجيل...",
  Cancel: "إلغاء",
  "Unenroll from this course?": "إلغاء التسجيل من هذا الكورس؟",
  "Page not found": "الصفحة غير موجودة",
  "The page you're looking for doesn't exist.": "الصفحة التي تبحث عنها غير موجودة.",
  "Go home": "العودة للرئيسية",
  "This page didn't load": "تعذر تحميل هذه الصفحة",
  "Something went wrong. Try refreshing or head back home.": "حدث خطأ ما. حاول التحديث أو عد للرئيسية.",
  "Try again": "حاول مرة أخرى",
  "Teacher workspace": "مساحة المدرس",
  "Student workspace": "مساحة الطالب",
  "A live overview of your courses, learner activity, and generated weakness reports.":
    "نظرة مباشرة على الكورسات ونشاط الطلاب وتقارير نقاط الضعف المولدة.",
  "Loading analytics...": "جاري تحميل التحليلات...",
  Students: "الطلاب",
  "Weak Topics": "المواضيع الضعيفة",
  Resources: "المصادر",
  "Flashcard Sets": "مجموعات البطاقات",
  "Course Activity": "نشاط الكورسات",
  "Create a course to start collecting analytics.": "أنشئ كورساً لبدء جمع التحليلات.",
  "Recent Weakness Reports": "تقارير نقاط الضعف الأخيرة",
  "No weakness reports generated yet.": "لم يتم إنشاء تقارير نقاط ضعف بعد.",
  "Weakness Report": "تقرير نقاط الضعف",
  "Loading report...": "جاري تحميل التقرير...",
  "Generated At": "تاريخ الإنشاء",
  "Generated": "تم الإنشاء",
  "Summary": "الملخص",
  "Recommendations": "التوصيات",
  "No recommendations yet.": "لا توجد توصيات بعد.",
  "No attempts": "لا توجد محاولات",
  "Not answered": "لم تتم الإجابة",
  "Loading attempt...": "جاري تحميل المحاولة...",
  "Profile Settings": "إعدادات الملف الشخصي",
  "Twin Profile": "ملف التوأم",
  "Teaching Style": "أسلوب الشرح",
  "Edit Profile Guidance": "تعديل توجيهات الملف",
  "Loading courses...": "جاري تحميل الكورسات...",
  "No courses yet": "لا توجد كورسات بعد",
  "Create Course": "إنشاء كورس",
  "Style Knowledge": "معرفة الأسلوب",
  "Teaching Examples": "أمثلة الشرح",
  "Style Files": "ملفات الأسلوب",
  "Add teaching style evidence": "إضافة دلائل على أسلوب الشرح",
  "Write a short example or upload a PDF/TXT file that shows how you explain topics.":
    "اكتب مثالاً قصيراً أو ارفع ملف PDF/TXT يوضح طريقة شرحك للمواضيع.",
  "Teaching example": "مثال شرح",
  "Paste a teaching explanation, tone sample, or preferred instruction style...":
    "الصق شرحاً تعليمياً أو عينة من الأسلوب أو طريقة التوجيه المفضلة...",
  "Reference file": "ملف مرجعي",
  "Save Style Reference": "حفظ مرجع الأسلوب",
  "Saving reference...": "جاري حفظ المرجع...",
  "Saved style reference.": "تم حفظ مرجع الأسلوب.",
  "Search examples...": "البحث في الأمثلة...",
  "Search files...": "البحث في الملفات...",
  "View All": "عرض الكل",
  "Manage Examples": "إدارة الأمثلة",
  "Manage Files": "إدارة الملفات",
  "No teaching examples yet": "لا توجد أمثلة شرح بعد",
  "No style files yet": "لا توجد ملفات أسلوب بعد",
  "Delete": "حذف",
  "Update": "تحديث",
  "Updating...": "جاري التحديث...",
  "Deleting...": "جاري الحذف...",
  "Resource role": "دور المصدر",
  "Course material": "مادة الكورس",
  "Teaching style example": "مثال على أسلوب الشرح",
  "Upload Resource": "رفع مصدر",
  "Uploading...": "جاري الرفع...",
  "Create New Course": "إنشاء كورس جديد",
  "Course Title": "عنوان الكورس",
  Subject: "المادة",
  Description: "الوصف",
  Status: "الحالة",
  "Learning Objectives": "أهداف التعلم",
  "What students will learn...": "ما الذي سيتعلمه الطلاب...",
  "Cancel": "إلغاء",
  "Creating...": "جاري الإنشاء...",
  "Open Course": "فتح الكورس",
  active: "نشط",
  draft: "مسودة",
  archived: "مؤرشف",
};

const extraTranslations: Record<string, string> = {
  "An intelligent learning platform that helps teachers build a Digital Twin and helps students study in a personalized way.":
    "منصة تعليمية ذكية تساعد المدرس على بناء توأم رقمي وتساعد الطالب على التعلم بطريقة شخصية.",
  "PDF Resources": "مصادر PDF",
  "Weakness Analysis": "تحليل نقاط الضعف",
  "Generate and refine course plans from your course details and uploaded resources.":
    "ولّد وعدّل خطط الكورسات من تفاصيل الكورس والمصادر المرفوعة.",
  "Profile Settings": "إعدادات الملف الشخصي",
  "Add Teaching Style Example": "إضافة مثال على أسلوب الشرح",
  Example: "مثال",
  "Style file": "ملف الأسلوب",
  "TXT files become teaching examples. PDFs are processed as style references for the AI tutor.":
    "ملفات TXT تتحول إلى أمثلة شرح. وملفات PDF تتم معالجتها كمراجع أسلوب للمدرس الذكي.",
  "Selected file": "الملف المحدد",
  "Save Style Input": "حفظ مدخل الأسلوب",
  "Typed Style Examples": "أمثلة الأسلوب المكتوبة",
  "Uploaded Style Files": "ملفات الأسلوب المرفوعة",
  "View more": "عرض المزيد",
  "Loading examples...": "جاري تحميل الأمثلة...",
  "Select a course to view teaching style examples.": "اختر كورساً لعرض أمثلة أسلوب الشرح.",
  "No examples yet": "لا توجد أمثلة بعد",
  "Loading style files...": "جاري تحميل ملفات الأسلوب...",
  "No style files uploaded": "لا توجد ملفات أسلوب مرفوعة",
  "Search examples": "البحث في الأمثلة",
  "Search files": "البحث في الملفات",
  "No examples match your search.": "لا توجد أمثلة تطابق البحث.",
  "No style files match your search.": "لا توجد ملفات أسلوب تطابق البحث.",
  "Not configured yet.": "لم يتم الإعداد بعد.",
  Edit: "تعديل",
  "Save Changes": "حفظ التغييرات",
  "Completed PDF files are fed into the AI tutor as teaching style references.":
    "ملفات PDF المكتملة تُرسل إلى المدرس الذكي كمراجع لأسلوب الشرح.",
  "Delete this teaching style example?": "هل تريد حذف مثال أسلوب الشرح هذا؟",
  "Write an example or upload a PDF/TXT style reference.": "اكتب مثالاً أو ارفع مرجع أسلوب PDF/TXT.",
  "Upload a PDF or TXT file for teaching style references.": "ارفع ملف PDF أو TXT لمراجع أسلوب الشرح.",
  "The selected text file is empty.": "ملف النص المحدد فارغ.",
  "Paste or write an explanation that sounds like your teaching style":
    "الصق أو اكتب شرحاً يشبه أسلوبك في التدريس",
  "Syllabus Draft": "مسودة الخطة",
  Updated: "تم التحديث",
  Generate: "توليد",
  Save: "حفظ",
  "Loading syllabus...": "جاري تحميل الخطة...",
  "Select a course to manage its syllabus.": "اختر كورساً لإدارة خطته.",
  "Source text or instructions": "النص المصدر أو التعليمات",
  "Paste curriculum notes, weekly goals, unit outlines, or instructions for the generated syllabus.":
    "الصق ملاحظات المنهج أو الأهداف الأسبوعية أو مخططات الوحدات أو تعليمات للخطة المولدة.",
  "PDF sources": "مصادر PDF",
  "Upload course PDFs here, then generate a syllabus from the extracted text.":
    "ارفع ملفات PDF الخاصة بالكورس هنا، ثم ولّد خطة من النص المستخرج.",
  "tutor source": "مصدر مدرس",
  "tutor sources": "مصادر مدرس",
  Clear: "مسح",
  "Generated syllabus draft": "مسودة الخطة المولدة",
  "Generate from pasted text and uploaded PDFs, then make final edits here.":
    "ولّد من النص الملصق وملفات PDF المرفوعة، ثم أجرِ التعديلات النهائية هنا.",
  "Not saved yet": "لم يتم الحفظ بعد",
  completed: "مكتمل",
  processing: "قيد المعالجة",
  uploaded: "مرفوع",
  failed: "فشل",
  "Search by title, teacher, subject, or description...": "ابحث بالعنوان أو المدرس أو المادة أو الوصف...",
  "Loading your courses...": "جاري تحميل كورساتك...",
  "You are not enrolled in any courses yet": "لم تسجل في أي كورس بعد",
  "Browse active courses and enroll to start asking the AI tutor.": "تصفح الكورسات النشطة وسجل لتبدأ سؤال المدرس الذكي.",
  Active: "نشط",
  Draft: "مسودة",
  Archived: "مؤرشف",
  "Add New Course": "إضافة كورس جديد",
  "Create a new course": "إنشاء كورس جديد",
  Title: "العنوان",
  Grade: "المرحلة",
  "e.g. Intro to Machine Learning": "مثال: مقدمة في تعلم الآلة",
  "Computer Science": "علوم الحاسوب",
  "Create your first course to begin building your Digital Twin.": "أنشئ أول كورس لتبدأ بناء التوأم الرقمي.",
  "Try Again": "حاول مرة أخرى",
  "No quizzes match this course filter.": "لا توجد اختبارات تطابق فلتر هذا الكورس.",
  "Open an enrolled course and generate a quiz from its processed resources.": "افتح كورساً مسجلاً وولّد اختباراً من مصادره المعالجة.",
  "Loading questions...": "جاري تحميل الأسئلة...",
  "Quiz submitted": "تم تسليم الاختبار",
  "Previous Attempt": "المحاولة السابقة",
  "Your answer": "إجابتك",
  "Your answer:": "إجابتك:",
  "Correct answer": "الإجابة الصحيحة",
  "Correct answer:": "الإجابة الصحيحة:",
  "No answer": "لا توجد إجابة",
  "No flashcard sets match this course filter.": "لا توجد مجموعات بطاقات تطابق فلتر هذا الكورس.",
  "Open an enrolled course and generate flashcards from its processed resources.": "افتح كورساً مسجلاً وولّد بطاقات من مصادره المعالجة.",
  "Loading cards...": "جاري تحميل البطاقات...",
  Cards: "البطاقات",
  cards: "بطاقات",
  Best: "الأفضل",
  Average: "المتوسط",
};

function translateValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const normalized = trimmed.replace(/\s+/g, " ");
  const translated =
    translations[trimmed] ??
    extraTranslations[trimmed] ??
    translations[normalized] ??
    extraTranslations[normalized];
  if (translated) return value.replace(trimmed, translated);

  const dynamicTranslations: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^Teacher workspace - (.+)$/u, (match) => `مساحة المدرس - ${match[1]}`],
    [/^Student workspace - (.+)$/u, (match) => `مساحة الطالب - ${match[1]}`],
    [/^(\d+) students enrolled$/u, (match) => `${match[1]} طالب مسجل`],
    [/^(\d+) students$/u, (match) => `${match[1]} طالب`],
    [/^(\d+) resources$/u, (match) => `${match[1]} مصدر`],
    [/^(\d+) weak topics$/u, (match) => `${match[1]} موضوع ضعيف`],
    [/^(\d+) questions$/u, (match) => `${match[1]} سؤال`],
    [/^(\d+) cards$/u, (match) => `${match[1]} بطاقة`],
    [/^Question (\d+)$/u, (match) => `السؤال ${match[1]}`],
    [/^Card (\d+) of (\d+)$/u, (match) => `البطاقة ${match[1]} من ${match[2]}`],
    [/^(\d+) of (\d+) answered$/u, (match) => `${match[1]} من ${match[2]} تمت الإجابة`],
    [/^with (.+)$/u, (match) => `مع ${match[1]}`],
    [/^(.+) with (.+)$/u, (match) => `${match[1]} مع ${match[2]}`],
    [/^Generated (.+)$/u, (match) => `تم الإنشاء ${match[1]}`],
    [/^Grade (.+)$/u, (match) => `المرحلة ${match[1]}`],
    [/^Updated (.+)$/u, (match) => `تم التحديث ${match[1]}`],
    [/^(\d+) tutor source$/u, (match) => `${match[1]} مصدر مدرس`],
    [/^(\d+) tutor sources$/u, (match) => `${match[1]} مصادر مدرس`],
    [/^Delete "(.+)" from style files\?$/u, (match) => `هل تريد حذف "${match[1]}" من ملفات الأسلوب؟`],
    [
      /^This removes "(.+)" from your enrolled courses\. You can enroll again later if the course is still active\.$/u,
      (match) =>
        `سيتم حذف "${match[1]}" من كورساتك المسجلة. يمكنك التسجيل مرة أخرى لاحقاً إذا بقي الكورس نشطاً.`,
    ],
  ];

  for (const [pattern, translate] of dynamicTranslations) {
    const match = normalized.match(pattern);
    if (match) return value.replace(trimmed, translate(match));
  }

  return value;
}

export function translateUiText(value: string, lang?: EduLang) {
  const currentLang =
    lang ??
    (typeof document !== "undefined" && document.documentElement.lang === "ar" ? "ar" : "en");
  return currentLang === "ar" ? translateValue(value) : value;
}

function shouldSkipNode(node: Node) {
  const parent = node.parentElement;
  if (!parent) return true;
  return ["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(parent.tagName);
}

function resolveOriginalText(textNode: Text) {
  const current = textNode.nodeValue ?? "";
  const stored = textNodeOriginals.get(textNode);
  if (!stored) {
    textNodeOriginals.set(textNode, current);
    return current;
  }

  const translatedStored = translateValue(stored);
  if (current !== stored && current !== translatedStored) {
    textNodeOriginals.set(textNode, current);
    return current;
  }

  return stored;
}

function resolveOriginalAttribute(
  originals: Record<string, string>,
  attr: string,
  current: string,
) {
  const stored = originals[attr];
  if (!stored) {
    originals[attr] = current;
    return current;
  }

  const translatedStored = translateValue(stored);
  if (current !== stored && current !== translatedStored) {
    originals[attr] = current;
    return current;
  }

  return stored;
}

function applyLanguageToDom(lang: EduLang) {
  if (typeof document === "undefined") return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const textNode of textNodes) {
    if (shouldSkipNode(textNode)) continue;
    const original = resolveOriginalText(textNode);
    const nextValue = lang === "ar" ? translateValue(original) : original;
    if (textNode.nodeValue !== nextValue) {
      textNode.nodeValue = nextValue;
    }
  }

  const elements = document.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]");
  elements.forEach((element) => {
    const originals = elementOriginals.get(element) ?? {};
    for (const attr of ["placeholder", "aria-label", "title"]) {
      const value = element.getAttribute(attr);
      if (!value) continue;
      const original = resolveOriginalAttribute(originals, attr, value);
      const nextValue = lang === "ar" ? translateValue(original) : original;
      if (element.getAttribute(attr) !== nextValue) {
        element.setAttribute(attr, nextValue);
      }
    }
    elementOriginals.set(element, originals);
  });
}

export function useEduLang() {
  const [lang, setLangState] = useState<EduLang>(() => {
    if (typeof window === "undefined") return "en";
    const savedLang = localStorage.getItem("edumind_lang");
    return savedLang === "ar" ? "ar" : "en";
  });

  function setLang(nextLang: EduLang) {
    if (typeof window !== "undefined") {
      localStorage.setItem("edumind_lang", nextLang);
    }
    setLangState(nextLang);
  }

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    applyLanguageToDom(lang);

    const observer = new MutationObserver(() => applyLanguageToDom(lang));
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title"],
    });
    return () => observer.disconnect();
  }, [lang]);

  return {
    lang,
    setLang,
    dir: lang === "ar" ? "rtl" : "ltr",
    isArabic: lang === "ar",
  };
}

export function PageLoader() {
  return (
    <div className="edu-page-loader">
      <div className="edu-loader-card">
        <div className="edu-loader-mark">EduMind</div>
        <div className="edu-loader-line" />
      </div>
    </div>
  );
}

export function LanguageToggle({ lang, setLang }: LanguageToggleProps) {
  return (
    <div className="edu-lang-switch" aria-label="Language switcher">
      <button
        type="button"
        className={lang === "en" ? "is-active" : ""}
        onClick={() => setLang("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === "ar" ? "is-active" : ""}
        onClick={() => setLang("ar")}
      >
        AR
      </button>
    </div>
  );
}

export function EduFooter({ lang }: EduFooterProps) {
  const isArabic = lang === "ar";

  return (
    <footer className="edu-site-footer" dir={isArabic ? "rtl" : "ltr"}>
      <div className="edu-footer-inner">
        <div className="edu-footer-brand">
          <h2>EduMind</h2>
          <p>
            An intelligent learning platform that helps teachers build a Digital Twin and helps students study in a personalized way.
          </p>
        </div>
        <div className="edu-footer-col">
          <h3>Platform</h3>
          <Link to="/">Home</Link>
          <Link to="/select-role">Choose role</Link>
          <Link to="/login">Login</Link>
        </div>
        <div className="edu-footer-col">
          <h3>Workspaces</h3>
          <Link to="/tutor/courses">Teacher space</Link>
          <Link to="/learner/courses">Student space</Link>
          <Link to="/tutor/digital-twin">Digital Twin</Link>
        </div>
        <div className="edu-footer-col">
          <h3>System</h3>
          <span>AI Tutor</span>
          <span>PDF Resources</span>
          <span>Weakness Analysis</span>
        </div>
      </div>
      <div className="edu-footer-bottom">
        <span>© 2026 EduMind</span>
        <span>Smart learning interface project</span>
      </div>
    </footer>
  );
}
