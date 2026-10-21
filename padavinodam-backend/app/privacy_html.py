"""
Bilingual Privacy Policy HTML for Padavinodam (పదవినోదం)
Fully compliant with Google Play Families Policy, PhonePe Indus Appstore policies,
COPPA, and Indian IT Act & DPDP Act rules.
"""

PRIVACY_POLICY_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - పదవినోదం (Padavinodam)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Mandali&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #92400e;
            --primary-dark: #78350f;
            --accent: #d97706;
            --text-main: #1c1917;
            --text-muted: #57534e;
            --bg-page: #faf8f5;
            --bg-card: #ffffff;
            --border-card: #e7e5e4;
            --badge-bg: #fef3c7;
            --badge-text: #92400e;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-page);
            color: var(--text-main);
            line-height: 1.65;
            padding: 24px 16px;
        }
        .container {
            max-width: 860px;
            margin: 0 auto;
            background: var(--bg-card);
            border: 1px solid var(--border-card);
            border-radius: 20px;
            padding: 36px 32px;
            box-shadow: 0 4px 20px -2px rgba(120, 53, 15, 0.08);
        }
        @media (max-width: 640px) {
            body { padding: 12px 8px; }
            .container { padding: 24px 18px; border-radius: 14px; }
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #f5f5f4;
            padding-bottom: 24px;
            margin-bottom: 28px;
        }
        .app-badge {
            display: inline-block;
            background: var(--badge-bg);
            color: var(--badge-text);
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 4px 12px;
            border-radius: 9999px;
            margin-bottom: 12px;
            border: 1px solid #fde68a;
        }
        .title {
            font-size: 30px;
            font-weight: 800;
            color: var(--primary-dark);
            margin-bottom: 6px;
        }
        .subtitle {
            font-size: 15px;
            color: var(--text-muted);
            margin-bottom: 12px;
        }
        .meta-bar {
            display: flex;
            justify-content: center;
            gap: 16px;
            font-size: 12px;
            color: #78716c;
            flex-wrap: wrap;
        }
        .lang-switch {
            margin-top: 16px;
            display: inline-flex;
            gap: 8px;
            background: #f5f5f4;
            padding: 4px;
            border-radius: 10px;
        }
        .lang-switch a {
            padding: 6px 14px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 13px;
            color: #44403c;
            transition: all 0.15s ease;
        }
        .lang-switch a.active {
            background: #ffffff;
            color: var(--primary-dark);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .highlights {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 14px;
            padding: 18px 20px;
            margin-bottom: 30px;
        }
        .highlights h3 {
            color: var(--primary-dark);
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .highlights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 10px;
        }
        .hl-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 13px;
            color: #78350f;
        }
        .hl-icon {
            font-weight: bold;
            color: #d97706;
        }
        h2 {
            font-size: 20px;
            font-weight: 700;
            color: var(--primary-dark);
            margin-top: 32px;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px solid #f5f5f4;
        }
        h3 {
            font-size: 16px;
            font-weight: 600;
            color: #292524;
            margin-top: 18px;
            margin-bottom: 8px;
        }
        p {
            margin-bottom: 14px;
            font-size: 14.5px;
            color: #44403c;
        }
        ul {
            margin-left: 20px;
            margin-bottom: 16px;
        }
        li {
            margin-bottom: 8px;
            font-size: 14px;
            color: #44403c;
        }
        strong {
            color: #1c1917;
        }
        .telugu-section {
            font-family: 'Mandali', 'Plus Jakarta Sans', sans-serif;
            font-size: 15.5px;
            line-height: 1.8;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 3px dashed #e7e5e4;
        }
        .contact-box {
            background: #f5f5f4;
            border: 1px solid #e7e5e4;
            border-radius: 12px;
            padding: 18px;
            margin-top: 24px;
        }
        .contact-box p {
            margin-bottom: 6px;
            font-size: 13.5px;
        }
        .footer {
            text-align: center;
            margin-top: 36px;
            padding-top: 20px;
            border-top: 1px solid #e7e5e4;
            font-size: 12.5px;
            color: #78716c;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <span class="app-badge">Official Legal Document</span>
            <h1 class="title">Privacy Policy / గోప్యతా విధానం</h1>
            <p class="subtitle"><strong>పదవినోదం (Padavinodam)</strong> • Telugu Crossword Puzzle Game</p>
            <div class="meta-bar">
                <span><strong>Effective Date:</strong> October 2026</span>
                <span>•</span>
                <span><strong>Last Updated:</strong> October 21, 2026</span>
                <span>•</span>
                <span><strong>Version:</strong> 1.0.0</span>
            </div>
            <div class="lang-switch">
                <a href="#english" class="active">English</a>
                <a href="#telugu">తెలుగు (Telugu)</a>
            </div>
        </header>

        <!-- Quick Summary Box -->
        <section class="highlights">
            <h3>🛡️ Privacy at a Glance (Key Highlights)</h3>
            <div class="highlights-grid">
                <div class="hl-item"><span class="hl-icon">✓</span><span><strong>Zero PII Collected:</strong> No name, email, phone, or login required.</span></div>
                <div class="hl-item"><span class="hl-icon">✓</span><span><strong>100% On-Device Storage:</strong> Scores and puzzle saves stay on your phone.</span></div>
                <div class="hl-item"><span class="hl-icon">✓</span><span><strong>Private Voice Typing:</strong> Speech recognized locally; never recorded or saved.</span></div>
                <div class="hl-item"><span class="hl-icon">✓</span><span><strong>Safe UPI Payments:</strong> Executed strictly via NPCI-approved UPI apps. Zero banking data seen.</span></div>
                <div class="hl-item"><span class="hl-icon">✓</span><span><strong>COPPA Compliant:</strong> Family-friendly; safe Telugu educational content for children.</span></div>
                <div class="hl-item"><span class="hl-icon">✓</span><span><strong>Zero 3rd-Party Ads:</strong> No trackers, profiling, or banner ad networks.</span></div>
            </div>
        </section>

        <!-- ENGLISH SECTION -->
        <article id="english">
            <h2>1. Introduction & Developer Identity</h2>
            <p>
                Welcome to <strong>పదవినోదం (Padavinodam)</strong> ("the App", "we", "our", or "us"). 
                Padavinodam is an educational, cultural Telugu crossword puzzle game developed and published by <strong>Arya Bhupathi</strong>. 
                We are fully committed to protecting your privacy and ensuring a transparent, secure gaming experience.
            </p>
            <p>
                This Privacy Policy explains how our application handles information, our strict zero-data-collection philosophy, and our adherence to international privacy standards, including Google Play Policies, PhonePe Indus Appstore guidelines, the Children’s Online Privacy Protection Act (COPPA), and the Indian Information Technology (IT) Act and Digital Personal Data Protection (DPDP) Act.
            </p>

            <h2>2. Information Collection and Use (Zero Personal Data Policy)</h2>
            <p>
                <strong>We do NOT collect, harvest, store, share, or sell any Personally Identifiable Information (PII).</strong>
            </p>
            <ul>
                <li><strong>No User Accounts:</strong> You do not need an account, password, email address, or phone number to play the game.</li>
                <li><strong>No Contact List or File Access:</strong> The app never requests access to your address book, media files, camera, SMS inbox, or device storage beyond local app caches.</li>
                <li><strong>No Location Tracking:</strong> The app does not track, access, or log your GPS or network-based physical location.</li>
            </ul>

            <h2>3. Local Device Storage (Progress & Gameplay)</h2>
            <p>
                All your gameplay progress—including completed crossword grids, timer records, puzzle streaks, energy points, and clue coins—is stored <strong>exclusively on your personal device</strong> using standard web/mobile storage (HTML5 <code>localStorage</code> / SQLite cache). 
            </p>
            <p>
                This data never leaves your device. If you clear the app data or uninstall Padavinodam, this locally stored game state is permanently deleted.
            </p>

            <h2>4. Microphone & Voice Typing (Telugu Speech-to-Text)</h2>
            <p>
                Padavinodam includes an optional <strong>Telugu Voice Typing</strong> feature that allows users to speak a Telugu letter or word rather than typing on the on-screen keypad.
            </p>
            <ul>
                <li><strong>On-Device Processing:</strong> Speech recognition is processed instantaneously using Android's native on-device SpeechRecognizer system service.</li>
                <li><strong>No Voice Recording:</strong> The app <strong>DOES NOT</strong> record, store, transmit, or analyze your audio. Audio streams are discarded immediately upon syllable transcription.</li>
                <li><strong>Permission strictly optional:</strong> You may decline microphone permission and enjoy the entire game using the on-screen Telugu keyboard without any limitations.</li>
            </ul>

            <h2>5. In-App Digital Purchases & UPI Payments</h2>
            <p>
                Padavinodam offers optional in-game digital enhancements, such as Clue Coin packs or an optional one-time unlock for the 5x5 Kids Section.
            </p>
            <ul>
                <li><strong>External UPI Deep Links:</strong> Payments are processed via standard, secure Unified Payments Interface (UPI) intent deep-links triggering verified NPCI-regulated payment apps installed on your device (e.g., PhonePe, Google Pay, BHIM, Paytm, Navi).</li>
                <li><strong>Zero Financial Data Access:</strong> Padavinodam <strong>NEVER</strong> requests, views, or stores your bank account numbers, debit/credit card details, UPI PINs, passwords, or OTPs. All financial settlement occurs solely between you, your banking provider, and the UPI gateway.</li>
            </ul>

            <h2>6. Children's Privacy (COPPA & Family Friendly Policy)</h2>
            <p>
                Padavinodam is designed as a family-friendly cultural learning game suitable for all ages, including children under 13.
            </p>
            <ul>
                <li>We feature a dedicated <strong>Kids Mode (5x5 grid)</strong> containing wholesome, educational vocabulary (animals, fruits, colors, family relations) without any mature themes.</li>
                <li>We comply strictly with the <strong>Children's Online Privacy Protection Act (COPPA)</strong>. We do not solicit or knowingly collect personal information from children under 13.</li>
                <li>If a parent or guardian believes any information was mistakenly provided, please contact us immediately for prompt deletion.</li>
            </ul>

            <h2>7. Advertisements and Analytics</h2>
            <p>
                <strong>Padavinodam is 100% Ad-Free.</strong> We do not integrate third-party advertising networks (such as Google AdMob, Unity Ads, or Meta Audience Network). We do not track user activities across different websites or mobile apps.
            </p>

            <h2>8. Device Permissions Explained</h2>
            <ul>
                <li><code>android.permission.INTERNET</code>: Required to download daily crossword puzzles and check server health.</li>
                <li><code>android.permission.RECORD_AUDIO</code>: Optional. Used strictly and temporarily when the user taps the microphone button for speech-to-text syllable recognition.</li>
            </ul>

            <h2>9. Security</h2>
            <p>
                Because we do not collect or store your personal data on remote servers, your personal information is intrinsically safe from server-side data breaches. Communication between the app and our puzzle content server is encrypted using standard Transport Layer Security (HTTPS / TLS 1.3).
            </p>

            <h2>10. Grievance Officer & Contact Information</h2>
            <div class="contact-box">
                <p>If you have any questions, suggestions, or concerns regarding this Privacy Policy, please contact our Developer and Grievance Officer directly:</p>
                <p><strong>Developer:</strong> Arya Bhupathi (Padavinodam Team)</p>
                <p><strong>Email:</strong> <a href="mailto:aryabhupathi@gmail.com" style="color: var(--primary); font-weight: 600;">aryabhupathi@gmail.com</a></p>
                <p><strong>Official App Website:</strong> <a href="https://padam.onrender.com" target="_blank" style="color: var(--primary); font-weight: 600;">https://padam.onrender.com</a></p>
                <p><strong>Location:</strong> Andhra Pradesh & Telangana, India</p>
            </div>
        </article>

        <!-- TELUGU SECTION -->
        <article id="telugu" class="telugu-section">
            <h2>గోప్యతా విధానం (Privacy Policy in Telugu)</h2>
            <p>
                <strong>పదవినోదం (Padavinodam)</strong> మొబైల్ అనువర్తనానికి స్వాగతం. ఈ గేమ్ తెలుగు భాషాభిమానులు, విద్యార్థులు మరియు కుటుంబాల కోసం రూపొందించబడిన విద్యాపరమైన తెలుగు పద ప్రహేళిక (Crossword). మీ గోప్యతను కాపాడడం మా ప్రాథమిక కర్తవ్యం.
            </p>

            <h3>1. వ్యక్తిగత సమాచార సేకరణ నిరాకరణ (Zero Personal Data Collection)</h3>
            <p>
                మేము మీ నుంచి ఎలాంటి వ్యక్తిగత సమాచారాన్ని (పేరు, ఈమెయిల్, ఫోన్ నంబర్, చిరునామా మొదలైనవి) సేకరించము, నిల్వ చేయము లేదా మూడవ పక్షాలకు విక్రయించము. ఈ గేమ్‌ను ఆడటానికి ఎలాంటి ఖాతా (Account) లేదా లాగిన్ అవసరం లేదు.
            </p>

            <h3>2. మొబైల్ పరికరంలో స్థానిక నిల్వ (Local Storage)</h3>
            <p>
                మీరు సాధించిన స్కోర్లు, పజిల్ పురోగతి, కాయిన్లు మరియు అన్‌లాక్ చేసిన ఫీచర్లు మీ మొబైల్ ఫోన్ స్థానిక మెమరీ (Local Storage) లో మాత్రమే భద్రపరచబడతాయి. ఈ సమాచారం మా సర్వర్లకు చేరదు. మీరు యాప్ డేటాను క్లియర్ చేస్తే లేదా యాప్‌ను అన్‌ఇన్‌స్టాల్ చేస్తే ఈ డేటా తొలగించబడుతుంది.
            </p>

            <h3>3. మైక్రోఫోన్ మరియు వాయిస్ టైపింగ్ (Microphone & Voice Input)</h3>
            <p>
                అక్షరాలను సులభంగా పలకడం ద్వారా నమోదు చేయడానికి యాప్‌లో వాయిస్ టైపింగ్ సదుపాయం కలదు. ఇది ఆండ్రాయిడ్ సిస్టమ్ స్పీచ్ రికగ్నైజర్ ద్వారా మీ మొబైల్‌లోనే ప్రాసెస్ అవుతుంది. మీ స్వరాన్ని రికార్డ్ చేయడం గానీ, సర్వర్లలో భద్రపరచడం గానీ జరగదు.
            </p>

            <h3>4. సురక్షిత చెల్లింపులు (Safe UPI In-App Payments)</h3>
            <p>
                యాప్‌లో అందించే అదనపు నాణాలు లేదా కిడ్స్ మోడ్ అన్‌లాక్ లాంటి ఫీచర్లు పూర్తిగా అధికారిక NPCI-ఆమోదిత UPI యాప్‌ల (Google Pay, PhonePe, Paytm, BHIM మొదలైనవి) ద్వారా మాత్రమే నిర్వహించబడతాయి. మీ బ్యాంక్ వివరాలు, పాస్‌వర్డ్‌లు, లేదా పిన్ (PIN) నంబర్లను పదవినోదం ఎన్నడూ చూడదు మరియు సేకరించదు.
            </p>

            <h3>5. పిల్లల గోప్యత మరియు భద్రత (COPPA & Family Friendly)</h3>
            <p>
                పదవినోదం అన్ని వయసుల వారికి, ప్రత్యేకించి చిన్న పిల్లలకు సురక్షితమైనది. 5x5 కిడ్స్ విభాగంలో పిల్లలకు ఉపయోగపడే పవిత్రమైన, తెలుగు విద్యా పదాలు మాత్రమే ఉంటాయి. ఇందులో ఎలాంటి అసభ్య లేదా అనుచిత విషయాలు ఉండవు. మేము COPPA నిబంధనలను ఖచ్చితంగా పాటిస్తున్నాము.
            </p>

            <h3>6. ప్రకటనలు లేని అనుభవం (No 3rd-Party Ads)</h3>
            <p>
                ఈ గేమ్‌లో మూడవ పక్ష ప్రకటనల నెట్‌వర్క్‌లు (Third-party Ad Networks) లేవు. మీ డేటాను ట్రాక్ చేసే కుకీలు లేదా ట్రాకర్లు లేవు.
            </p>

            <h3>7. మమ్మల్ని సంప్రదించండి (Contact Information)</h3>
            <div class="contact-box">
                <p>ఈ గోప్యతా విధానంపై మీకు ఏవైనా సందేహాలు లేదా సూచనలు ఉంటే మమ్మల్ని సంప్రదించవచ్చు:</p>
                <p><strong>డెవలపర్:</strong> ఆర్య భూపతి (Arya Bhupathi - Padavinodam Team)</p>
                <p><strong>ఈమెయిల్:</strong> <a href="mailto:aryabhupathi@gmail.com" style="color: var(--primary); font-weight: 600;">aryabhupathi@gmail.com</a></p>
                <p><strong>వెబ్‌సైట్:</strong> <a href="https://padam.onrender.com" target="_blank" style="color: var(--primary); font-weight: 600;">https://padam.onrender.com</a></p>
            </div>
        </article>

        <footer class="footer">
            <p>© 2026 పదవినోదం (Padavinodam). All rights reserved.</p>
            <p style="margin-top: 4px; font-size: 11.5px;">Designed with reverence for Telugu Literature and Player Privacy.</p>
        </footer>
    </div>
</body>
</html>
"""
