// تابع Lazy Load برای QRCode.js
function loadQRCode() {
    if (window.QRCode) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
            console.log('QRCode.js loaded');
            resolve();
        };
        script.onerror = () => {
            console.error('Failed to load QRCode.js');
            reject(new Error('QRCode library failed to load'));
        };
        document.head.appendChild(script);
    });
}

// تابع انیمیشن اسکرول (جایگزین AOS)
function initScrollAnimations() {
    const animateOnScroll = () => {
        document.querySelectorAll('[data-aos]').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8 && !el.classList.contains('aos-animate')) {
                el.classList.add('aos-animate');
            }
        });
    };

    // اجرای اولیه
    animateOnScroll();
    // اجرای در اسکرول
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                animateOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// --- شروع DOM ---
document.addEventListener('DOMContentLoaded', function () {
    // فعال‌سازی انیمیشن‌های اسکرول
    initScrollAnimations();

    // عناصر DOM
    const iframe = document.getElementById('remoteVideo');
    const videoWrapperDiv = document.getElementById('video-wrapper');
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('reset-button');
    const lanToggle = document.getElementById('lan-toggle');
    const cleanOutputToggle = document.getElementById('cleanoutput-toggle');
    const qrContainer = document.getElementById('qrcode-container');
    const copyButtonText = document.getElementById('copy-link-text');
    const obsButtonText = document.getElementById('obs-btn-text');
    const copyButton = document.getElementById('copy-link-button');
    const obsButton = document.getElementById('obs-btn');

    // وضعیت
    let roomId = null;
    let mobileUrl = '';
    let viewerUrl = '';
    let isLanOnly = false;
    let isCleanOutput = false;

    // --- توابع کمکی ---
    function generateRoomId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function updateUrls() {
        const lanParam = isLanOnly ? '&lanonly' : '';
        const cleanParam = isCleanOutput ? '&cleanoutput' : '';
        const retryParam = '&retry=30';
        mobileUrl = `https://live.remotevm.ir/?push=${roomId}&webcam&hideheader${lanParam}${cleanParam}${retryParam}`;
        viewerUrl = `https://live.remotevm.ir/?view=${roomId}&autostart${cleanParam}&hideheader${lanParam}${retryParam}`;
    }

    function animateButtonSuccess(button, originalText) {
        button.classList.add('success-animation');
        setTimeout(() => {
            button.classList.remove('success-animation');
            if (originalText) {
                button.querySelector('span').innerText = originalText;
            }
        }, 500);
    }

    // --- شروع جلسه ---
    async function startSession() {
        try {
            startButton.disabled = true;
            startButton.style.opacity = '0.5';

            // لود دینامیک QRCode.js
            await loadQRCode();

            roomId = generateRoomId();
            isLanOnly = lanToggle.checked = false;
            isCleanOutput = cleanOutputToggle.checked = false;
            updateUrls();

            // تولید QR Code
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: mobileUrl,
                width: 220,
                height: 220,
                colorDark: '#0f172a',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            // بارگذاری iframe
            iframe.src = viewerUrl;

            // تغییر UI
            document.getElementById('initial-state').classList.add('hidden');
            document.getElementById('qr-state').classList.remove('hidden');
            videoWrapperDiv.classList.remove('hidden');

            // اسکرول نرم به QR
            setTimeout(() => {
                document.getElementById('qr-state').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

        } catch (err) {
            console.error('خطا در شروع جلسه:', err);
            alert('خطا در بارگذاری. لطفاً صفحه را رفرش کنید.');
            resetSession();
        }
    }

    // --- ریست جلسه ---
    function resetSession() {
        iframe.src = 'about:blank';
        roomId = null;
        mobileUrl = '';
        viewerUrl = '';
        copyButtonText.innerText = 'کپی لینک';
        obsButtonText.innerText = 'کپی لینک OBS';

        document.getElementById('initial-state').classList.remove('hidden');
        document.getElementById('qr-state').classList.add('hidden');
        videoWrapperDiv.classList.add('hidden');

        startButton.disabled = false;
        startButton.style.opacity = '1';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- بازتولید QR ---
    function regenerateQR() {
        if (!roomId || !window.QRCode) return;

        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: mobileUrl,
            width: 220,
            height: 220,
            colorDark: '#0f172a',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        iframe.src = viewerUrl;
    }

    // --- رویدادها ---
    startButton.addEventListener('click', startSession);
    resetButton.addEventListener('click', resetSession);

    lanToggle.addEventListener('change', function () {
        if (!roomId) return;
        isLanOnly = this.checked;
        updateUrls();
        regenerateQR();
    });

    cleanOutputToggle.addEventListener('change', function () {
        if (!roomId) return;
        isCleanOutput = this.checked;
        updateUrls();
        regenerateQR();
    });

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(mobileUrl).then(() => {
            const originalText = copyButtonText.innerText;
            copyButtonText.innerText = 'کپی شد! Checkmark';
            animateButtonSuccess(copyButton, originalText);
            setTimeout(() => copyButtonText.innerText = originalText, 2000);
        }).catch(() => {
            alert('کپی کردن ناموفق بود. لطفاً دستی کپی کنید.');
        });
    });

    obsButton.addEventListener('click', () => {
        navigator.clipboard.writeText(viewerUrl).then(() => {
            const originalText = obsButtonText.innerText;
            obsButtonText.innerText = 'کپی شد! Checkmark';
            animateButtonSuccess(obsButton, originalText);
            setTimeout(() => obsButtonText.innerText = originalText, 2000);
        }).catch(() => {
            alert('کپی کردن ناموفق بود. لطفاً دستی کپی کنید.');
        });
    });

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        const container = document.getElementById('video-container');
        const requestFull = container.requestFullscreen ||
            container.webkitRequestFullscreen ||
            container.msRequestFullscreen ||
            container.mozRequestFullScreen;

        if (requestFull) requestFull.call(container);
    });

    // --- منوی همبرگری ---
    const menuToggle = document.getElementById('menu-toggle');
    const menuPanel = document.getElementById('menu-panel');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuIcon = document.getElementById('menu-icon');

    function toggleMenu() {
        const isOpen = !menuPanel.classList.contains('translate-x-full');

        if (isOpen) {
            menuPanel.classList.add('translate-x-full');
            menuPanel.classList.remove('translate-x-0');
            menuOverlay.classList.add('hidden', 'opacity-0');
            menuIcon.classList.add('fa-bars');
            menuIcon.classList.remove('fa-times');
        } else {
            menuPanel.classList.remove('translate-x-full');
            menuPanel.classList.add('translate-x-0');
            menuOverlay.classList.remove('hidden', 'opacity-0');
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times');
        }
    }

    menuToggle.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menuPanel.classList.contains('translate-x-full')) {
            toggleMenu();
        }
    });
});