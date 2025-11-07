    AOS.init({ duration: 800, once: true, offset: 50, easing: 'ease-out-cubic' });

    document.addEventListener('DOMContentLoaded', function() {
        // Elements
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

        // State
        let roomId = null;
        let mobileUrl = '';
        let viewerUrl = '';
        let isLanOnly = false;
        let isCleanOutput = false;

        // --- Functions ---
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

        function startSession() {
            startButton.disabled = true;
            startButton.style.opacity = '0.5';
            roomId = generateRoomId();
            isLanOnly = false;
            isCleanOutput = false;
            lanToggle.checked = false;
            cleanOutputToggle.checked = false;
            updateUrls();

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

            document.getElementById('initial-state').classList.add('hidden');
            document.getElementById('qr-state').classList.remove('hidden');
            videoWrapperDiv.classList.remove('hidden');
            
            // Smooth scroll to QR code
            setTimeout(() => {
                document.getElementById('qr-state').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }

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
            
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function regenerateQR() {
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

        // --- Event Listeners ---
        startButton.addEventListener('click', startSession);
        resetButton.addEventListener('click', resetSession);

        lanToggle.addEventListener('change', function() {
            if (!roomId) return;
            isLanOnly = this.checked;
            updateUrls();
            regenerateQR();
        });

        cleanOutputToggle.addEventListener('change', function() {
            if (!roomId) return;
            isCleanOutput = this.checked;
            updateUrls();
            regenerateQR();
        });

        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(mobileUrl).then(() => {
                const originalText = copyButtonText.innerText;
                copyButtonText.innerText = 'کپی شد! ✓';
                animateButtonSuccess(copyButton, originalText);
                setTimeout(() => copyButtonText.innerText = originalText, 2000);
            });
        });

        obsButton.addEventListener('click', () => {
            navigator.clipboard.writeText(viewerUrl).then(() => {
                const originalText = obsButtonText.innerText;
                obsButtonText.innerText = 'کپی شد! ✓';
                animateButtonSuccess(obsButton, originalText);
                setTimeout(() => obsButtonText.innerText = originalText, 2000);
            });
        });

        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            const container = document.getElementById('video-container');
            if (container.requestFullscreen) container.requestFullscreen();
            else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
            else if (container.msRequestFullscreen) container.msRequestFullscreen();
        });

        // Menu
        const menuToggle = document.getElementById('menu-toggle');
        const menuPanel = document.getElementById('menu-panel');
        const menuOverlay = document.getElementById('menu-overlay');
        const menuIcon = document.getElementById('menu-icon');

        function toggleMenu() {
            const isOpen = !menuPanel.classList.contains('translate-x-full');
            
            if (isOpen) {
                // Close menu
                menuPanel.classList.add('translate-x-full');
                menuPanel.classList.remove('translate-x-0');
                menuOverlay.classList.add('hidden', 'opacity-0');
                menuIcon.classList.add('fa-bars');
                menuIcon.classList.remove('fa-times');
            } else {
                // Open menu
                menuPanel.classList.remove('translate-x-full');
                menuPanel.classList.add('translate-x-0');
                menuOverlay.classList.remove('hidden', 'opacity-0');
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            }
        }

        menuToggle.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', toggleMenu);

        // ESC key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menuPanel.classList.contains('translate-x-full')) {
                toggleMenu();
            }
        });
    });
