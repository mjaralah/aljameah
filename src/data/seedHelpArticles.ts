// Seed content for the admin virtual assistant knowledge base.
// Inserted once into the `help_articles` table. Admins can edit later.

export type SeedArticle = {
  category: string;
  title: string;
  keywords: string[];
  content: string;
  action_label?: string;
  action_url?: string;
  sort_order: number;
};

export const HELP_CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: "dashboard", label: "الرئيسية ولوحة التحكم", icon: "LayoutDashboard" },
  { key: "page_content", label: "محتوى الصفحات", icon: "LayoutTemplate" },
  { key: "media", label: "الأخبار والمركز الإعلامي", icon: "Newspaper" },
  { key: "programs", label: "البرامج", icon: "FolderKanban" },
  { key: "about", label: "من نحن والأعضاء", icon: "Info" },
  { key: "surveys", label: "الاستبيانات", icon: "ClipboardList" },
  { key: "forms", label: "النماذج المخصصة", icon: "ClipboardList" },
  { key: "pages", label: "الصفحات المخصصة والقانونية", icon: "FileText" },
  { key: "board", label: "مجلس الإدارة", icon: "Users" },
  { key: "partners", label: "الشركاء والشريط الرئيسي", icon: "Handshake" },
  { key: "footer", label: "التذييل", icon: "PanelBottom" },
  { key: "governance", label: "ملفات الحوكمة", icon: "ScrollText" },
  { key: "requests", label: "الطلبات والرسائل", icon: "Inbox" },
  { key: "settings", label: "الإعدادات والمستخدمون", icon: "Settings" },
];

const A = (a: Omit<SeedArticle, "sort_order"> & { sort_order?: number }, i: number): SeedArticle => ({
  ...a,
  sort_order: a.sort_order ?? i,
});

