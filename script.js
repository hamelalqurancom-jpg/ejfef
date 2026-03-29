document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS (Animations)
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Elements
    const mainHeader = document.getElementById('mainHeader');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Mobile Menu Toggle
    const toggleMenu = () => {
        if (!mobileNav || !mobileOverlay) return;
        mobileNav.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    };

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }

        // Close mobile menu on scroll to prevent transparency/scrolling issues
        if (mobileNav && mobileNav.classList.contains('active')) {
            toggleMenu();
        }
    });

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // --- Countdown Timer Logic ---
    const countdownTarget = new Date("Feb 8, 2026 00:00:00").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = countdownTarget - now;

        if (distance < 0) {
            const countdownEl = document.getElementById("countdown");
            if (countdownEl) countdownEl.style.display = "none";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minsEl = document.getElementById("minutes");
        const secsEl = document.getElementById("seconds");

        if (daysEl) daysEl.innerText = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.innerText = hours.toString().padStart(2, '0');
        if (minsEl) minsEl.innerText = minutes.toString().padStart(2, '0');
        if (secsEl) secsEl.innerText = seconds.toString().padStart(2, '0');
    };

    if (document.getElementById("countdown")) {
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    // --- Navigation & Scroll logic cleaned up ---
    // Hero buttons scroll logic
    // Hero buttons scroll logic handled by generic smooth scroll below
    const heroBtns = document.querySelectorAll('.hero-btns .btn');
    heroBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // --- Modern Visit Tracking System ---
    const trackVisit = async () => {
        // Only track once per session to avoid refresh spam
        if (sessionStorage.getItem('h_visit_tracked')) return;

        try {
            if (typeof db !== 'undefined' && db) {
                await db.collection('visits').add({
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    path: window.location.pathname
                });
                sessionStorage.setItem('h_visit_tracked', 'true');
            }
        } catch (error) {
            console.error("Tracking error:", error);
        }
    };

    // Track on load
    // trackVisit() call moved to after Firebase init

    // Smooth Scrolling for all internal links

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Force AOS refresh after a short delay to account for smooth scroll
                setTimeout(() => {
                    AOS.refresh();
                }, 800);
            }
        });
    });

    // Contact Form (WhatsApp + Firebase)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const phone = document.getElementById('contactPhone').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            // Feedback: Change button text
            const submitBtn = contactForm.querySelector('button');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = 'جاري الإرسال...';

            try {
                // Save to Firebase if configured
                if (isFirebaseConfigured && db) {
                    await db.collection('messages').add({
                        name,
                        phone,
                        message,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 'جديد'
                    });
                }

                const whatsappNumber = '201002200841';
                let messageText = `📬 *رسالة جديدة من الموقع* \n\n`;
                messageText += `👤 *الاسم:* ${name}\n`;
                messageText += `📱 *رقم الهاتف:* ${phone}\n`;
                messageText += `💬 *الرسالة:* ${message}`;

                const encodedText = encodeURIComponent(messageText);
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

                window.open(whatsappUrl, '_blank');
                contactForm.reset();
                alert('تم إرسال رسالتك وحفظها بنجاح.');
            } catch (error) {
                console.error("Error saving message:", error);
                alert('حدث خطأ أثناء الإرسال، سيتم فتح الواتساب فقط.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }

    // Stats Counter Animation
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;

    const startCounters = () => {
        counters.forEach(counter => {
            const originalText = counter.innerText;
            const hasPlus = originalText.includes('+');
            const hasK = originalText.includes('K');
            const target = parseInt(originalText.replace('+', '').replace('K', '').replace(',', ''));
            if (isNaN(target)) return;

            let current = 0;
            const increment = target / speed;

            const updateCount = () => {
                current += increment;

                if (current < target) {
                    let displayValue = Math.ceil(current);
                    if (hasK) displayValue = displayValue + 'K';
                    if (hasPlus) displayValue = displayValue + '+';

                    counter.innerText = displayValue;
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = originalText;
                }
            };
            updateCount();
        });
    };

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startCounters();
                observer.unobserve(statsSection);
            }
        }, { threshold: 0.5 });
        observer.observe(statsSection);
    }

    // --- Past Winners History & Restriction Logic ---
    const PAST_YEAR_WINNERS = {
        1: ["أحمد السيد مصطفى قنديل", "السيد سعد مصطفى كلبوش", "أبرار يحيى فتحي عطية", "أحمد عبدالله إسماعيل النجار", "ملك محمد أحمد العدوي", "رمضان أشرف محمد الطريني", "بسملة خالد كشكة", "محمد علي أحمد السيد علي", "منة إبراهيم محمد مخيمر", "فاطمة محمد أحمد غبيش"],
        2: ["آلاء محمد عبدالنبي دويدار", "فاطمة محمد محمد البرهامي", "مالك مصطفى السيد فوز الله", "بسملة طه عبدالعزيز علي", "منار عبدالحميد رمضان البرهامي", "ياسمين حسين مصطفى صحصاح", "زياد محمد عادل ابراهيم", "هاجر عبدالرازق الغفلول", "محمد السيد محمد خفاجي", "جنى السيد علي الطريني"],
        3: ["مازن مصطفى السيد فوز الله", "سلمى إبراهيم بسيوني خلف", "يوسف طه يوسف ياسين", "أنس عيسى محمد دويدار", "تقى عبدالرازق بسيوني خلف", "عمر إكرامي السيد عفيفي", "محمد حلمي جمال سالم", "أحمد عبدالرازق الطريني", "زياد يوسف عبداللطيف", "يوسف هيثم السيد العفيفي", "رنا صابر عبدالمحسن زليطة", "محمد محمود سليمان", "صلاح حمادة صلاح أبو الخير", "عدي أشرف نجيب الغفلول", "أحمد مصطفى حسن الفضالي", "ياسمين عبدالرازق بسيوني خلف", "محمد أحمد محمد الدميري", "ريم مخيمر السعودي", "محمد يحيى عطية", "عبدالحليم صابر ابوشعيشع النجار"],
        4: ["مالك فتحي حسن النجار", "ماريا إكرامي السيد العفيفي", "كريم هيثم عبدالعزيز خلفة", "جنى حسني يوسف ليلة", "جنى محمود إبراهيم شلبي", "محمد عبدالحميد العدوي", "رنا درغام محمد زليطة", "عبدالمنعم وائل الجوهري", "أنس فتحي طه الحشاش", "أسيل فتحي فؤاد البهبيتي", "زياد غازي أحمد الطريني", "كريم أحمد فؤاد البهبيتي", "جنى صابر محمد عبدالحليم", "عائشة طاهر اسماعيل الشيخ", "عمر أحمد مصطفى زردق", "رمضان إبراهيم رمضان زليطة", "أيسل فتحي سيدأحمد خفاجي", "معاذ عماد حمدي عبدالله", "مصطفى بسيوني الزرزور", "بسملة محمد علي عابدين", "روفان بلال الفخراني", "آدم عيسى عبدالرازق العدوي", "عبدالرحمن سامح الحسني", "حنان فرج عبدالخالق الغفلول", "رهف حمادة طه سليم", "منى رجب عبدالستار علي", "محمد سيدأحمد عبدالفتاح زايد", "روقية رمزي عطية الفيشاوي", "أنس محمد فتوح زليطة", "عبدالعزيز عبدالله خلفة", "رودينا محمد سيدأحمد أبوالسعود", "حسن سامح حسن الغفلول"]
    };

    const LEVEL_HIERARCHY = {
        'المستوى الأول (القرآن كاملاً)': 1,
        'المستوى الثاني (ثلاثة أرباع القرآن)': 2,
        'المستوى الثالث (نصف القرآن)': 3,
        'المستوى الرابع (ربع القرآن)': 4
    };

    function normalizeArabicName(name) {
        if (!name) return "";
        return name.trim()
            .replace(/\s+/g, ' ')
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/[ى]/g, 'ي')
            .replace(/[ـ]/g, ''); // إزالة التطويل
    }

    // --- Firebase Configuration ---
    const firebaseConfig = {
        apiKey: "AIzaSyCsVH5BVV9abx66UicOa51T1qADmUVrd7U",
        authDomain: "hamel-b7a68.firebaseapp.com",
        projectId: "hamel-b7a68",
        storageBucket: "hamel-b7a68.firebasestorage.app",
        messagingSenderId: "818022836347",
        appId: "1:818022836347:web:ebcdef3f19c53cd1ef1ade",
        measurementId: "G-HEMLZDRBS3"
    };

    // Initialize Firebase
    let db = null;
    let storage = null;
    let auth = null;
    const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

    if (typeof firebase !== 'undefined' && isFirebaseConfigured) {
        try {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            storage = firebase.storage();
            auth = firebase.auth();

            // Track visit after Firebase is ready
            trackVisit();
        } catch (err) {
            console.error("Firebase Init Error:", err);
        }
    }



    let appSettings = {
        registrationStatus: 'open',
        nominationStatus: 'open',
        storyStatus: 'open'
    };

    async function fetchSettings() {
        if (!isFirebaseConfigured || !db) return;
        try {
            const doc = await db.collection('settings').doc('appConfig').get();
            if (doc.exists) {
                appSettings = doc.data();
                applySettings();
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
        }
    }

    function applySettings() {
        // Main Registration Section enforcement
        const regForm = document.getElementById('registrationForm');
        const countdownEl = document.getElementById('countdown');

        if (appSettings.registrationStatus === 'closed') {
            if (regForm) {
                const formHeader = regForm.closest('.apply-card')?.querySelector('.form-header p');
                if (formHeader) {
                    formHeader.innerHTML = '<span style="color: #ff4d4d; font-weight: bold; font-size: 1.2rem;">⚠️ عذراً، باب التقديم الإلكتروني مغلق حالياً.</span>';
                }
                regForm.style.opacity = '0.6';
                regForm.style.pointerEvents = 'none';
                const submitBtn = document.getElementById('submitBtn');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    const btxt = submitBtn.querySelector('.btn-text');
                    if (btxt) btxt.textContent = 'باب التقديم مغلق';
                    submitBtn.style.background = '#666';
                }
            }
            // Update Hero Badge if it exists
            const heroBadge = document.querySelector('.hero-badge');
            if (heroBadge) {
                heroBadge.textContent = 'باب التقديم مغلق حالياً';
                heroBadge.style.background = 'rgba(255, 77, 77, 0.2)';
                heroBadge.style.color = '#ff4d4d';
                heroBadge.style.borderColor = '#ff4d4d';
            }
        } else {
            // Normal state
        }

        // Nomination Section enforcement
        const nominationForm = document.getElementById('nominationForm');
        if (appSettings.nominationStatus === 'closed') {
            if (nominationForm) {
                nominationForm.style.opacity = '0.6';
                nominationForm.style.pointerEvents = 'none';
                const nomBtn = nominationForm.querySelector('button');
                if (nomBtn) {
                    nomBtn.disabled = true;
                    nomBtn.textContent = 'باب الترشيح مغلق';
                    nomBtn.style.background = '#666';
                }
            }
        }

        // Story Section enforcement
        const quranStoriesSection = document.getElementById('quran-stories-section');
        if (appSettings.storyStatus === 'closed') {
            if (quranStoriesSection) {
                quranStoriesSection.style.display = 'none';
            }
        } else {
            if (quranStoriesSection) {
                quranStoriesSection.style.display = 'block';
            }
        }
    }
    fetchSettings();

    // =============================================
    // === SHEIKH MANAGEMENT LOGIC ===
    // =============================================
    let sheikhsList = []; // Local cache of sheikhs
    let sheikhsUnsubscribe = null;

    // Expose confirmAddNewSheikh globally for inline onclick
    window.confirmAddNewSheikh = async function () {
        const nameInput = document.getElementById('newSheikhName');
        const phoneInput = document.getElementById('newSheikhPhone');
        const btn = document.getElementById('confirmAddSheikhBtn');

        if (!nameInput || !phoneInput) return;
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        if (!name) { alert('يرجى كتابة اسم الشيخ.'); return; }
        if (!phone || phone.length < 11) { alert('يرجى إدخال رقم هاتف صحيح (11 رقم على الأقل).'); return; }

        // Check for duplicate
        const isDuplicate = sheikhsList.some(s => s.phone === phone || s.name === name);
        if (isDuplicate) {
            alert('⚠️ هذا الشيخ أو الرقم موجود مسبقاً في القائمة!');
            return;
        }

        btn.disabled = true;
        const originalBtnHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';

        try {
            if (isFirebaseConfigured && db) {
                const newSheikhRef = await db.collection('sheikhs').add({
                    name: name,
                    phone: phone,
                    studentCount: 0,
                    addedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Success! The onSnapshot will handle adding to the list and dropdown.
                // We just need to auto-select it once it arrives.
                // To do that, we'll store the ID we just created.
                window.lastAddedSheikhId = newSheikhRef.id;

                nameInput.value = '';
                phoneInput.value = '';
                document.getElementById('addNewSheikhSection').style.display = 'none';

                alert(`✅ تم إضافة ${name} للقائمة بنجاح!`);
            } else {
                alert('Firebase غير متاح. لا يمكن إضافة الشيخ.');
            }
        } catch (err) {
            console.error('Sheikh add error:', err);
            alert('حدث خطأ أثناء إضافة الشيخ. يرجى المحاولة لاحقاً.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalBtnHTML;
        }
    };

    function loadSheikhsDropdown() {
        const select = document.getElementById('sheikhSelect');
        if (!select) return;

        if (sheikhsUnsubscribe) sheikhsUnsubscribe();

        if (isFirebaseConfigured && db) {
            sheikhsUnsubscribe = db.collection('sheikhs').orderBy('name').onSnapshot(snapshot => {
                let sheikhs = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    sheikhs.push({ id: doc.id, name: data.name, phone: data.phone });
                });

                // Custom Sort: Force Maher and Ismail to the top
                const priorityNames = ['الشيخ ماهر قمر', 'الشيخ إسماعيل قمر'];
                sheikhs.sort((a, b) => {
                    const aName = a.name.trim();
                    const bName = b.name.trim();
                    const aIdx = priorityNames.indexOf(aName);
                    const bIdx = priorityNames.indexOf(bName);

                    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                    if (aIdx !== -1) return -1;
                    if (bIdx !== -1) return 1;
                    return aName.localeCompare(bName, 'ar');
                });

                sheikhsList = sheikhs;
                renderSheikhsDropdown(sheikhs);
            }, err => {
                console.error('Sheikhs load error:', err);
                select.innerHTML = '<option value="" disabled selected>⚠️ تعذر التحميل - ادخل الاسم يدوياً</option>';
            });
        }
    }

    function renderSheikhsDropdown(sheikhs) {
        const select = document.getElementById('sheikhSelect');
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '<option value="" disabled selected>❤️ اختر اسم الشيخ المحفظ...</option>';

        sheikhs.forEach(sheikh => {
            const opt = document.createElement('option');
            opt.value = sheikh.id;
            opt.textContent = sheikh.name;
            opt.setAttribute('data-phone', sheikh.phone);
            select.appendChild(opt);
        });

        // Add "add new" option at the bottom
        const addNewOpt = document.createElement('option');
        addNewOpt.value = 'add_new';
        addNewOpt.textContent = '➕ إضافة شيخ جديد ليس في القائمة...';
        addNewOpt.style.fontWeight = 'bold';
        addNewOpt.style.color = '#d4af37';
        select.appendChild(addNewOpt);

        // Restore selection or select last added
        if (window.lastAddedSheikhId) {
            select.value = window.lastAddedSheikhId;
            window.lastAddedSheikhId = null; // Reset
            // Trigger change event manually to update hidden inputs
            select.dispatchEvent(new Event('change'));
        } else if (currentValue && currentValue !== 'add_new') {
            select.value = currentValue;
        }
    }

    // Sheikh dropdown change handler
    const sheikhSelect = document.getElementById('sheikhSelect');
    if (sheikhSelect) {
        sheikhSelect.addEventListener('change', function () {
            const selectedVal = this.value;
            const addNewSection = document.getElementById('addNewSheikhSection');
            const phoneDisplay = document.getElementById('sheikhPhoneDisplay');
            const phoneValueEl = document.getElementById('sheikhPhoneValue');
            const sheikhNameHidden = document.getElementById('sheikhName');
            const sheikhPhoneHidden = document.getElementById('sheikhPhone');

            if (selectedVal === 'add_new') {
                addNewSection.style.display = 'block';
                phoneDisplay.style.display = 'none';
                sheikhNameHidden.value = '';
                sheikhPhoneHidden.value = '';
            } else if (selectedVal) {
                addNewSection.style.display = 'none';
                const selectedOption = this.options[this.selectedIndex];
                const phone = selectedOption.getAttribute('data-phone') || '';
                const name = selectedOption.textContent;

                sheikhNameHidden.value = name;
                sheikhPhoneHidden.value = phone;
                phoneValueEl.textContent = phone || 'غير مسجل';
                phoneDisplay.style.display = 'block';
            } else {
                addNewSection.style.display = 'none';
                phoneDisplay.style.display = 'none';
                sheikhNameHidden.value = '';
                sheikhPhoneHidden.value = '';
            }
        });
    }

    // Load sheikhs on page ready
    if (document.getElementById('sheikhSelect')) {
        loadSheikhsDropdown();
    }

    // =============================================


    // --- National ID Age Calculation ---
    function calculateAgeFromID(nationalID) {
        if (!nationalID || nationalID.length < 7) return null;
        const centuryDigit = nationalID[0];
        const yearPart = nationalID.substring(1, 3);
        const monthPart = nationalID.substring(3, 5);
        const dayPart = nationalID.substring(5, 7);

        let fullYear;
        if (centuryDigit === '2') {
            fullYear = 1900 + parseInt(yearPart);
        } else if (centuryDigit === '3') {
            fullYear = 2000 + parseInt(yearPart);
        } else {
            return null; // Invalid century digit
        }

        const birthDate = new Date(fullYear, parseInt(monthPart) - 1, parseInt(dayPart));
        if (isNaN(birthDate.getTime())) return null;

        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += lastMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return {
            years,
            months,
            days,
            birthDate: `${fullYear}-${monthPart}-${dayPart}`,
            formattedAge: `${years} سنة و ${months} شهر و ${days} يوم`
        };
    }

    // --- Age-based Level Filtering Logic ---
    const natIDInput = document.getElementById('nationalID');
    const levelSection = document.getElementById('levelSelectionSection');

    function updateRegistrationFields() {
        if (!natIDInput || !levelSection) return;

        let rawVal = natIDInput.value;
        let val = rawVal.replace(/\D/g, ''); // Clean non-digits

        // Auto-detect gender from 13th digit (index 12)
        const genderInput = document.getElementById('gender');
        if (genderInput) {
            if (val.length >= 13) {
                const genderDigit = parseInt(val.charAt(12), 10);
                if (!isNaN(genderDigit)) {
                    genderInput.value = (genderDigit % 2 !== 0) ? 'بنين' : 'بنات';
                }
            } else {
                genderInput.value = '';
            }
        }

        if (val.length >= 14) {
            const ageInfo = calculateAgeFromID(val.substring(0, 14));
            if (ageInfo) {
                const isJunior = ageInfo.years < 18 || (ageInfo.years === 18 && ageInfo.months === 0 && ageInfo.days === 0);
                const isSenior = ageInfo.years >= 30;

                // Labels Update
                const birthCertLabel = document.querySelector('label[for="birthCertFile"]');
                const birthCertPlaceholder = document.getElementById('birthCertText');

                if (isSenior) {
                    levelSection.style.display = 'block';
                    if (birthCertLabel) birthCertLabel.innerHTML = `<i class="fas fa-file-upload"></i> رفع صورة البطاقة الشخصية <span style="color:red">*</span>`;
                    if (birthCertPlaceholder) birthCertPlaceholder.innerHTML = `<i class="fas fa-id-card"></i> اختر صورة البطاقة`;

                    document.getElementById('level1_container').style.display = 'flex';
                    document.getElementById('level2_container').style.display = 'none';
                    document.getElementById('level3_container').style.display = 'flex';
                    document.getElementById('level4_container').style.display = 'none';
                } else if (isJunior && ageInfo.years >= 1) {
                    levelSection.style.display = 'block';
                    if (birthCertLabel) birthCertLabel.innerHTML = `<i class="fas fa-file-upload"></i> رفع شهادة الميلاد <span style="color:red">*</span>`;
                    if (birthCertPlaceholder) birthCertPlaceholder.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> اختر صورة شهادة الميلاد`;

                    document.getElementById('level1_container').style.display = 'flex';
                    document.getElementById('level2_container').style.display = 'flex';
                    document.getElementById('level3_container').style.display = 'flex';

                    if (ageInfo.years <= 10) {
                        document.getElementById('level4_container').style.display = 'flex';
                    } else {
                        document.getElementById('level4_container').style.display = 'none';
                        const lvl4Input = document.getElementById('level4_container')?.querySelector('input');
                        if (lvl4Input && lvl4Input.checked) lvl4Input.checked = false;
                    }
                } else {
                    levelSection.style.display = 'none';
                }
                return;
            }
        }
        levelSection.style.display = 'none';
    }

    if (natIDInput) {
        ['input', 'change', 'blur', 'paste'].forEach(evt => {
            natIDInput.addEventListener(evt, updateRegistrationFields);
        });
        // Initial check in case field is pre-filled
        updateRegistrationFields();
    }

    // Modal Control Functions
    window.proceedToFinalStep = () => {
        const confirmModal = document.getElementById('confirmationModal');
        const seatModal = document.getElementById('seatNumberModal');
        if (confirmModal) confirmModal.style.display = 'none';
        if (seatModal) seatModal.style.display = 'flex';
    };

    // --- Reset Form Function (for multiple registrations) ---
    window.resetFullForm = function() {
        if (registrationForm) {
            registrationForm.reset();
            
            // Clear custom file input labels
            const fileLabels = registrationForm.querySelectorAll('.file-text');
            fileLabels.forEach(label => {
                const inputId = label.closest('.custom-file-upload')?.querySelector('input')?.id;
                if (inputId === 'birthCertFile') {
                    label.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> اختر صورة شهادة الميلاد';
                } else if (inputId === 'personalPhotoFile') {
                    label.innerHTML = '<i class="fas fa-image"></i> اختر الصورة الشخصية';
                }
                label.closest('.custom-file-upload')?.classList.remove('has-file');
            });
            
            // Hide level selection
            const levelSelectionSection = document.getElementById('levelSelectionSection');
            if (levelSelectionSection) levelSelectionSection.style.display = 'none';
            
            // Gender
            const genderInput = document.getElementById('gender');
            if (genderInput) genderInput.value = '';
            
            // Sheikh UI
            const sheikhSelect = document.getElementById('sheikhSelect');
            if (sheikhSelect) sheikhSelect.selectedIndex = 0;
            const sheikhPhoneDisplay = document.getElementById('sheikhPhoneDisplay');
            if (sheikhPhoneDisplay) sheikhPhoneDisplay.style.display = 'none';
            const addNewSheikhSection = document.getElementById('addNewSheikhSection');
            if (addNewSheikhSection) addNewSheikhSection.style.display = 'none';
            
            // Terms
            const agreeTerms = document.getElementById('agreeTerms');
            if (agreeTerms) agreeTerms.checked = false;
            
            // Reset Submit Button
            if (typeof resetSubmitBtn === 'function') resetSubmitBtn();
        }
    }

    window.closeSeatModal = function () {
        const modal = document.getElementById('seatNumberModal');
        if (modal) modal.style.display = 'none';

        // Final clean reset of form for next student as requested
        window.resetFullForm();

        // Reset modal internal state
        const qrContainer = document.getElementById('studentQRCodeContainer');
        const qrMessage = document.getElementById('qrMessage');
        const textWrapper = document.getElementById('seatInfoTextWrapper');

        if (textWrapper) textWrapper.style.display = 'block';
        if (qrContainer) qrContainer.style.display = 'none';
        if (qrMessage) qrMessage.style.display = 'none';
        
        const closeBtn = document.getElementById('closeSeatModalBtn');
        const showQRBtn = document.getElementById('showQRBtn');
        if (closeBtn) closeBtn.style.display = 'none';
        if (showQRBtn) showQRBtn.style.display = 'block';
        
        document.body.style.overflow = 'auto';
    };

    window.showBlockedModal = (message) => {
        const modal = document.getElementById('blockedModal');
        const msgEl = document.getElementById('blockedModalMessage');
        if (modal && msgEl) {
            msgEl.textContent = message;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeBlockedModal = () => {
        document.getElementById('blockedModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    // Registration Form logic
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        const submitBtn = document.getElementById('submitBtn');
        const loader = document.getElementById('loader');
        const btnText = submitBtn?.querySelector('.btn-text');
        const agreeTerms = document.getElementById('agreeTerms');

        if (agreeTerms && submitBtn) {
            agreeTerms.addEventListener('change', () => {
                if (agreeTerms.checked && appSettings.registrationStatus === 'open') {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                } else {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.5';
                    submitBtn.style.cursor = 'not-allowed';
                }
            });
        }


        // File selection UI feedback
        const fileInputs = registrationForm.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const container = input.closest('.custom-file-upload');
                const textSpan = container ? container.querySelector('.file-text') : null;

                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    if (container) container.classList.add('has-file');
                    if (textSpan) {
                        textSpan.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745;"></i> تم اختيار: ${e.target.files[0].name}`;
                    }
                } else {
                    if (container) container.classList.remove('has-file');
                    if (textSpan) {
                        textSpan.innerHTML = input.id === 'birthCertFile' ?
                            '<i class="fas fa-cloud-upload-alt"></i> اختر صورة شهادة الميلاد' :
                            '<i class="fas fa-image"></i> اختر الصورة الشخصية';
                    }
                }
            });
        });

        // --- Cloudinary Upload Function ---
        async function uploadToCloudinary(file, type, folderName, cloudName, uploadPreset, studentName) {
            if (!file) return null;
            if (btnText) btnText.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري رفع ${type}...`;

            // Create a unique public_id based on student name and current time
            const uniquePublicId = `${studentName.replace(/\s+/g, '_')}_${Date.now()}`;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            formData.append('folder', folderName);
            formData.append('public_id', uniquePublicId); // Add public_id
            formData.append('context', `type=${type}|uploaded_at=${new Date().toISOString()}`);

            try {
                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.secure_url) {
                    return data.secure_url;
                } else {
                    console.error('Cloudinary Error Data:', data);
                    throw new Error(data.error?.message || 'Upload failed');
                }
            } catch (error) {
                console.error('Cloudinary Error:', error);
                throw new Error(`تعذر رفع ${type}. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.`);
            }
        }

        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (appSettings.registrationStatus === 'closed') {
                alert('عذراً، باب التقديم الإلكتروني مغلق حالياً.');
                return;
            }

            const studentNameInput = registrationForm.querySelector('input[name="studentName"]');
            const nationalIDInput = registrationForm.querySelector('input[name="nationalID"]');
            if (!studentNameInput || !nationalIDInput) return;

            const studentName = studentNameInput.value.trim();
            const nationalID = nationalIDInput.value.trim();

            if (localStorage.getItem(`registered_id_${nationalID}`)) {
                alert('عذراً، لقد قمت بالتقديم مسبقاً بهذا الرقم القومي.');
                return;
            }

            const ageInfo = calculateAgeFromID(nationalID);
            if (!ageInfo) {
                alert('يرجى التأكد من صحة الرقم القومي (14 رقم تبدأ بـ 2 أو 3).');
                return;
            }



            if (ageInfo.years < 1) {
                alert('عذراً، يجب أن يكون عمر المتسابق سنة واحدة على الأقل.');
                return;
            }

            const isSubmissionJunior = ageInfo.years < 18 || (ageInfo.years === 18 && ageInfo.months === 0 && ageInfo.days === 0);
            const isSubmissionSenior = ageInfo.years >= 30;

            if (!isSubmissionJunior && !isSubmissionSenior) {
                alert(`عذراً، التقديم متاح للفئة الأولى حتى سن 18 عاماً تماماً، وللفئة الثانية من سن 30 عاماً فما فوق فقط.\nعمرك الحالي: ${ageInfo.years} عام.`);
                return;
            }

            const formData = new FormData(registrationForm);
            const selectedLvl = formData.get('level');

            if (isSubmissionJunior) {
                if (ageInfo.years > 10 && selectedLvl && selectedLvl.includes('الرابع')) {
                    alert('⚠️ عذراً، المستوى الرابع متاح فقط للأطفال حتى سن 10 سنوات.');
                    return;
                }
            } else if (isSubmissionSenior) {
                if (selectedLvl && (selectedLvl.includes('الثاني') || selectedLvl.includes('الرابع'))) {
                    alert('⚠️ عذراً، السادة الكبار (فوق 30 سنة) متاح لهم فقط المستوى الأول والثالث.');
                    return;
                }
            }



            // --- Sheikh Handling ---
            const sheikhSelectEl = document.getElementById('sheikhSelect');
            let sheikhNameVal = document.getElementById('sheikhName')?.value?.trim();
            let sheikhPhoneVal = document.getElementById('sheikhPhone')?.value?.trim();

            if (!sheikhSelectEl || !sheikhSelectEl.value) {
                alert('⚠️ يرجى اختيار اسم الشيخ المحفظ من القائمة.');
                return;
            }

            // If "Add New" is selected, we need to handle it
            if (sheikhSelectEl.value === 'add_new') {
                const newName = document.getElementById('newSheikhName')?.value?.trim();
                const newPhone = document.getElementById('newSheikhPhone')?.value?.trim();

                if (!newName || !newPhone || newPhone.length < 11) {
                    alert('⚠️ يرجى إكمال بيانات الشيخ الجديد (الاسم ورقم الهاتف) أولاً.');
                    document.getElementById('newSheikhName')?.focus();
                    return;
                }

                if (submitBtn) {
                    submitBtn.disabled = true;
                    if (loader) loader.style.display = 'inline-block';
                    if (btnText) btnText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إضافة الشيخ الجديد للقائمة...';
                }

                try {
                    // Check if already exists in local list (maybe another student added it while form was open)
                    const existing = sheikhsList.find(s => s.name === newName || s.phone === newPhone);
                    if (existing) {
                        sheikhNameVal = existing.name;
                        sheikhPhoneVal = existing.phone;
                    } else {
                        // Create in Firestore
                        const newSheikhRef = await db.collection('sheikhs').add({
                            name: newName,
                            phone: newPhone,
                            studentCount: 0,
                            addedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        sheikhNameVal = newName;
                        sheikhPhoneVal = newPhone;
                        // onSnapshot will handle the UI update later
                    }
                } catch (err) {
                    console.error('Auto sheikh add error:', err);
                    alert('حدث خطأ أثناء إضافة الشيخ. يرجى المحاولة يدوياً عبر زر التأكيد.');
                    resetSubmitBtn();
                    return;
                }
            }

            // --- Phone Number Length Validation (11 digits required) ---
            const p1Val = formData.get('phone1')?.trim() || '';
            const p2Val = formData.get('phone2')?.trim() || '';

            if (p1Val.length !== 11 || !/^\d+$/.test(p1Val)) {
                alert("⚠️ يرجى إدخال رقم هاتف صحيح للمتسابق (11 رقم).");
                resetSubmitBtn();
                return;
            }
            if (p2Val.length !== 11 || !/^\d+$/.test(p2Val)) {
                alert("⚠️ يرجى إدخال رقم هاتف صحيح لولي الأمر (11 رقم).");
                resetSubmitBtn();
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                if (loader) loader.style.display = 'inline-block';
                if (btnText) btnText.innerHTML = '<span style="font-size: 0.8rem;">يرجى الانتظار ولاتغلق الصفحة حتى يتم رفع الصور واستلام رقم الجلوس...</span>';
            }

            try {
                // --- 2. Image Uploads to Cloudinary (Mandatory Check) ---
                const birthCertFile = document.getElementById('birthCertFile').files[0];
                const personalPhotoFile = document.getElementById('personalPhotoFile').files[0];

                if (!birthCertFile || !personalPhotoFile) {
                    alert("⚠️ يرجى رفع صورة شهادة الميلاد والصورة الشخصية أولاً لإتمام التسجيل.");
                    resetSubmitBtn();
                    return;
                }

                let birthCertUrl = '';
                let personalPhotoUrl = '';

                // Account 1 (duvunzwm2) for Birth Certificates
                birthCertUrl = await uploadToCloudinary(birthCertFile, 'شهادة الميلاد', 'birth_certs', 'duvunzwm2', 'hamel_preset', studentName);

                // Account 2 (dvzqe1zr7) for Personal Photos
                personalPhotoUrl = await uploadToCloudinary(personalPhotoFile, 'الصورة الشخصية', 'student_photos', 'dvzqe1zr7', 'hamel_preset_2', studentName);

                if (isFirebaseConfigured && db) {
                    if (btnText) btnText.innerHTML = '<i class="fas fa-shield-alt"></i> جاري فحص سجل السوابق...';

                    // --- 3. Check Block List ---
                    const blockCheckID = await db.collection('blockedStudents').where('nationalID', '==', nationalID).limit(1).get();
                    if (!blockCheckID.empty) {
                        showBlockedModal('⚠️ عذراً، لا يمكن قبول هذا الطلب. يرجى مراجعة الإدارة.');
                        resetSubmitBtn();
                        return;
                    }

                    // --- 4. Past Winners Check ---
                    const normalizedInputName = normalizeArabicName(studentName);
                    const selectedLevel = formData.get('level');
                    const currentLevelRank = LEVEL_HIERARCHY[selectedLevel];

                    let pastLevelRank = null;
                    for (let rank in PAST_YEAR_WINNERS) {
                        const winnerFound = PAST_YEAR_WINNERS[rank].some(w => normalizeArabicName(w) === normalizedInputName);
                        if (winnerFound) {
                            pastLevelRank = parseInt(rank);
                            break;
                        }
                    }

                    if (pastLevelRank !== null) {
                        if (pastLevelRank === 1 || currentLevelRank >= pastLevelRank) {
                            showBlockedModal("عذراً، لا يسمح بالمشاركة في نفس المستوى أو مستوى أقل من مستوى فوزك السابق.");
                            resetSubmitBtn();
                            return;
                        }
                    }

                    // --- 5. Duplicate Check ---
                    const idCheck = await db.collection('registrations').where('nationalID', '==', nationalID).limit(1).get();
                    if (!idCheck.empty) {
                        showBlockedModal('⚠️ عذراً، هذا الرقم القومي مسجل مسبقاً.');
                        resetSubmitBtn();
                        return;
                    }

                    if (btnText) btnText.textContent = 'جاري حجز رقم الجلوس...';

                    const registrationData = {
                        studentName, nationalID,
                        ageYears: ageInfo.years, ageMonths: ageInfo.months, ageDays: ageInfo.days,
                        birthDate: ageInfo.birthDate, formattedAge: ageInfo.formattedAge,
                        gender: formData.get('gender'),
                        phone1: formData.get('phone1'), phone2: formData.get('phone2'), phone3: formData.get('phone3'),
                        address: formData.get('address'),
                        sheikhName: sheikhNameVal, sheikhPhone: sheikhPhoneVal,
                        level: formData.get('level'),
                        birthCertPath: birthCertUrl,
                        personalPhotoPath: personalPhotoUrl,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    };

                    const counterRef = db.collection('counters').doc(`${registrationData.gender}_${registrationData.level}${isSubmissionSenior ? '_Senior' : ''}`);
                    const result = await db.runTransaction(async (transaction) => {
                        const counterDoc = await transaction.get(counterRef);
                        let count = 0; if (counterDoc.exists) count = counterDoc.data().count;

                        const juniorRanges = {
                            'بنين': { 'المستوى الأول (القرآن كاملاً)': 4000, 'المستوى الثاني (ثلاثة أرباع القرآن)': 4301, 'المستوى الثالث (نصف القرآن)': 4801, 'المستوى الرابع (ربع القرآن)': 5501 },
                            'بنات': { 'المستوى الأول (القرآن كاملاً)': 2000, 'المستوى الثاني (ثلاثة أرباع القرآن)': 2301, 'المستوى الثالث (نصف القرآن)': 2801, 'المستوى الرابع (ربع القرآن)': 3501 }
                        };

                        const seniorRanges = {
                            'بنين': { 'المستوى الأول (القرآن كاملاً)': 7000, 'المستوى الثاني (ثلاثة أرباع القرآن)': 7500, 'المستوى الثالث (نصف القرآن)': 8000 },
                            'بنات': { 'المستوى الأول (القرآن كاملاً)': 8500, 'المستوى الثاني (ثلاثة أرباع القرآن)': 9000, 'المستوى الثالث (نصف القرآن)': 9500 }
                        };

                        const currentRanges = isSubmissionSenior ? seniorRanges : juniorRanges;
                        const start = currentRanges[registrationData.gender][registrationData.level];
                        const assignedSeat = start + count;
                        const committeeNumber = Math.ceil((count + 1) / 20);

                        transaction.set(counterRef, { count: count + 1 });
                        const newRegRef = db.collection('registrations').doc();
                        registrationData.seatNumber = assignedSeat;
                        registrationData.committee = committeeNumber;
                        registrationData.isSenior = isSubmissionSenior;
                        transaction.set(newRegRef, registrationData);

                        return { assignedSeat, committeeNumber, id: newRegRef.id };
                    });

                    // Success UI
                    document.getElementById('displayStudentName').textContent = studentName;
                    document.getElementById('displaySeatNumber').textContent = result.assignedSeat;
                    const committeeDisplay = document.getElementById('displayCommittee');
                    if (committeeDisplay) committeeDisplay.textContent = result.committeeNumber;

                    // Generate QR Code
                    const studentUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}student.html?id=${result.id}`;
                    document.getElementById('studentQRCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(studentUrl)}`;

                    document.getElementById('confirmationModal').style.display = 'flex';
                }

                localStorage.setItem(`registered_id_${nationalID}`, 'true');
                // The actual form reset happens when closing the modal for better UX


            } catch (error) {
                console.error("Submission Error:", error);
                alert('حدث خطأ أثناء التسجيل: ' + error.message);
                resetSubmitBtn();
            }
        });
    }

    // Helper to reset registration submit button
    function resetSubmitBtn() {
        const submitBtn = document.getElementById('submitBtn');
        const loader = document.getElementById('loader');
        const btnText = submitBtn?.querySelector('.btn-text');

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            if (loader) loader.style.display = 'none';
            if (btnText && appSettings.registrationStatus === 'open') {
                btnText.textContent = 'إرسال طلب التقديم';
            }
        }
    }

    // --- Quran Story Form Submission ---
    const quranStoryForm = document.getElementById('quranStoryForm');
    if (quranStoryForm) {
        quranStoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = quranStoryForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

                const formData = new FormData(quranStoryForm);
                const data = {
                    name: formData.get('name')?.trim(),
                    phone: formData.get('phone')?.trim(),
                    story: formData.get('story')?.trim(),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'جديد'
                };

                if (isFirebaseConfigured && db) {
                    await db.collection('stories').add(data);
                    alert('✅ تم استلام قصتك الملهمة بنجاح! شكراً لك، سيتم مراجعتها من قبل الإدارة للإشراف.');
                    quranStoryForm.reset();
                } else {
                    alert('عذراً، نظام القصص غير متاح حالياً.');
                }
            } catch (err) {
                console.error("Story Error:", err);
                alert('حدث خطأ أثناء إرسال قصتك. يرجى المحاولة لاحقاً.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // --- Share Your Opinion Form Submission ---
    const opinionForm = document.getElementById('opinionForm');
    if (opinionForm) {
        opinionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = opinionForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

                const formData = new FormData(opinionForm);
                const message = formData.get('message')?.trim() || '';

                const data = {
                    name: formData.get('name')?.trim() || 'فاعل خير',
                    phone: formData.get('phone')?.trim() || 'غير مسجل',
                    userType: formData.get('userType') || 'غير محدد',
                    commentType: formData.get('commentType') || 'إيجابي',
                    message: message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'جديد'
                };

                if (isFirebaseConfigured && db) {
                    await db.collection('feedback').add(data);
                    alert('✅ تم استلام رأيك بنجاح! شكراً لك على مشاركتك القيمة التي تساعدنا على الارتقاء بالمسابقة.');
                    opinionForm.reset();
                } else {
                    alert('عذراً، النظام غير متاح حالياً.');
                }
            } catch (err) {
                console.error("Opinion Error:", err);
                alert('حدث خطأ أثناء إرسال رأيك. يرجى المحاولة لاحقاً.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // --- Nomination Form Submission ---
    const nominationForm = document.getElementById('nominationForm');
    if (nominationForm) {
        nominationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = nominationForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

                const formData = new FormData(nominationForm);
                const data = {
                    nominatorName: formData.get('nominatorName')?.trim() || 'فاعل خير',
                    nominatorPhone: formData.get('nominatorPhone')?.trim() || 'غير مسجل',
                    awardType: formData.get('awardType') || 'غير محدد',
                    nomineeName: formData.get('nomineeName')?.trim() || '',
                    reason: formData.get('reason')?.trim() || '',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'جديد'
                };

                if (!data.nomineeName || !data.awardType) {
                    alert('⚠️ يرجى إكمال بيانات الترشيح (اسم المرشح وفئة الترشيح).');
                    return;
                }

                if (isFirebaseConfigured && db) {
                    await db.collection('nominations').add(data);
                    alert(`✅ تم استلام ترشيحك لـ (${data.nomineeName}) بنجاح! شكراً لمساعدتنا في تكريم النماذج المشرفة.`);
                    nominationForm.reset();
                } else {
                    alert('عذراً، نظام الترشيح غير متاح حالياً.');
                }
            } catch (err) {
                console.error("Nomination Error:", err);
                alert('حدث خطأ أثناء إرسال الترشيح. يرجى المحاولة لاحقاً.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // --- Last Year Winners Board Generation & Toggle ---
    const toggleWinnersBtn = document.getElementById('toggleWinnersBtn');
    const winnersBoard = document.getElementById('winnersBoard');
    const winnersGrid = document.getElementById('winnersGrid');

    const LEVEL_TITLES = {
        1: "المستوى الأول (القرآن كاملاً)",
        2: "المستوى الثاني (ثلاثة أرباع القرآن)",
        3: "المستوى الثالث (نصف القرآن)",
        4: "المستوى الرابع (ربع القرآن)"
    };

    function generateWinnersBoard() {
        if (!winnersGrid) return;
        winnersGrid.innerHTML = '';

        for (let level in PAST_YEAR_WINNERS) {
            const winners = PAST_YEAR_WINNERS[level];
            const card = document.createElement('div');
            card.className = 'level-winner-card';
            card.setAttribute('data-aos', 'fade-up');

            let winnersHtml = `
                <div class="level-card-header">
                    <h3>${LEVEL_TITLES[level] || 'مستوى تعليمي'}</h3>
                    <div class="decorative-line" style="width: 50px; margin: 5px auto;"></div>
                </div>
                <ul class="winners-list">
            `;

            winners.forEach((name, index) => {
                const rank = index + 1;
                let rankClass = 'rank-other';
                let rankLabel = rank;

                if (rank === 1) rankClass = 'rank-1';
                else if (rank === 2) rankClass = 'rank-2';
                else if (rank === 3) rankClass = 'rank-3';

                winnersHtml += `
                    <li class="winner-li">
                        <div class="rank-badge ${rankClass}">${rankLabel}</div>
                        <span class="winner-name">${name}</span>
                    </li>
                `;
            });

            winnersHtml += `</ul>`;
            card.innerHTML = winnersHtml;
            winnersGrid.appendChild(card);
        }
    }

    if (toggleWinnersBtn && winnersBoard) {
        let isGenerated = false;
        toggleWinnersBtn.addEventListener('click', () => {
            if (winnersBoard.style.display === 'none') {
                if (!isGenerated) {
                    generateWinnersBoard();
                    isGenerated = true;
                }
                winnersBoard.style.display = 'block';
                toggleWinnersBtn.innerHTML = '<i class="fas fa-times"></i> إغلاق لوحة الشرف';
                toggleWinnersBtn.classList.remove('btn-secondary');
                toggleWinnersBtn.classList.add('btn-primary');

                // Refresh AOS to animate the new elements
                setTimeout(() => {
                    AOS.refresh();
                    winnersBoard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                winnersBoard.style.display = 'none';
                toggleWinnersBtn.innerHTML = '<i class="fas fa-trophy"></i> أوائل العام الماضي (2025)';
                toggleWinnersBtn.classList.remove('btn-primary');
                toggleWinnersBtn.classList.add('btn-secondary');
            }
        });
    }

    // --- Phase 1 Feedback Section has been moved exclusively to the admin panel out of public view. ---

    // ==========================================
    // === PWA & Service Worker Logic ===
    // ==========================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);

                    // Check for updates
                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker) {
                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === 'installed') {
                                    if (navigator.serviceWorker.controller) {
                                        // New update available, refresh automatically
                                        window.location.reload();
                                    }
                                }
                            };
                        }
                    };
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // Install Prompt Handle
    let deferredPrompt;
    const pwaBtn = document.getElementById('pwaInstallBtn');
    const pwaBtnMobile = document.getElementById('pwaInstallBtnMobile');
    const pwaBanner = document.getElementById('pwaBanner');
    const pwaBtnBanner = document.getElementById('pwaInstallBtnBanner');
    const pwaCloseBtn = document.getElementById('pwaCloseBanner');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Show install buttons and banner
        if (pwaBtn) pwaBtn.style.display = 'block';
        if (pwaBtnMobile) pwaBtnMobile.style.display = 'block';

        // Show banner after a slight delay for better UX
        setTimeout(() => {
            if (pwaBanner && !localStorage.getItem('pwa_banner_closed')) {
                pwaBanner.style.display = 'flex';
            }
        }, 3000);
    });

    const installPWA = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;

        // Hide all prompts
        if (pwaBtn) pwaBtn.style.display = 'none';
        if (pwaBtnMobile) pwaBtnMobile.style.display = 'none';
        if (pwaBanner) pwaBanner.style.display = 'none';
    };

    if (pwaBtn) pwaBtn.addEventListener('click', installPWA);
    if (pwaBtnMobile) pwaBtnMobile.addEventListener('click', installPWA);
    if (pwaBtnBanner) pwaBtnBanner.addEventListener('click', installPWA);

    if (pwaCloseBtn) {
        pwaCloseBtn.addEventListener('click', () => {
            if (pwaBanner) pwaBanner.style.display = 'none';
            localStorage.setItem('pwa_banner_closed', 'true');
        });
    }

    window.addEventListener('appinstalled', () => {
        console.log('Hamel Alquran App was installed.');
        if (pwaBtn) pwaBtn.style.display = 'none';
        if (pwaBtnMobile) pwaBtnMobile.style.display = 'none';
        if (pwaBanner) pwaBanner.style.display = 'none';
    });
});


