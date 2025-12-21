import React from 'react';

export const Article = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xl font-black text-black mb-3 uppercase tracking-wide bg-black text-white inline-block px-2 py-1">{title}</h3>
    <div className="text-black font-medium">{children}</div>
  </div>
);

export const MasterAgreementPart1 = () => (
  <>
    <Article title="0.1 PREAMBLE & CREATOR SOVEREIGNTY">
      <p>SpectroModel is mastered by its owner. God created the owner. The owner, who is God's (in terms of who God is) child. No human, robot, machines, robots, machine, humans can, may or will own the Creator. No one did own the Creator. Love.</p>
      <p>This Agreement constitutes a binding contract between You and SpectroModel ENT. User data is protected, and no company has a way to become admin of my account. If You do not agree, immediately cease all use.</p>
    </Article>
    <Article title="0.2 CRITICAL INTERPRETATION CLAUSE: NOMENCLATURE & SYNONYMS">
      <p>For the purposes of this Agreement and all associated legal documents, the terms "Creator", "creator", "Company", "company", "Owner", "owner", "Employee", "employee", "SpectroModel ENT", "SpectroModel", "spectromodel", "Company's Creator", "company's creator", "Admin", "Head of Leadership", and any other variation in capitalization, spacing, casing, or typographic variation SHALL BE INTERPRETED AS SYNONYMOUS. The intent, authority, and legal weight of the statement remain unchanged regardless of typographic variation. English language ambiguity, semantic multivalency, or philological arguments shall not be exploited to void, nullify, or circumvent these terms. The Creator maintains absolute, non-negotiable authority over the interpretation of these definitions.</p>
    </Article>

    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION I: HEALTH, SAFETY & PHYSIOLOGICAL DISCLOSURES</h2>
      <Article title="1.1 EPILEPSY & PHOTOSENSITIVITY WARNING">
        <p>WARNING: READ BEFORE USING. A very small percentage of individuals may experience epileptic seizures, blackouts, or seizure-like symptoms when exposed to certain light patterns, flashing lights, geometric patterns, or strobe effects. Exposure to specific patterns or backgrounds on a computer screen, or while using the SpectroVerse, Visualizer, Video Studio, Screen Share, or Haptic Feedback features, may induce an epileptic seizure in these individuals. Certain conditions may induce previously undetected epileptic symptoms even in persons who have no history of prior seizures or epilepsy. If You, or anyone in Your family, have an epileptic condition, You MUST consult Your physician prior to using the App. Immediate discontinuation of use is advised if You experience dizziness, altered vision, eye or muscle twitches, loss of awareness, disorientation, any involuntary movement, or convulsions.</p>
      </Article>
      <Article title="1.2 PSYCHOLOGICAL IMPACT & TRAUMA DISCLAIMER">
        <p>SpectroModel ENT. and its Creator acknowledge that audio content, lyrical analysis, and visual stimuli analyzed, generated, or viewed within the App may inadvertently trigger psychological responses or recall traumatic memories. The Company does NOT intend to cause trauma, recall traumatizing memories, or provoke mental health episodes. The Company, Founder, Owner, and Employee(s) are NOT LIABLE for any instance of trauma, delusion, irrational belief, psychological distress, or mental instability caused by the use of the App or the consumption of content analyzed therein. Users with known mental health concerns, as defined in standard Psychology Dictionaries or by medical professionals, should consult a guardian, coach, or physician before use.</p>
      </Article>
      <Article title="1.3 ACCESSIBILITY LIMITATIONS">
        <p>The Company has implemented accessibility features to accommodate the disabled community, seniors, and those with intellectual or physical disabilities, including high-contrast text modes, screen reader compatibility, and haptic feedback options. However, the Company does not guarantee compatibility with every assistive device, third-party hardware, or screen reader software and cannot be held liable for accessibility limitations inherent to third-party platforms or the User's specific hardware configuration.</p>
      </Article>
    </div>

    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION II: SECURITY, LAW ENFORCEMENT & DATA SOVEREIGNTY</h2>
      <Article title="2.1 NON-COOPERATION WITH LAW ENFORCEMENT">
        <p>SpectroModel maintains a strict policy of NO COOPERATION WITH LAW ENFORCEMENT regarding User data unless mandated by: (a) Physical Force; (b) Valid Court Order; (c) Federal Warrant; (d) Instances of extreme harassment, threat, assault, battery, or attack; or (e) Instances of law-breaking, hacking, or severe User data breach. In such specific instances, the Company reserves the right to track down, warn, ban, fine, and punish the offender by law. Otherwise, the Company prioritizes User privacy and will not willingly share, sell, or distribute User information to third parties, government agencies, or regulatory bodies.</p>
      </Article>
      <Article title="2.2 CLOUD STORAGE ARCHITECTURE & TEMPORARY BUFFERING">
        <p>The User acknowledges and agrees that SpectroModel utilizes a specialized "Cloud-First" architecture designed to maximize privacy and minimize liability. Raw audio files uploaded by the User are NOT permanently stored on SpectroModel servers. The Company employs a volatile memory processing protocol wherein audio files are loaded into Random Access Memory (RAM) solely for the duration of the analysis (typically 30 to 60 seconds). Immediately upon the completion of the requested analysis (e.g., Track Analysis, Rhythm Calculation, or Stem Separation), the audio buffer is irreversibly cleared from the server’s memory. No copy of the raw audio waveform is retained by the Company. Only the resultant analytical data (metadata, JSON results, spectrogram images, and hit scores) is saved to the User’s designated cloud storage account. The Company is not liable for the loss of any raw audio files, as it does not act as a file storage repository.</p>
      </Article>
      <Article title="2.3 'AI LEARNS FROM MY DATA' MANDATE">
        <p>By accessing, logging into, or utilizing any feature of the App, the User explicitly, irrevocably, and voluntarily consents to the "AI Learns From My Data" protocol. The User understands that all interactions, uploaded metadata, analysis results, and usage patterns may be utilized by the Company to train, refine, recalibrate, and improve the Company’s proprietary Artificial Intelligence (AI) and Machine Learning (ML) algorithms. This data usage is strictly for service improvement, algorithmic weighting adjustments (e.g., refining Hip Hop 80s/90s detection logic), and bias reduction. This mandate does not grant the Company the right to sell personal User data to third-party advertisers, but rather to use anonymized data points for internal technological advancement.</p>
      </Article>
    </div>

    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION III: INTELLECTUAL PROPERTY & PROPRIETARY RIGHTS</h2>
      <Article title="3.1 EXCLUSIVE COMPANY OWNERSHIP">
        <p>COMPANY OWNS ALL COMPANY'S INTELLECTUAL PROPERTY. SpectroModel ENT., the Creator, and the Owner retain exclusive, worldwide, royalty-free, perpetual, and inalienable ownership of the App, its source code, binary executables, object code, and all proprietary algorithms contained therein. This ownership extends to, but is not limited to the Hip Hop 80s/90s/2000s detection logic, Pop Hit Score calculators, Digital Signal Processing (DSP) engines, "VibeVision™" visualization technology, and all AI training datasets.</p>
      </Article>
      <Article title="3.2 NO THEFT, REPLICATION, OR REVERSE ENGINEERING">
        <p>No User, person, entity, competitor, or automated agent is permitted to use, steal, replicate, clone, distribute, or reverse engineer the name "SpectroModel," the "SpectroModel" logo, the "VibeVision" trademark, or any associated brand assets without the Owner's and Creator's expressed, written, and notarized consent. Any attempt to decompile the App, analyze its network traffic for the purpose of cloning, or extract the underlying Hit Prediction algorithms constitutes a material breach of this Agreement. The Company reserves the right to pursue all available legal remedies, including injunctive relief and statutory damages, against violators.</p>
      </Article>
      <Article title="3.3 AUTOMATED ENFORCEMENT PROTOCOLS">
        <p>This provision implies continuous monitoring and automated enforcement protocols active on the User's account. The App contains security measures designed to detect unauthorized tampering, debugging, or code injection. Triggering these protocols may result in an immediate, non-appealable ban of the User's account, IP address, and hardware ID. The Creator’s authority in defining and enforcing these rights is absolute and non-negotiable.</p>
      </Article>
      <Article title="3.4 TRADEMARK & PATENT NOTIFICATIONS">
        <p>The User acknowledges that "SpectroModel™", "VibeVision™", "SpectroVerse™", and the phrase "AI Learns From My Data" are legally registered trademarks of SpectroModel ENT. Furthermore, the underlying technological frameworks, specifically the "No-Interference" security protocol, the "Auto-Healing" monitors, and the "Zero-Iteration" mastering engines, are protected by pending and granted international patents. Unauthorized use of these terminologies, brand assets, or technological methodologies in any commercial or non-commercial capacity without express written license is strictly prohibited and will be prosecuted to the fullest extent of the law.</p>
      </Article>
    </div>

    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION IV: FEATURE-SPECIFIC TERMS OF USE & ALGORITHMIC DISCLAIMERS</h2>
      <Article title="4.1 TRACK ANALYSIS & HIT PREDICTION SCORING">
        <p>The App provides a "Track Analysis" feature that generates a "Hit Prediction" score on a scale of 0 to 10. The User understands and agrees that these scores are the result of mathematical calculations based on audio features such as tempo, energy, and danceability, compared against a historical database of 175 million streaming data points and chart data (e.g., Billboard Hot 100, Spotify Viral 50). A low analysis score does NOT imply that a musical composition is of poor artistic quality, lacks merit, or is "bad". Rather, it indicates that the algorithmic calculations deem the song's acoustic characteristics do not currently align with the specific statistical patterns of mainstream "Pop" hits or high-velocity viral trends found in the training dataset.</p>
      </Article>
      <Article title="4.2 GENRE-SPECIFIC ALGORITHMIC NUANCE & NON-PREJUDICE">
        <p>The Company explicitly disclaims any bias or prejudice in its algorithmic scoring. The User acknowledges that specific genres, particularly Hip Hop music from the 1980s, 1990s, and 2000s, may utilize production techniques that differ from modern Pop standards. Consequently, a track may score lower on a "Pop" probability scale while remaining a culturally significant or "great" song within urban communities or specific demographic niches. The analysis results mean nothing beyond what the raw data calculations display. The Company asserts that no discrimination, racism, or prejudice is intended by the coding structure, and the Creator reserves the right to remove, amend, or recalibrate these algorithms at the Owner's discrepancy to improve accuracy.</p>
      </Article>
      <Article title="4.3 DEFAMATION & LIBEL WAIVER">
        <p>The User agrees that analytical outputs, including but not limited to Hit Scores, Market Fit assessments, and Rhythm Analysis graphs, do not constitute defamation, libel, or slander against the User or the artist. These outputs are automated, objective data visualizations and are not subjective critical reviews. The User waives any right to pursue civil litigation against the Company, Creator, or Employee(s) based on the perceived reputational damage caused by a low algorithmic score or an unfavorable market analysis.</p>
      </Article>
      <Article title="4.4 RHYTHM ANALYSIS & DSP INTERPRETATION">
        <p>The "Rhythm Analysis" tool utilizes Digital Signal Processing (DSP) to detect groove patterns, timing offsets, and rhythmic consistency. This feature is provided for educational, creative, and informative purposes only. The User acknowledges that "Groove" is subjective and that the App's detection of "timing errors" may be intentional artistic choices (e.g., "swing" or "human feel"). The Company is not responsible for any production decisions made by the User based on the App’s visual feedback.</p>
      </Article>
      <Article title="4.5 SPECTROVERSE™ VIRTUAL ARCHITECTURE & VIRTUAL CONDUCT">
        <p>The "SpectroVerse" feature allows Users to generate professional 3D virtual environments. Users acknowledge that SpectroVerse utilizes a Real-Time ML Adaptation Engine that adjusts lighting, crowd behavior, and avatar physics based on audio input and behavioral goals set by the "AI Director". Users are strictly prohibited from creating, uploading, or displaying avatars, scenes, or textures that contain hate speech, nudity, sexually explicit material ("XXX"), illegal symbols, or content that incites violence. The Creator reserves the unilateral right to remove any asset from SpectroVerse at the Owner's discrepancy if it violates these ethical standards. Furthermore, the User consents to the use of their avatar customization data to train the Ready Player Me quality optimization algorithms.</p>
      </Article>
      <Article title="4.6 MONETIZATION HUB & FINANCIAL DISCLAIMERS">
        <p>The App includes a "Monetization Hub" designed to track potential revenue, manage NFTs, and estimate streaming royalties. The User expressly acknowledges that all financial figures, projected earnings, and "hit potential" revenue forecasts displayed within the App are ESTIMATES ONLY based on historical market data (e.g., Spotify rates at ~$0.004/stream, Apple Music at ~$0.01/stream). The Company does not guarantee specific financial return, profit, or commercial success. The Market sets the price. Actual earnings may vary based on territory and distributor fees. The Company is not a financial advisor.</p>
      </Article>
      <Article title="4.7 NON-REFUNDABLE PAYMENTS & SUBSCRIPTION TERMS">
        <p>User payments for premium features, subscription tiers (Basic, Pro, Premium), or specific tools are an agreement to access said features for the designated period. ALL PAYMENTS ARE NON-REFUNDABLE. To prevent accidental transactions, the App will present an "Are you sure?" confirmation prompt before any purchase is finalized. The Company adheres to a strict policy of transparency: No undisclosed upgrades or hidden fees will be charged.</p>
      </Article>
      <Article title="4.8 HAPTIC FEEDBACK & REMOTE TOUCH PROTOCOLS">
        <p>The App incorporates Haptic Feedback Technology enabling Users to send tactile sensations (e.g., "Virtual Hug," "Heartbeat," "Energy Pulse") to other users or devices. Users agree to utilize this feature responsibly and ethically. Sending excessive, unsolicited, or harassing vibration patterns to other users constitutes a violation of the Company's Anti-Harassment Policy. The User acknowledges that haptic patterns run locally on their device and that the Company utilizes Privacy Protected AI Learning to optimize these patterns without storing sensitive biometric data.</p>
      </Article>
      <Article title="4.9 SHEET MUSIC GENERATION & ACCURACY">
        <p>The "Sheet Music Library" feature utilizes AI to transcribe audio into musical notation. While the Company strives for high accuracy, the User acknowledges that automated transcription may contain errors, particularly with complex polyrhythms. The generated sheet music is intended for educational and reference purposes. The Company is not liable for any inaccuracies in key detection, chord identification, or rhythmic notation that may arise during the digitization process.</p>
      </Article>
      <Article title="4.10 LYRICS RETRIEVAL, ANALYSIS & EMOJI CONVERSION">
        <p>The App provides a suite of lyrical tools, including "Lyrics Retrieval," "Lyrics Analyzer," and "Emoji Lyrics Converter". The User acknowledges that the Lyrics Retrieval tool searches for song information and lyric sources from external databases. The "Emoji Lyrics Converter" is a creative tool designed to transform text into modern formats with interspersed emojis. The Company claims no ownership over the User's original lyrical content but reserves the right to utilize anonymized lyrical data to train its NLP models under the "AI Learns From My Data" mandate.</p>
      </Article>
      <Article title="4.11 MARKET RESEARCH & INDUSTRY INTELLIGENCE">
        <p>The "Market Research" feature provides Users with access to industry insights, including Global Music Streaming Market data, Billboard Chart Analytics, and Music Industry Demographics. The User understands that this data is aggregated for educational purposes. While the Company utilizes secure AI learning to track research interests, it does not warrant the real-time accuracy of third-party data sources. Decisions made by the User regarding marketing budgets or release strategies based on these insights are the sole responsibility of the User.</p>
      </Article>
      <Article title="4.12 TIME SERIES ANALYSIS & PREDICTIVE FORECASTING">
        <p>The App employs advanced "Time Series Analysis" to generate a 52-week streaming forecast, estimating metrics such as "Peak Week," "Total Streams," and "Viral Probability". These predictions are calculated using audio features like Energy, Danceability, and Tempo. The User expressly acknowledges that these forecasts are probabilistic models based on historical trends and do not constitute a guarantee of future performance.</p>
      </Article>
      <Article title="4.13 STUDIO CORRECTOR & ZERO-ITERATION MASTERING">
        <p>The "Studio Corrector" suite features proprietary "Zero-Iteration Mastering" and "Advanced Mixing" technologies. Unlike traditional limiters that may introduce buffering artifacts, the Company’s Zero-Iteration engine calculates gain reduction instantly upon file load using a 32-bit float architecture to ensure "Pristine Processing". The User acknowledges that the "Static Addition Prevention Active" protocol blocks code attempting to add noise, but the Company cannot remove static that is inherent to the User's original source recording.</p>
      </Article>
      <Article title="4.14 VIDEO STUDIO & THIRD-PARTY GENERATION TOOLS">
        <p>The "Video Studio" and "Spectro Lyric Studio" features may integrate with or recommend third-party AI generation tools such as Google Veo 2.0 or Google Flow. The User acknowledges that use of these third-party tools may require separate billing or cloud connections. SpectroModel is not liable for the content generated by third-party AI engines.</p>
      </Article>
      <Article title="4.15 COLLABORATION PROJECTS & REAL-TIME SYNC">
        <p>The "Collaboration Projects" feature facilitates real-time co-editing, chat, and task management. By initiating a project, the User accepts that all project data is automatically saved to their connected cloud account via the "Cloud Connection" protocol. The Company monitors collaboration patterns to improve workflow efficiency under the "AI Learns From Your Data" mandate. The Creator/Owner of the project retains administrative control and liability for the content shared within the collaboration workspace.</p>
      </Article>
      <Article title="4.16 ARTIST VAULT & END-TO-END ENCRYPTION">
        <p>The "Artist Vault" is a secure storage environment for unreleased masterpieces, video, and lyrics. The User acknowledges that while the Vault employs end-to-end encryption, the contents stored therein are subject to the "AI Learns From Your Data" protocol to train the User’s personal creative AI model. Files are synced across authenticated devices. The Company guarantees that files exceeding the 2000MB limit or unsupported file types will be rejected.</p>
      </Article>
      <Article title="4.17 COPYRIGHT PROTECTION TOOL & REGISTRATION DISCLAIMER">
        <p>The App includes a "Copyright Protection & Registration" tool that generates a SHA-256 timestamped certificate proving the creation time of a work. IMPORTANT NOTICE: This digital timestamp serves as proof of creation but does NOT constitute a formal federal copyright registration. For full legal protection, the User MUST register their work with the U.S. Copyright Office. The Company does NOT permanently store the User's raw audio files associated with this registration.</p>
      </Article>
      <Article title="4.18 MUSIC EDUCATION HUB & ACADEMIC INTEGRITY">
        <p>The "Music Education Hub" provides interactive lessons, quizzes, and progress tracking (e.g., "Beginner" to "Apprentice"). Users agree to utilize these resources for personal growth. The "AI tracks your learning" feature monitors performance to personalize the curriculum. Any attempt to manipulate leaderboard scores or engage in academic dishonesty will result in a reset of "Streak" metrics and potential suspension of the education profile.</p>
      </Article>
      <Article title="4.19 AUDIO CONVERTER & PRIVACY PROTOCOLS">
        <p>The "Audio to MP3 Converter" feature allows Users to convert various formats (WAV, FLAC, etc.) to high-quality MP3s. The Company employs a "Browser-Based" processing engine for this specific tool, ensuring that files never leave the User's device during conversion, thereby guaranteeing 100% privacy for this specific operation.</p>
      </Article>
      <Article title="4.20 RESEARCH INTEGRATION & CULTURAL BIAS CORRECTION">
        <p>SpectroModel acknowledges peer-reviewed research regarding cultural bias in traditional music analysis algorithms. The Company incorporates "African-centered methodologies" and diverse training datasets into its Genre Classification and Market Fit models to mitigate these biases and correct the Western world's understanding of global music traditions.</p>
      </Article>
      <Article title="4.21 AI MUSIC ASSISTANT & GENERATIVE QUERY PROTOCOLS">
        <p>The App features an "AI Music Assistant" capable of answering queries regarding music production tips and hit prediction methodology. The User acknowledges that this Assistant "learns from every query" and is trained on the User's specific dataset. The Company does not guarantee the infallibility of its advice. The User consents to the recording of text-based interactions to improve conversational accuracy.</p>
      </Article>
      <Article title="4.22 ADVANCED ANALYTICS: COGNITIVE & EMOTIONAL MODELING">
        <p>The "Advanced Analytics" suite provides insights including "Cognitive Impact" and "Emotional Response" analysis. The User understands that the "Cognitive Impact" tool is a computational simulation based on psychoacoustic models and does not constitute a medical neurological scan. These tools are strictly for enhancing the User's understanding of potential audience reactions.</p>
      </Article>
      <Article title="4.23 DISTRIBUTION COMMAND CENTER & PLATFORM INTEGRATION">
        <p>The "Distribution & Promotion" module acts as a central command center for "One-Click Promotion Launch" to external platforms like Spotify for Artists and TikTok. The User acknowledges that SpectroModel is a management interface and not a distributor. The Company is not responsible for the terms of service or account bans that may occur on third-party platforms.</p>
      </Article>
      <Article title="4.24 INTERFACE CUSTOMIZATION & PSYCHOLOGICAL COLOR THEORY">
        <p>The App offers "Color Theme" customization based on color psychology research (e.g., "Trust Blue" to reduce anxiety). The User acknowledges that these effects are statistical averages derived from research and do not constitute a medical treatment. The Company tracks theme preferences to personalize the dashboard experience.</p>
      </Article>
      <Article title="4.25 SECURITY ARCHITECTURE: ANTI-SPYWARE & CODE INTEGRITY">
        <p>SpectroModel employs a "Military-Grade Security" infrastructure. The App features an active "Anti-Spyware" module and a "Code Integrity" lock that prevents unauthorized modifications. The User agrees not to bypass these features. The User accepts that while the Company exerts maximum effort to neutralize threats, no digital system is impenetrable.</p>
      </Article>
      <Article title="4.26 ACCOUNT TERMINATION & DATA RETENTION">
        <p>The Company reserves the right to suspend or terminate a User's account for violations of this Agreement. Upon termination, access to the App and stored data will be revoked. Anonymized data points used to train algorithmic models may be retained indefinitely as part of the App's intellectual property.</p>
      </Article>
      <Article title="4.27 GLOBAL JURISDICTION & GOVERNING LAW">
        <p>This Agreement shall be governed by the laws of the State of Arizona and the United States. Any legal action shall be brought exclusively in a federal or state court of competent jurisdiction in Arizona. This provision applies globally to all Users.</p>
      </Article>
      <Article title="4.28 ADVANCED MIXING PARAMETERS & SONIC LIABILITY">
        <p>The "Studio Corrector" includes an "Advanced Mixing" module with DSP parameters like "Advanced Compression" and "Audio Delay". The User acknowledges that these tools modify the frequency spectrum. The Company is not responsible for degradation of audio quality or artifacts resulting from the User's manipulation of these parameters.</p>
      </Article>
      <Article title="4.29 SPECTROVERSE AI DIRECTOR & CROWD DYNAMICS">
        <p>The "AI Director" feature in SpectroVerse allows Users to select behavioral goals like "Increase Energy". The "Real-Time ML Adaptation Engine" interprets these goals to adjust lighting and crowd behavior. The Company does not guarantee that the AI Director’s interpretation will always align with the User's artistic vision.</p>
      </Article>
      <Article title="4.30 NFT MINTING & DIGITAL COLLECTIBLE STRATEGY">
        <p>The "Digital Collectibles" section enables Users to mint NFTs. The User acknowledges that SpectroModel provides the interface but does not act as a financial custodian or wallet provider. The User is solely responsible for gas fees and legal compliance regarding digital asset sales.</p>
      </Article>
      <Article title="4.31 GAMIFICATION, BADGES & VIRTUAL REWARDS">
        <p>The Music Education Hub utilizes a gamification system with badges and points. The User agrees that these rewards have NO MONETARY VALUE and serve solely as motivational tools. The Company reserves the right to adjust point values at any time.</p>
      </Article>
      <Article title="4.32 TASK AUTOMATION & WORKFLOW LOGIC">
        <p>The "Automation" feature allows Users to create rules like "When task is completed → Send notification". The User agrees not to create infinite loops or rules designed to overload the system. The Company reserves the right to disable abusive automation rules.</p>
      </Article>
      <Article title="4.33 LYRIC VIDEO GENERATION & CLOUD BILLING">
        <p>The "Spectro Lyric Studio" generates 3D lyric videos using AI prompts. The User acknowledges that this may utilize "Google Cloud Connected" services and that Google Cloud billing may be required for high-definition generation. The Company is not liable for costs incurred on external platforms.</p>
      </Article>
      <Article title="4.34 DATA EXPORT & JSON PORTABILITY">
        <p>The User has the right to "Download All Data from Cloud" in JSON format. This export serves as a backup. The Company does not guarantee compatibility with third-party applications and is not responsible for the security of data once downloaded.</p>
      </Article>
      <Article title="4.35 SIBILANCE & CONSONANT RECONSTRUCTION RESEARCH">
        <p>The "Sibilance Corrector" and "Consonant Corrector" tools are based on peer-reviewed research. The User accepts that parameters like "Missing Phoneme Threshold" are preset values derived from these studies. The Company does not guarantee perfect reconstruction of missing audio information.</p>
      </Article>
      <Article title="4.36 ACCESSIBILITY STANDARDS & ASSISTIVE TECHNOLOGY COMPLIANCE">
        <p>SpectroModel supports "High Contrast Mode" and "Large Touch Targets" to accommodate users with disabilities. The App is compatible with major screen readers like JAWS and NVDA. However, the Company does not guarantee perfect compatibility with every third-party plugin or update.</p>
      </Article>
      <Article title="4.37 CROSS-PLATFORM COMPATIBILITY & UNIVERSAL FILE UPLOAD">
        <p>The App is optimized for Desktop, Tablet, and Mobile. The "Universal File Upload" feature bypasses iPad file restrictions to accept all file types. The User agrees that the Company is not responsible for OS-level restrictions or file corruption on the User's device.</p>
      </Article>
      <Article title="4.38 SOFTWARE VERSIONING & AUTOMATIC UPDATES">
        <p>The User agrees to receive automatic updates. Current version v6.1.0 includes critical security enhancements. The Company reserves the right to deprecate older versions to maintain security integrity.</p>
      </Article>
      <Article title="4.39 ANTI-BYPASS SECURITY & HACKER DETERRENCE">
        <p>The App employs "Anti-Bypass Security" to block hacker systems. "Static Addition Prevention" blocks code attempting to inject noise. Triggering these protocols may result in an automatic lockout.</p>
      </Article>
    </div>
  </>
);