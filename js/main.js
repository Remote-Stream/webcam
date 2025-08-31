// Initialize AOS (Animate on Scroll)
AOS.init({
    duration: 800,
    once: true,
    offset: 50,
});

document.addEventListener('DOMContentLoaded', function() {
    // Menu Elements
    const menuToggle = document.getElementById('menu-toggle');
    const menuIcon = document.getElementById('menu-icon');
    const menuPanel = document.getElementById('menu-panel');
    const menuOverlay = document.getElementById('menu-overlay');

    // App Elements
    const startButton = document.getElementById('startButton');
    const copyButton = document.getElementById('copy-link-button');
    const copyButtonText = document.getElementById('copy-link-text');
    const resetButton = document.getElementById('reset-button');
    const fullscreenButton = document.getElementById('fullscreen-btn');
    const obsButton = document.getElementById('obs-btn');
    const obsButtonText = document.getElementById('obs-btn-text');
    
    const initialStateDiv = document.getElementById('initial-state');
    const qrStateDiv = document.getElementById('qr-state');
    const videoWrapperDiv = document.getElementById('video-wrapper');

    const qrContainer = document.getElementById('qrcode-container');
    const iframe = document.getElementById('remoteVideo');
    
    // State variables
    let roomId = null;
    let mobileUrl = '';
    let viewerUrl = '';

    // --- Menu Logic ---
    function toggleMenu() {
        const isActive = menuPanel.classList.contains('is-active');
        if (isActive) {
            menuPanel.classList.remove('is-active');
            menuOverlay.classList.add('opacity-0');
            menuOverlay.classList.add('hidden');
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        } else {
            menuPanel.classList.add('is-active');
            menuOverlay.classList.remove('hidden');
            // A tiny delay to allow the 'hidden' class to be removed before transitioning opacity
            setTimeout(() => menuOverlay.classList.remove('opacity-0'), 10);
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times');
        }
    }

    menuToggle.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);

    // --- App Logic ---
    function generateRoomId() {
        return Math.random().toString(36).substring(2, 15);
    }

    function startSession() {
        startButton.disabled = true;
        roomId = generateRoomId();
        mobileUrl = `https://live.remotevm.ir/?push=${roomId}&webcam&hideheader`;
        viewerUrl = `https://live.remotevm.ir/?view=${roomId}&autostart&cleanoutput&hideheader`;

        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: mobileUrl,
            width: 200,
            height: 200,
            colorDark: '#0f172a',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        iframe.src = viewerUrl;

        initialStateDiv.classList.add('opacity-0');
        setTimeout(() => {
            initialStateDiv.classList.add('hidden');
            
            qrStateDiv.classList.remove('hidden');
            videoWrapperDiv.classList.remove('hidden');
            
            // Delay to allow display property to apply before transitioning opacity
            setTimeout(() => {
                qrStateDiv.classList.remove('opacity-0');
                videoWrapperDiv.classList.remove('opacity-0');
            }, 50);

            setTimeout(() => {
                videoWrapperDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }, 500);
    }

    function resetSession() {
        qrStateDiv.classList.add('opacity-0');
        videoWrapperDiv.classList.add('opacity-0');
        
        setTimeout(() => {
            qrStateDiv.classList.add('hidden');
            videoWrapperDiv.classList.add('hidden');
            
            initialStateDiv.classList.remove('hidden');
            setTimeout(() => initialStateDiv.classList.remove('opacity-0'), 50);

            startButton.disabled = false;
            qrContainer.innerHTML = '';
            iframe.src = 'about:blank';
            roomId = null; mobileUrl = ''; viewerUrl = '';
            copyButtonText.innerText = 'کپی لینک';
            obsButtonText.innerText = 'کپی لینک OBS';
        }, 500);
    }
    
    function showFeedback(element, text) {
        const originalText = element.innerText;
        element.innerText = text;
        setTimeout(() => {
            element.innerText = originalText;
        }, 2000);
    }

    // Event Listeners
    startButton.addEventListener('click', startSession);
    resetButton.addEventListener('click', resetSession);
    
    copyButton.addEventListener('click', () => {
        if (!mobileUrl) return;
        navigator.clipboard.writeText(mobileUrl).then(() => showFeedback(copyButtonText, 'کپی شد!'));
    });

    obsButton.addEventListener('click', () => {
        if (!viewerUrl) return;
        navigator.clipboard.writeText(viewerUrl).then(() => showFeedback(obsButtonText, 'کپی شد!'));
    });

    fullscreenButton.addEventListener('click', () => {
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) { /* Safari */
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) { /* IE11 */
            iframe.msRequestFullscreen();
        }
    });
});