export const SEED_ARTICLES: SeedArticle[] = [
  // Dashboard
  A({ category: "dashboard", title: "نظرة عامة على لوحة التحكم", keywords: ["لوحة","رئيسية","نظرة","بداية"], content: "هذه هي الواجهة الرئيسية لإدارة الموقع. تعرض مؤشرات الأداء وآخر التبرعات والإجراءات السريعة وإدارة الاستبيانات.\n\nالخطوات:\n1. افتح لوحة التحكم من الرابط الجانبي.\n2. تابع المؤشرات في الأعلى.\n3. استخدم الأزرار السريعة لإضافة محتوى جديد.", action_label: "افتح لوحة التحكم", action_url: "/admin" }, 0),
  A({ category: "dashboard", title: "كيف أتنقل بين أقسام الإدارة", keywords: ["تنقل","قائمة","جانبية","أقسام"], content: "القائمة الجانبية تحتوي على جميع الأقسام (المحتوى، الطلبات، الإعدادات).\n\nالخطوات:\n1. اضغط على القسم المطلوب من القائمة.\n2. يمكنك طي/فتح الشريط الجانبي من أيقونة القائمة العلوية.\n3. اضغط (معاينة الموقع) لرؤية الموقع كزائر." }, 1),

  // Page content
  A({ category: "page_content", title: "تعديل أقسام الصفحة الرئيسية", keywords: ["رئيسية","أقسام","تعديل","محتوى"], content: "يمكنك تعديل عناوين وأقسام الصفحة الرئيسية والصفحات الأخرى.\n\nالخطوات:\n1. اذهب إلى (محتوى الصفحات).\n2. اختر تبويب الصفحة (الرئيسية، من نحن، ...).\n3. اضغط على القسم وعدل العنوان والمحتوى.\n4. احفظ التغييرات.", action_label: "محتوى الصفحات", action_url: "/admin/page-content" }, 0),
  A({ category: "page_content", title: "إخفاء قسم من الصفحة", keywords: ["إخفاء","قسم","تعطيل"], content: "كل قسم يحتوي على مفتاح (منشور) لإظهاره أو إخفائه دون حذف.\n\nالخطوات:\n1. افتح القسم في محتوى الصفحات.\n2. أوقف مفتاح (منشور).\n3. القسم لن يظهر للزوار حتى تعيد تفعيله.", action_label: "محتوى الصفحات", action_url: "/admin/page-content" }, 1),
  A({ category: "page_content", title: "حذف قسم نهائياً", keywords: ["حذف","قسم"], content: "للحذف الكلي:\n1. افتح القسم.\n2. اضغط زر الحذف (السلة).\n3. أكد العملية. لا يمكن التراجع.", action_label: "محتوى الصفحات", action_url: "/admin/page-content" }, 2),
  A({ category: "page_content", title: "تغيير زر الإجراء (CTA)", keywords: ["زر","cta","إجراء","رابط"], content: "أقسام مثل (تطوع معنا) و(من نحن) تحتوي على زر إجراء.\n\nالخطوات:\n1. افتح القسم.\n2. عدل (نص الزر) و(رابط الزر).\n3. احفظ." }, 3),
  A({ category: "page_content", title: "تعديل العنوان الفرعي (Eyebrow)", keywords: ["عنوان فرعي","eyebrow","تمهيد"], content: "أقسام البرامج والأخبار في الرئيسية فيها عنوان فرعي صغير فوق العنوان.\n\nالخطوات:\n1. افتح القسم.\n2. حقل (العنوان الفرعي) متاح للتعديل.\n3. احفظ." }, 4),

  // Media / news
  A({ category: "media", title: "إضافة خبر جديد", keywords: ["خبر","إضافة","أخبار","نشر"], content: "الخطوات:\n1. اذهب إلى (المركز الإعلامي).\n2. اضغط (إضافة خبر).\n3. أدخل العنوان والملخص والمحتوى الكامل.\n4. ارفع صورة الغلاف.\n5. فعّل (منشور) ثم احفظ.", action_label: "اذهب للمركز الإعلامي", action_url: "/admin/media-center" }, 0),
  A({ category: "media", title: "تعديل خبر منشور", keywords: ["تعديل","خبر"], content: "1. افتح المركز الإعلامي.\n2. ابحث عن الخبر بالعنوان.\n3. اضغط (تعديل).\n4. عدل ثم احفظ.", action_label: "المركز الإعلامي", action_url: "/admin/media-center" }, 1),
  A({ category: "media", title: "حذف أو إخفاء خبر", keywords: ["حذف","إخفاء","خبر","أرشفة"], content: "لإخفاء مؤقت: أوقف مفتاح (منشور).\nللحذف الكامل: اضغط زر السلة بجانب الخبر.", action_label: "المركز الإعلامي", action_url: "/admin/media-center" }, 2),
  A({ category: "media", title: "تغيير صورة الغلاف", keywords: ["صورة","غلاف","رفع"], content: "1. افتح الخبر.\n2. اضغط على الصورة الحالية لرفع صورة جديدة.\n3. الصور الموصى بها بنسبة 16:9 وحجم أقل من 2MB." }, 3),

  // Programs
  A({ category: "programs", title: "إضافة برنامج جديد", keywords: ["برنامج","إضافة","خدمة"], content: "1. اذهب إلى (البرامج).\n2. اضغط (إضافة برنامج).\n3. أدخل العنوان والوصف والأيقونة والصورة.\n4. احفظ.", action_label: "إدارة البرامج", action_url: "/admin/programs" }, 0),
  A({ category: "programs", title: "تعديل أو حذف برنامج", keywords: ["تعديل","حذف","برنامج"], content: "من صفحة البرامج اختر البرنامج ثم استخدم أزرار التعديل أو الحذف.", action_label: "البرامج", action_url: "/admin/programs" }, 1),
  A({ category: "programs", title: "ترتيب البرامج", keywords: ["ترتيب","سحب"], content: "اسحب البرامج لتغيير ترتيب ظهورها في الموقع." }, 2),

  // About
  A({ category: "about", title: "تعديل محتوى صفحة من نحن", keywords: ["من نحن","رؤية","رسالة"], content: "اذهب إلى (محتوى من نحن) لتعديل الرؤية والرسالة والقيم والأقسام المخصصة.", action_label: "محتوى من نحن", action_url: "/admin/about" }, 0),
  A({ category: "about", title: "إضافة عضو في الجمعية العمومية", keywords: ["عضو","جمعية","إضافة"], content: "من (محتوى من نحن) → تبويب الأعضاء، اضغط (إضافة عضو) وأدخل البيانات.", action_label: "محتوى من نحن", action_url: "/admin/about" }, 1),
  A({ category: "about", title: "إظهار/إخفاء بيانات تواصل العضو", keywords: ["تواصل","خصوصية","عضو"], content: "كل عضو لديه مفتاح (نشر بيانات التواصل). أوقفه لإخفاء البريد والجوال عن الزوار." }, 2),

  // Surveys
  A({ category: "surveys", title: "إنشاء استبيان جديد", keywords: ["استبيان","إنشاء","استطلاع"], content: "1. اذهب إلى (الاستبيانات).\n2. اضغط (إنشاء استبيان).\n3. أدخل العنوان والوصف.\n4. أضف الأسئلة (نص، اختيار، تقييم...).\n5. فعّل (منشور).", action_label: "الاستبيانات", action_url: "/admin/surveys" }, 0),
  A({ category: "surveys", title: "إغلاق أو أرشفة استبيان", keywords: ["إغلاق","أرشفة","استبيان"], content: "غيّر الحالة إلى (مؤرشف) أو أدخل تاريخ انتهاء، لمنع استقبال ردود جديدة.", action_label: "الاستبيانات", action_url: "/admin/surveys" }, 1),
  A({ category: "surveys", title: "عرض نتائج الاستبيان", keywords: ["نتائج","تقرير","استبيان"], content: "من قائمة الاستبيانات، اضغط (عرض النتائج) لرؤية المشاركات والإحصاءات." }, 2),

  // Forms
  A({ category: "forms", title: "إنشاء نموذج خدمة جديد", keywords: ["نموذج","فورم","خدمة"], content: "1. اذهب إلى (نماذج الخدمات).\n2. اضغط (إضافة نموذج).\n3. أدخل العنوان والوصف ثم أضف الحقول (نص، رقم، اختيار...).\n4. فعّل النشر.", action_label: "نماذج الخدمات", action_url: "/admin/forms" }, 0),
  A({ category: "forms", title: "مراجعة الردود على النموذج", keywords: ["ردود","نموذج","طلبات"], content: "افتح النموذج ثم تبويب (الردود) لمشاهدة كل ما أُرسل." }, 1),

  // Custom pages + legal
  A({ category: "pages", title: "إنشاء صفحة مخصصة", keywords: ["صفحة","مخصصة","إضافة"], content: "1. اذهب إلى (الصفحات المخصصة).\n2. اضغط (إضافة صفحة).\n3. أدخل العنوان والرابط (slug).\n4. ابنِ المحتوى بالأقسام (نص، صور، أزرار).\n5. انشرها.", action_label: "الصفحات المخصصة", action_url: "/admin/pages" }, 0),
  A({ category: "pages", title: "تعديل الصفحات القانونية", keywords: ["قانونية","خصوصية","شروط"], content: "اذهب إلى (الصفحات القانونية) لتعديل سياسة الخصوصية وشروط الاستخدام وسياسة الكوكيز.", action_label: "الصفحات القانونية", action_url: "/admin/legal-pages" }, 1),

  // Board
  A({ category: "board", title: "إضافة عضو مجلس إدارة", keywords: ["مجلس","إدارة","عضو"], content: "اذهب إلى (مجلس الإدارة) → (إضافة عضو) → أدخل الاسم والمنصب والصورة → احفظ.", action_label: "مجلس الإدارة", action_url: "/admin/board" }, 0),

  // Partners / hero
  A({ category: "partners", title: "إضافة شريك", keywords: ["شريك","شعار"], content: "اذهب إلى (الشركاء) → اضغط (إضافة) → ارفع شعار الشريك مع الاسم والرابط.", action_label: "الشركاء", action_url: "/admin/partners" }, 0),
  A({ category: "partners", title: "تعديل شريط العرض الرئيسي", keywords: ["هيرو","شريط","عرض","سلايدر"], content: "من (شريط العرض الرئيسي) يمكنك إضافة/تعديل/حذف الشرائح المعروضة في أعلى الصفحة الرئيسية.", action_label: "شريط العرض الرئيسي", action_url: "/admin/hero" }, 1),

  // Footer
  A({ category: "footer", title: "تعديل التذييل وروابطه", keywords: ["تذييل","فوتر","روابط"], content: "من (تذييل الموقع) يمكنك إدارة الأقسام والروابط الظاهرة أسفل كل الصفحات.", action_label: "تذييل الموقع", action_url: "/admin/footer" }, 0),

  // Governance
  A({ category: "governance", title: "رفع ملف حوكمة", keywords: ["حوكمة","ملف","pdf","رفع"], content: "1. اذهب إلى (ملفات الحوكمة).\n2. اختر التصنيف أو أنشئ تصنيفاً جديداً.\n3. اضغط (إضافة ملف) وارفع PDF مع العنوان.\n4. انشر.", action_label: "ملفات الحوكمة", action_url: "/admin/governance" }, 0),
  A({ category: "governance", title: "تنظيم تصنيفات الحوكمة", keywords: ["تصنيف","حوكمة"], content: "أنشئ تصنيفات (لوائح، تقارير، سياسات) وأعد ترتيبها بالسحب." }, 1),

  // Requests
  A({ category: "requests", title: "إدارة طلبات التطوع", keywords: ["تطوع","طلبات"], content: "من (طلبات التطوع) راجع الطلبات الجديدة، وغيّر حالتها (قبول/رفض)، وأضف ملاحظات.", action_label: "طلبات التطوع", action_url: "/admin/volunteer-requests" }, 0),
  A({ category: "requests", title: "إدارة طلبات العضوية", keywords: ["عضوية","طلبات"], content: "من (طلبات العضوية) راجع وحدّث الحالة. الطلبات المقبولة يمكن لاحقاً إضافتها للأعضاء.", action_label: "طلبات العضوية", action_url: "/admin/membership-requests" }, 1),
  A({ category: "requests", title: "الرد على رسائل التواصل", keywords: ["رسائل","تواصل","ايميل"], content: "من (رسائل التواصل) تصلك الرسائل، وعند الرد يتم إرسال بريد للمرسل تلقائياً.", action_label: "رسائل التواصل", action_url: "/admin/contact-messages" }, 2),
  A({ category: "requests", title: "مراجعة تقييمات الصفحات", keywords: ["تقييم","فيدباك","صفحات"], content: "من (تقييمات الصفحات) شاهد ملاحظات الزوار على كل صفحة.", action_label: "تقييمات الصفحات", action_url: "/admin/feedback" }, 3),

  // Settings
  A({ category: "settings", title: "تعديل إعدادات الموقع العامة", keywords: ["إعدادات","شعار","الوان","عنوان"], content: "من (الإعدادات العامة) يمكنك تغيير اسم الموقع، الشعار، الألوان، روابط التواصل، وبيانات SEO.", action_label: "الإعدادات", action_url: "/admin/settings" }, 0),
  A({ category: "settings", title: "إضافة مستخدم/محرر جديد", keywords: ["مستخدم","محرر","صلاحيات","دور"], content: "من (المستخدمون والأدوار) أضف بريداً وكلمة سر وحدد دوره (مدير/محرر).", action_label: "المستخدمون", action_url: "/admin/users" }, 1),
  A({ category: "settings", title: "تعديل قوالب البريد", keywords: ["بريد","قالب","ايميل","ترحيب"], content: "من (قوالب البريد) عدّل نصوص رسائل الترحيب والتأكيد والرد التلقائي.", action_label: "قوالب البريد", action_url: "/admin/email-templates" }, 2),
];