// --- User Reply Search Functionality (Removed as per request) ---

function closeMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    if (mobileNav && mobileNav.classList.contains('active')) {
        mobileNav.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Global Modal Controls
    window.closeSeatModal = function () {
        const modal = document.getElementById('seatNumberModal');
        if (modal) modal.style.display = 'none';
        
        // Ensure form is cleared
        window.resetFullForm();

        // Reset state for next time
        const qrContainer = document.getElementById('studentQRCodeContainer');
        const qrMessage = document.getElementById('qrMessage');
        const showQRBtn = document.getElementById('showQRBtn');
        const textWrapper = document.getElementById('seatInfoTextWrapper');

        const whatsappSection = document.getElementById('whatsappGroupSection');

        if (textWrapper) textWrapper.style.display = 'block';

        if (qrContainer) qrContainer.style.display = 'none';
        if (qrMessage) qrMessage.style.display = 'none';
        if (whatsappSection) whatsappSection.style.display = 'none';

        const closeBtn = document.getElementById('closeSeatModalBtn');
        if (closeBtn) closeBtn.style.display = 'none';
        if (showQRBtn) {
            showQRBtn.style.display = 'block';
        }
        document.body.style.overflow = 'auto';
    };

window.toggleQRCode = function () {
    const qrContainer = document.getElementById('studentQRCodeContainer');
    const qrMessage = document.getElementById('qrMessage');
    const showQRBtn = document.getElementById('showQRBtn');
    const closeBtn = document.getElementById('closeSeatModalBtn');
    const textWrapper = document.getElementById('seatInfoTextWrapper');

    const whatsappSection = document.getElementById('whatsappGroupSection');

    if (!qrContainer) return;

    if (textWrapper) textWrapper.style.display = 'none';
    qrContainer.style.display = 'block';
    qrMessage.style.display = 'block';
    if (whatsappSection) whatsappSection.style.display = 'block';

    if (showQRBtn) showQRBtn.style.display = 'none';
    if (closeBtn) closeBtn.style.display = 'block';

    setTimeout(() => {
        if (whatsappSection) {
            whatsappSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            qrContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, 100);
};

// --- Contact Form Submission (to Control Panel) ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('contactSubmitBtn');
        const statusDiv = document.getElementById('contactStatus');
        const name = document.getElementById('contactName').value;
        const phone = document.getElementById('contactPhone').value;
        const message = document.getElementById('contactMessage').value;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        }

        try {
            await db.collection('messages').add({
                name: name,
                phone: phone,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.style.background = 'rgba(40, 167, 69, 0.2)';
                statusDiv.style.color = '#28a745';
                statusDiv.textContent = '✅ تم إرسال رسالتك بنجاح إلى الإدارة.';
            }

            contactForm.reset();
        } catch (error) {
            console.error('Contact Error:', error);
            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.style.background = 'rgba(255, 77, 77, 0.1)';
                statusDiv.style.color = '#ff4d4d';
                statusDiv.textContent = '❌ حدث خطأ، يرجى المحاولة لاحقاً.';
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'إرسال الرسالة إلى لوحة التحكم';
            }
        }
    });
}
