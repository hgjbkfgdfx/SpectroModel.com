import React from 'react';
import { Article } from './MasterAgreementPart1';

export const MasterAgreementPart2 = () => (
  <>
    {/* SECTION V */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION V: INTERPRETATION, JURISDICTION & MISCELLANEOUS</h2>
      <Article title="5.1 LANGUAGE AMBIGUITY & TRANSLATION PRECEDENCE">
        <p>While the App provides translation features for global accessibility, the User agrees that in the event of a discrepancy, ambiguity, or conflict between a translated version of this Agreement and the English version, the English version written by the Creator shall prevail and govern. Ambiguity in translation, whether automated or manual, shall not be exploited to void, nullify, or circumvent the terms set forth herein. All Users, regardless of location, region, or dialect, must adhere to the Company policies as defined in the English language.</p>
      </Article>
      <Article title="5.2 FORCE MAJEURE & NETWORK RELIABILITY">
        <p>The Company is not liable for any failure to perform its obligations hereunder where such failure results from any cause beyond the Company's reasonable control, including, without limitation, mechanical, electronic, or communications failure or degradation. The User acknowledges that features such as "Sheet Music Generation," "Lyrics Analyzer," and "AI Music Assistant" rely on active network connections and that the App handles "Network errors gracefully". The Company does not guarantee 100% uptime and is not responsible for data loss caused by the User's internet service provider (ISP) or cloud storage provider.</p>
      </Article>
      <Article title="5.3 THIRD-PARTY ROYALTY RATES & INDEPENDENT VERIFICATION">
        <p>The "Monetization Hub" displays platform royalty rates (e.g., Tidal at $0.0125/stream, Deezer at $0.0064/stream). The User explicitly acknowledges that these rates are fluctuating market variables controlled entirely by the respective third-party streaming services. SpectroModel has no control over, and assumes no liability for, changes in these rates. The User is responsible for independently verifying current royalty structures before making financial decisions. The App's calculations are provided "as-is" for estimation purposes only.</p>
      </Article>
      <Article title="5.4 SEVERABILITY & NON-WAIVER">
        <p>If any provision of this Agreement is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that this Agreement will otherwise remain in full force and effect and enforceable. The failure of the Company to enforce any part of this Agreement shall not constitute a waiver of its right to later enforce that or any other part of this Agreement.</p>
      </Article>
      <Article title="5.5 SOLE AUTHORITY OF CREATOR & AMENDMENT RIGHTS">
        <p>The User expressly acknowledges that the "Creator" (also referred to as Owner, Company, or SpectroModel ENT.) maintains absolute, exclusive ownership of the App and all features contained therein. The Creator is the only individual or entity authorized to make amendments, modifications, or updates to this Agreement. No other person, party, employee, or third-party administrator is allowed to access user apps, admin accounts, or modify these legal terms. Any attempt by a User to claim administrative privileges or impersonate the Creator constitutes a material breach of this Agreement and immediate grounds for termination.</p>
      </Article>
      <Article title="5.6 EDUCATIONAL WARNING: 360 DEALS & LEGAL COUNSEL">
        <p>The App provides educational resources regarding music industry contracts, specifically the "360 Deal Warning". The User acknowledges that this information is for educational purposes only and does not constitute legal advice. The Company warns Users NEVER to sign a 360 deal without legal counsel, as such agreements typically grant labels control over ALL revenue streams. The User understands that artists in such deals often lose 50-80% of total earnings. The Company advises Users to hire a music attorney to review contracts lasting 5-10+ years with multiple album commitments. SpectroModel assumes no liability for contracts signed by the User based on or despite this educational warning.</p>
      </Article>
      <Article title="5.7 BATCH PROCESSING & HIGH-VOLUME ANALYSIS">
        <p>The "Studio Corrector" features a "Batch Processing" mode allowing for the upload and analysis of "Multiple Files" simultaneously. The User agrees that while the "Zero-Iteration" engine is optimized for speed, high-volume batch processing is subject to the "Fair Use" limits of the User's subscription tier. The Company utilizes "Auto-retry for network operations" to handle connectivity issues during batch uploads, but cannot guarantee the successful processing of corrupted files or formats not supported by the "Universal File Upload" protocol.</p>
      </Article>
      <Article title="5.8 SPATIAL AUDIO & ATMOS RENDERING">
        <p>The App includes "Spatial Audio" and "Atmos" rendering tools, with a default "Pristine" setting of 40% intensity. The User acknowledges that these features utilize algorithms to simulate three-dimensional soundscapes and do not replace professional Dolby Atmos mastering studios. The effectiveness of the spatial positioning and "Audio Delay" parameters depends heavily on the User's playback equipment. The Company is not responsible for phase cancellation or mono-compatibility issues arising from the aggressive use of these spatial tools.</p>
      </Article>
      <Article title="5.9 MOBILE FEEDBACK REDUCTION PROTOCOLS">
        <p>For Users accessing the App via mobile devices, the system employs an automatic "Feedback Reduction" protocol, typically set to "Auto 2x" or 0.0dB attenuation. This feature is designed to prevent audio feedback loops when using the device's microphone and speakers simultaneously during "Live Video Stream" or "Voice Profile" recording sessions. The User acknowledges that this automated gain reduction may momentarily alter the perceived volume or dynamic range of the input signal to protect hardware integrity.</p>
      </Article>
      <Article title="5.10 PITCH SHIFTING & TUNING REFERENCES">
        <p>The "Advanced Mixing" module allows Users to adjust "Pitch Shift" settings relative to a specific "Tuning Reference," defaulting to the international standard of 440Hz (A440). The User accepts that altering this reference frequency affects the entire harmonic structure of the audio file. The Company provides these tools for creative expression and is not liable for tuning discrepancies that may occur when mixing SpectroModel-processed tracks with audio tuned to alternative standards (e.g., 432Hz) without proper frequency conversion.</p>
      </Article>
      <Article title="5.11 DE-ESSER & FREQUENCY RANGE FILTERS">
        <p>The User acknowledges the availability of a "De-esser" tool (defaulting to 6dB reduction) and "Frequency Range Filters" (20Hz - 20000Hz) within the advanced mixing suite. These tools are destructive to the exported file's waveform. While the "Multi-Band" Advanced EQ provides "Professional EQ with Low/Mid/High/Presence" controls, the User is solely responsible for the sonic consequences of cutting or boosting specific frequencies. The "AI Learns From My Data" mandate applies to the usage patterns of these filters to refine future DSP presets.</p>
      </Article>
      <Article title="5.12 ZERO-STATIC ALGORITHM & 16-BIT PCM EXPORT">
        <p>The Company employs a specific "Zero-Static Algorithm" for file conversion and export. This technology ensures a "Direct 16-bit PCM export with NO intermediate buffers, NO static, NO artifacts". The User agrees that this feature is optimized for fast uploads and compatibility. However, the User must ensure their source file does not contain pre-existing static, as the "Static Removal" tool focuses on preventing added artifacts during processing, rather than engaging in forensic audio restoration of damaged source material.</p>
      </Article>
    </div>

    {/* SECTION VI */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION VI: STEM INTEGRATION & EDUCATIONAL TOOLS</h2>
      <Article title="6.1 MATHEMATICAL & SCIENTIFIC CORRELATIONS IN MUSIC">
        <p>The App includes a specialized suite of "STEM Tools" designed to demonstrate the intrinsic connections between music theory and hard sciences. The User acknowledges that these tools utilize "Music Connected" logic to illustrate concepts such as rhythm representing fractions, audio frequency measured in Hertz (Hz), and Beats Per Minute (BPM) calculations. The "Math Notebook" feature allows Users to enter expressions or calculate beat durations directly within the interface. The User agrees that while these tools are robust for educational purposes and "Learning," they are not intended to replace professional scientific graphing calculators or certified engineering software.</p>
      </Article>
      <Article title="6.2 JOURNALING & LYRICAL COMPOSITION RIGHTS">
        <p>The "Journal / Lyrics Writing" feature provides a digital workspace for Users to draft verses, choruses, hooks, and bridges. This tool is designed to function "like a traditional lyrics journal," allowing the User to jot down melody ideas and save rhyme schemes. While the User retains full copyright ownership of the original lyrics created within this module, the User explicitly consents to the "AI Learns From Your Data" mandate regarding text entry. This allows the Company's Natural Language Processing (NLP) models to analyze rhyme density, syllable counts, and structural patterns to refine the "Lyrics Analyzer" tool. Users are advised not to store highly sensitive personal information in the Journal.</p>
      </Article>
    </div>

    {/* SECTION VII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION VII: ADVANCED RENDERING & METAVERSE ASSETS</h2>
      <Article title="7.1 4K CINEMATIC ENGINE & EXPORT BITRATES">
        <p>The "SpectroModel 4K Cinematic Engine" offers high-definition video export capabilities for visualizing analyzed tracks. The User acknowledges that this engine supports generating "Cinema 422" files at 50Mbps and "Cinema 4444" files at 60Mbps. These high-bitrate exports require significant local processing power or cloud rendering resources. The User agrees that the Company is not liable for hardware overheating, crashes, or data corruption resulting from the User attempting to render 4K video on devices that do not meet the minimum system requirements.</p>
      </Article>
      <Article title="7.2 AVATAR POLYGON COUNTS & TEXTURE STANDARDS">
        <p>Within the "ML Training Engine" and "Avatar Customizer," the App enforces specific quality standards compatible with the Ready Player Me (RPM) ecosystem. The User understands that the "RPM Quality Boost" applies a +15% quality multiplier to generated assets. The generated avatars are restricted to a polygon count range of 75k to 125k polygons to ensure photorealistic rendering without crashing the metaverse environment. The User accepts that the AI is trained to prioritize "Modern Casual" styles and "Vibrant Colors".</p>
      </Article>
      <Article title="7.3 GENERATIVE ADVERSARIAL NETWORK (GAN) DISCLAIMER">
        <p>The avatar generation features utilize a "GAN v4.0" (Generative Adversarial Network) to produce "Photorealistic" results. The User acknowledges that GAN technology is probabilistic and may occasionally produce anatomical errors or "uncanny valley" effects during the "Quick Training" or "Overnight Continuous Training" cycles. The User agrees that the "Loss" metrics and "Accuracy" percentages displayed in the Live Preview are technical indicators of the AI's training progress and do not guarantee a flawless final export.</p>
      </Article>
    </div>

    {/* SECTION VIII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION VIII: REAL-TIME COMMUNICATION & PRIVACY</h2>
      <Article title="8.1 LIVE VIDEO STREAMING & END-TO-END ENCRYPTION">
        <p>The "Live Video Stream" feature allows collaboration team members to share their screen or camera feed in real-time. The Company guarantees that these streams are protected by "E2E Encrypted" (End-to-End) protocols, ensuring that unauthorized third parties cannot intercept the video feed. However, the User acknowledges that the "AI Learning" active during these sessions monitors metadata regarding connection stability and feature usage to optimize bandwidth allocation. The Company does not record or store the raw video content of these streams unless explicitly initiated by the User via a recording feature.</p>
      </Article>
      <Article title="8.2 REAL-TIME CO-EDITING & DATA CONFLICTS">
        <p>The "Real-time Co-Editing" module enables multiple users (e.g., "1 editing") to modify project files simultaneously. The User acknowledges that while the system is "Secure," data conflicts may arise if multiple users attempt to edit the exact same data block at the precise same millisecond. The Company employs "last-write-wins" logic or similar conflict resolution algorithms to handle these instances. Users are advised to communicate via "Team Chat" to coordinate edits and prevent overwriting each other's work.</p>
      </Article>
      <Article title="8.3 ACTIVITY LOGS & AUDIT TRAILS">
        <p>To ensure project transparency and security, the App maintains an "Activity Log" that records User actions within a collaboration project. The User consents to the tracking of their actions (e.g., file uploads, task completions, edits) for the purpose of creating this audit trail. This log cannot be disabled by the User, as it serves as a critical security feature to identify the source of unauthorized changes or accidental deletions.</p>
      </Article>
    </div>

    {/* SECTION IX */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION IX: GLOBAL DATA COMPLIANCE & REGULATORY FRAMEWORKS</h2>
      <Article title="9.1 INTERNATIONAL PRIVACY STANDARDS (GDPR, CCPA, LGPD, PIPEDA)">
        <p>SpectroModel is designed to be compliant with major global privacy frameworks, including the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), Lei Geral de Proteção de Dados (LGPD), and the Personal Information Protection and Electronic Documents Act (PIPEDA). The User acknowledges that while these laws grant specific rights regarding data access and deletion, the "AI Learns From My Data" mandate constitutes a legitimate business interest and contractual necessity for the operation of the App's core features.</p>
      </Article>
      <Article title="9.2 RIGHT TO REVOKE CLOUD ACCESS">
        <p>The User retains the absolute right to revoke SpectroModel’s access to their cloud storage provider at any time. This can be executed through the User's cloud provider settings. The User acknowledges that revoking this access will immediately cripple the App's functionality, as the "Cloud-First" architecture requires an active connection to save analysis results. The Company is not liable for data loss or service interruption resulting from the User's revocation of these permissions.</p>
      </Article>
    </div>

    {/* SECTION X */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION X: ADVANCED CUSTOMIZATION & HAPTIC PROGRAMMING</h2>
      <Article title="10.1 CUSTOM HAPTIC PATTERN CREATION">
        <p>Beyond the preset haptic patterns, the App allows Users to "Create Custom Pattern" sequences using millisecond-based coding. The User accepts full liability for the creation of these patterns. The User agrees not to program patterns designed to overheat device motors, drain batteries excessively, or simulate emergency alert signals. The "Test Custom Pattern" feature is provided to verify intensity levels before transmission; failure to test resulting in discomfort to the receiver is the sole fault of the User.</p>
      </Article>
      <Article title="10.2 PRESET HAPTIC DEFINITIONS & INTENT">
        <p>The App provides specific preset patterns with defined pulse counts, including "Heartbeat" (4 pulses), "Virtual Hug" (5 pulses), "Wave" (9 pulses), and "Soothing Waves" (6 pulses). The User acknowledges that these descriptions are subjective descriptors of tactile sensations. The "Wellness" category patterns are for relaxation purposes only and are not medical treatments for stress, anxiety, or physical therapy.</p>
      </Article>
    </div>

    {/* SECTION XI */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XI: FORMAT SUPPORT & CONVERSION LIABILITIES</h2>
      <Article title="11.1 EXTENDED AUDIO FORMAT SUPPORT">
        <p>The "Audio to MP3 Converter" supports a wide array of input formats, explicitly including WAV, MP4, M4A, FLAC, OGG, AAC, WMA, AIFF, APE, ALAC, and OPUS. The User acknowledges that converting "Lossless" formats to "Lossy" formats (MP3) results in irreversible data loss and audio degradation. The Company is not responsible for the sonic quality of the output file if the User selects a low bitrate.</p>
      </Article>
      <Article title="11.2 VIDEO FORMATS & IPAD OPTIMIZATION">
        <p>The App is optimized to handle video uploads (MP4) even on devices with restrictive file systems like the iPad. The User agrees that uploading video files for "Advanced Mixing" or "AI Vocal Isolation" extracts the audio track for processing. The App does not perform video editing or color correction on the uploaded source file within the Studio Corrector module; it only processes the audio signal.</p>
      </Article>
    </div>

    {/* SECTION XII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XII: CULTURAL & GENRE-SPECIFIC ALGORITHMIC POLICIES</h2>
      <Article title="12.1 HIP HOP & URBAN MUSIC SCORING CONTEXT">
        <p>The Company explicitly addresses potential discrepancies in "Hit Prediction" scores for specific genres. The User acknowledges that "Hip Hop music (80's, 90s, 2000s etc.) is sometimes not considered pop" by algorithms trained on current Top 40 charts. Therefore, a low score for a Hip Hop track "can mean a great song to urban communities" despite the algorithmic output. The User agrees that these results "mean nothing beyond what results display with no prejudice".</p>
      </Article>
      <Article title="12.2 NO DISCRIMINATION POLICY">
        <p>The Company adheres to a strict "No discrimination" policy. The App and its algorithms are designed with "no prejudice toward race, sex, sexual orientation, preference, clothing, demographic, place of origin etc.". The Creator states that "all are welcome except for those who violate policy." Any perceived bias in the "AI chatbots" or analysis tools is a technical limitation of current datasets, which the Company rectifies via the "AI Learns From My Data" feedback loop.</p>
      </Article>
      <Article title="12.3 RELIGIOUS & POLITICAL NEUTRALITY">
        <p>The User acknowledges that "Religious and political references and allusions are best kept out of the app" to maintain a neutral, creative environment. While the App classifies genres including "Christian" and "Gospel", the algorithmic analysis focuses solely on musical features and not the theological content of the lyrics.</p>
      </Article>
    </div>

    {/* SECTION XIII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XIII: DASHBOARD CUSTOMIZATION & UI MECHANICS</h2>
      <Article title="13.1 USER INTERFACE PREFERENCES & DISPLAY OPTIONS">
        <p>The User acknowledges that the App provides extensive "Display Options" to tailor the visual experience to personal workflow preferences. These options include "Compact Mode," designed to "Reduce padding and spacing" for information density, and "Show Animations," which allows the User to "Enable/disable UI animations". The Company is not liable for display aberrations if the User forces "Compact Mode" on devices with screen dimensions below the recommended minimum resolution.</p>
      </Article>
      <Article title="13.2 DATE & TIME DISPLAY PROTOCOLS">
        <p>The App includes a "Show Date" feature that displays the "current date on dashboard". The User understands that this timestamp relies on the "Timezone" settings configured in the User's profile. It is the User's sole responsibility to ensure their location settings are accurate via the "Get Current Location" tool. The Company is not responsible for missed deadlines or project synchronization conflicts arising from incorrect User-defined timezone configurations.</p>
      </Article>
    </div>

    {/* SECTION XIV */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XIV: ARTIST PROFILE & SOCIAL INTEGRATION</h2>
      <Article title="14.1 EXTERNAL LINKING & SOCIAL MEDIA VERIFICATION">
        <p>The "Artist Profile" section permits the User to connect various third-party social and streaming accounts to their SpectroModel identity. Supported integrations explicitly include Spotify URL, Apple Music URL, YouTube URL, Instagram URL, Twitter/X URL, TikTok URL, SoundCloud URL, and Bandcamp URL. The User warrants that all URLs provided direct to accounts owned and operated by the User.</p>
      </Article>
      <Article title="14.2 E-COMMERCE & MERCHANDISE LINKS">
        <p>The User may also integrate commercial links, specifically "Merch Store URL" and "Ecommerce (Shopify/Woo) URL". The User acknowledges that SpectroModel acts solely as a directory for these links and does not process payments, handle inventory, or manage customer service for the User's external merchandise sales.</p>
      </Article>
    </div>

    {/* SECTION XV */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XV: FREELANCE SERVICES & MARKETPLACE LISTINGS</h2>
      <Article title="15.1 LISTING OF PROFESSIONAL SERVICES">
        <p>The App provides a marketplace interface where Users can list "Services Offered" to the community. These categories include "Music Production," "Mixing," "Mastering," "Songwriting," and "Features/Collabs". The User agrees that by listing these services, they represent themselves as capable and competent in these disciplines. The Company does not vet, endorse, or certify the skill level of any User listing services on the platform.</p>
      </Article>
      <Article title="15.2 LYRICS FOR SALE & INTELLECTUAL PROPERTY TRANSFER">
        <p>The "Music & Services For Sale" section allows Users to list "Lyrics For Sale". The User expressly agrees that listing lyrics for sale constitutes an offer to transfer rights or grant licenses to potential buyers. The User must possess full, unencumbered ownership of any text listed. The Company is not a party to the rights transfer agreement and is not liable for copyright disputes that arise if a User sells plagiarized lyrics or lyrics containing uncleared samples or interpolations.</p>
      </Article>
    </div>

    {/* SECTION XVI */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XVI: ADVANCED SECURITY METRICS & MONITORING</h2>
      <Article title="16.1 LIVE SECURITY MONITOR & THREAT ASSESSMENT">
        <p>The Dashboard features a "Live Security Monitor" that provides real-time feedback on the App's defensive status. Metrics displayed include "0 Blocked" (attacks), "ML Complexity" (e.g., 0.00), and the current "AI threat assessment level". The User acknowledges that "ML Complexity" is a dynamic value representing the sophistication of the machine learning algorithms currently engaged in protecting the session.</p>
      </Article>
      <Article title="16.2 BROWSER CACHE MANAGEMENT & DATA HYGIENE">
        <p>The User is provided with a "Clear Cache" and "Browser Cache Management" tool. The Company clarifies that SpectroModel uses "minimal browser cache for performance optimization only" and that the User's "actual data lives in your cloud account". The User agrees that using the "Clear Browser Cache Only" function will remove temporary local files but will not delete analysis data stored in the cloud.</p>
      </Article>
      <Article title="16.3 ANTI-BYPASS & QUIET/LOUD HACKER PROTOCOLS">
        <p>The User acknowledges the specific "Anti-Bypass Security Active" protocol, which is engineered to detect and block "quiet/loud hacker systems". "Quiet" attacks refer to low-volume probing or passive sniffing, while "Loud" attacks refer to brute-force or DDoS attempts. The User agrees that any network activity originating from their IP address that mimics these attack patterns will trigger an automated defensive response.</p>
      </Article>
      <Article title="16.4 ADMINISTRATIVE MODIFICATIONS & AUDIT LOG INTEGRITY">
        <p>The App includes a "Change Audit Log" strictly reserved for "Admin Only" access. The User acknowledges that modifications to the App's core code, security protocols, or feature sets are restricted exclusively to "Base44 + admin". All modifications are logged to an immutable ledger to ensure accountability. The User agrees that they have no right to view, audit, or contest entries within this log unless compelled by a court order in a relevant jurisdiction.</p>
      </Article>
    </div>

    {/* SECTION XVII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XVII: VOCAL PROCESSING & BIOMETRIC DATA</h2>
      <Article title="17.1 VOICE PROFILE RECORDING & ENHANCEMENT">
        <p>The "Studio Corrector" allows Users to "Record voice for AI vocal enhancement" via the "Voice Profile" feature. The User explicitly consents to the recording and analysis of their unique vocal biometrics (timbre, pitch, cadence) for the sole purpose of training the "Consonant Corrector" and "AI Vocal Isolation" neural networks. The User acknowledges that this voice profile data is processed to synthesize missing phonemes and is subject to the "AI Learns From My Data" mandate.</p>
      </Article>
      <Article title="17.2 SIBILANCE CORRECTION & ACADEMIC RESEARCH BASIS">
        <p>The "Sibilance Corrector" tool is marketed as "Research-Based" and relies on specific academic methodologies. The User acknowledges that the Company’s algorithms are derived from peer-reviewed studies. While these algorithms aim to replicate the results achieved in controlled academic environments, the Company does not guarantee that the "Sibilance Reduction" (typically 3-10dB) or "Consonant Boost" (+3dB) will function identically on the User's specific audio files.</p>
      </Article>
      <Article title="17.3 NEURAL VOCAL ISOLATION LIMITATIONS">
        <p>The "AI Vocal Isolation" feature utilizes "Neural isolation" techniques to separate vocals from instrumental backgrounds. The User understands that this process is destructive and relies on probability masks to identify vocal frequencies. The Company is not liable for "spectral bleed," audio artifacts, or "watery" sound quality that often accompanies stem separation technology.</p>
      </Article>
    </div>

    {/* SECTION XVIII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XVIII: METAVERSE PHYSICS & TALENT IDENTIFIERS</h2>
      <Article title="18.1 AVATAR GENERATION PHYSICS & GOLDEN RATIO">
        <p>The "Avatar Customizer" employs specific design algorithms rooted in "Physics-based" modeling and the "Golden ratio" to ensure aesthetic proportion. The User acknowledges that the "Chunked processing" method is used to prevent browser freezes during the generation of complex 3D meshes. While the User may input preferences for features, the AI reserves the right to adjust these parameters to maintain the structural integrity of the avatar within the SpectroVerse physics engine.</p>
      </Article>
      <Article title="18.2 TALENT ROSTER & UNIQUE ASSET IDs">
        <p>Within the SpectroVerse, digital assets and avatars are assigned unique identifiers. The User acknowledges that these alphanumeric strings represent internal database keys and do not convey ownership of the underlying code or the "PIXELYNX" platform infrastructure. The Talent Roster is a proprietary listing of available assets. Users may select these assets for their scenes but do not acquire exclusive rights to the base models unless explicitly minted as an NFT.</p>
      </Article>
    </div>

    {/* SECTION XIX */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XIX: SUPPORT INFRASTRUCTURE & ISSUE RESOLUTION</h2>
      <Article title="19.1 AI ISSUE RESOLVER & AUTOMATED SUPPORT">
        <p>The App features a "BETA" tool known as the "AI Issue Resolver". Users are encouraged to "Describe your issue" to receive instant troubleshooting steps. The User acknowledges that this feature is automated and "AI learns from every resolution to improve support". Consequently, sensitive technical data regarding the User's error is analyzed to refine the support algorithm. The Company does not guarantee that the AI will successfully resolve all technical issues.</p>
      </Article>
      <Article title="19.2 TASK MANAGEMENT & ASSIGNMENT LIABILITY">
        <p>The "Collaboration Projects" interface allows Users to create "Tasks" and "Assignments" with specific metadata such as status and priority. The User agrees that SpectroModel acts as a passive conduit for this information. The Company is not responsible for missed deadlines, miscommunication between team members, or the failure of a User to complete an assigned task. The "Secure" nature of these assignments refers to data encryption, not the verification of the task's completion.</p>
      </Article>
      <Article title="19.3 EMAIL NOTIFICATIONS & AUTOMATION TRIGGERS">
        <p>When using the "Automation" feature, the User consents to receiving automated emails or push notifications. The User acknowledges that these notifications are triggered by system events and may be subject to delivery delays caused by third-party email providers. The Company is not liable for any damages resulting from a User failing to see a notification in a timely manner.</p>
      </Article>
    </div>

    {/* SECTION XXV */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXV: PAYMENT SECURITY & FINANCIAL TERMS</h2>
      <Article title="25.1 SECURE TRANSACTION GUARANTEE">
        <p>Payments are secure through third-party gateways. The Company does not store full credit card numbers. All transactions are protected by "Military-Grade Security" encryption standards.</p>
      </Article>
      <Article title="25.2 MARKET PRICING">
        <p>"The Market sets the price". Prices may fluctuate based on economic conditions. No undisclosed upgrades will be presented to the User without clear consent.</p>
      </Article>
    </div>

    {/* SECTION XXVI */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXVI: CONDUCT, DEFAMATION & REPUTATION MANAGEMENT</h2>
      <Article title="26.1 PROTECTION OF REPUTATION">
        <p>Harassment or negative targeting of the Company is prohibited. Violators will be banned and may face legal action for defamation.</p>
      </Article>
      <Article title="26.2 PROHIBITION OF ADULT CONTENT">
        <p>Sharing "XXX adult videos" is strictly prohibited and constitutes defamation of the SpectroModel brand. Violators will be reported to relevant authorities.</p>
      </Article>
      <Article title="26.3 FORGERY & THEFT">
        <p>Forging or stealing artist work is prohibited. The Company enforces IP rights and cooperates with legal entities to protect Creators.</p>
      </Article>
    </div>

    {/* SECTION XXVII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXVII: BROWSER-BASED PRIVACY ARCHITECTURE</h2>
      <Article title="27.1 LOCAL PROCESSING">
        <p>Certain tools process data locally in the browser, ensuring files never leave the device. This provides maximum privacy for sensitive projects.</p>
      </Article>
      <Article title="27.2 STATIC REMOVAL">
        <p>"Zero-Iteration Static Removal" filters digital artifacts during upload but does not repair pre-existing corruption in the source file.</p>
      </Article>
    </div>

    {/* SECTION XXVIII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXVIII: CLOUD CONNECTION & THIRD-PARTY STORAGE</h2>
      <Article title="28.1 CLOUD CONNECTION">
        <p>Users must allow cloud connections to save analysis results. The Company does not store raw audio permanently; it uses a volatile memory buffer.</p>
      </Article>
      <Article title="28.2 GOOGLE & MICROSOFT DISCLAIMER">
        <p>SpectroModel is not liable for the policies or uptime of third-party cloud providers like Google Cloud or Azure. Users are subject to their respective terms.</p>
      </Article>
    </div>

    {/* SECTION XXIX */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXIX: PROJECT MANAGEMENT & TEAM DYNAMICS</h2>
      <Article title="29.1 PROJECT OVERVIEW">
        <p>Deleting a project removes all associated metadata and links. The Company cannot restore deleted projects once the "Delete" command is executed.</p>
      </Article>
      <Article title="29.2 TEAM INVITATIONS">
        <p>The Project Owner is responsible for vetting invited team members. The Company is not liable for data breaches caused by authorized team members.</p>
      </Article>
    </div>

    {/* SECTION XXX */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXX: SCHEDULING & TEMPORAL MANAGEMENT</h2>
      <Article title="30.1 CALENDAR INTEGRATION">
        <p>The internal calendar is a planning tool. The Company is not liable for missed deadlines due to reliance on internal notifications.</p>
      </Article>
      <Article title="30.2 TASK PROGRESSION">
        <p>Task statuses are manually updated and do not represent automated verification of work quality.</p>
      </Article>
    </div>

    {/* SECTION XXXI */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXXI: REAL-TIME COLLABORATION FEATURES</h2>
      <Article title="31.1 SCREEN SHARING PRIVACY">
        <p>Screen sharing broadcasts the entire screen. The User is responsible for hiding sensitive information before sharing.</p>
      </Article>
      <Article title="31.2 CO-EDITING LATENCY">
        <p>Real-time co-editing may experience latency. Users should verify "Save" confirmation to ensure data persistence.</p>
      </Article>
    </div>

    {/* SECTION XXXII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXXII: EDUCATIONAL MODULES & ANALYSIS</h2>
      <Article title="32.1 CUSTOM TOPIC ANALYSIS">
        <p>AI-generated educational analyses may contain inaccuracies. Users should verify facts with primary sources.</p>
      </Article>
      <Article title="32.2 TRIVIA & QUIZ INTEGRITY">
        <p>Users agree not to use bots to cheat on quizzes or inflate leaderboard scores. Academic integrity is required.</p>
      </Article>
    </div>

    {/* SECTION XXXIII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXXIII: MARKETING INTELLIGENCE STRATEGY</h2>
      <Article title="33.1 PAID ADVERTISING RISK">
        <p>The App provides strategy, but the User is responsible for funding and executing ad campaigns. The Company is not liable for wasted ad spend.</p>
      </Article>
      <Article title="33.2 SEO DISCLAIMER">
        <p>SEO strategies are recommendations. The Company does not guarantee first-page rankings or increased traffic.</p>
      </Article>
    </div>

    {/* SECTION XXXIV */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXXIV: LYRICAL DATA & SEARCH PROTOCOLS</h2>
      <Article title="34.1 SEARCH HISTORY RETENTION">
        <p>Recent searches are cached locally. Anonymized search data improves the AI model. The Company is not liable for discrepancies in third-party lyric databases.</p>
      </Article>
      <Article title="34.2 EMOJI LYRICS">
        <p>"Emoji Lyrics Converter" transforms text. The Company claims no ownership of the result but protects the proprietary mapping logic.</p>
      </Article>
    </div>

    {/* SECTION XXXV */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXXV: ADVANCED MONETIZATION TACTICS</h2>
      <Article title="35.1 PRE-SAVE CAMPAIGNS">
        <p>Pre-save campaigns are recommended but do not guarantee chart placement. The User is responsible for setup.</p>
      </Article>
      <Article title="35.2 BUNDLING STRATEGIES">
        <p>Revenue strategies are based on averages. The User accepts business risk when implementing pricing strategies.</p>
      </Article>
    </div>

    {/* SECTION XXXVI */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXXVI: NEURAL & COGNITIVE ANALYTICS</h2>
      <Article title="36.1 COGNITIVE IMPACT">
        <p>"Cognitive Impact" analysis is a simulation, not a medical scan. It is for creative optimization only.</p>
      </Article>
      <Article title="36.2 EMOTIONAL RESPONSE">
        <p>"Emotional Response" metrics are subjective predictions. The Company is not responsible for creative decisions based on these indicators.</p>
      </Article>
    </div>

    {/* SECTION XXXVII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXXVII: STUDIO ENVIRONMENT & PHYSICS SIMULATION</h2>
      <Article title="37.1 ENVIRONMENTAL PHYSICS">
        <p>Enabling physics increases computational load. The Company is not liable for browser crashes due to overloading the scene.</p>
      </Article>
      <Article title="37.2 POLYGON COUNT LIMITS">
        <p>Exceeding recommended polygon counts may pause generation to prevent system freezes. 75k-125k is the recommended range.</p>
      </Article>
      <Article title="37.3 INTERACTIVE CONTROLS">
        <p>Avatar responses are governed by ML. Synchronization depends on the adaptation engine and user latency.</p>
      </Article>
    </div>

    {/* SECTION XXXVIII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXXVIII: DATA SOVEREIGNTY & PORTABILITY RIGHTS</h2>
      <Article title="38.1 DATA EXPORT">
        <p>Users can download data in JSON format. The Company is not responsible for the security of downloaded files once they leave the secure environment.</p>
      </Article>
      <Article title="38.2 DATA PURGE">
        <p>Deleting an account purges personal identifiers, but aggregate training data remains in the AI model under the "AI Learns From My Data" mandate.</p>
      </Article>
    </div>

    {/* SECTION XXXIX */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XXXIX: ADVANCED AUDIO PROCESSING PARAMETERS</h2>
      <Article title="39.1 PITCH SHIFTING">
        <p>Pitch shifting alters the harmonic fundamental (e.g., A440). The Company is not liable for intonation clashes.</p>
      </Article>
      <Article title="39.2 MOBILE FEEDBACK REDUCTION">
        <p>Mobile devices use auto-attenuation to prevent feedback. This is a safety feature to protect hardware.</p>
      </Article>
      <Article title="39.3 FREQUENCY FILTRATION">
        <p>Filters are destructive to the waveform. The User is responsible for sonic consequences of EQ usage.</p>
      </Article>
    </div>

    {/* SECTION XL */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XL: DYNAMICS PROCESSING & SPATIAL ENGINEERING</h2>
      <Article title="40.1 COMPRESSION SETTINGS">
        <p>Aggressive compression alters dynamic range. The Company disclaims liability for sonic artifacts like "pumping".</p>
      </Article>
      <Article title="40.2 SPATIAL AUDIO">
        <p>Spatial tools are psychoacoustic simulations. Translation across playback systems is not guaranteed.</p>
      </Article>
      <Article title="40.3 MASTER GAIN">
        <p>Increasing gain beyond 0dB risks clipping. The User must monitor output levels to prevent distortion.</p>
      </Article>
    </div>

    {/* SECTION XLI */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XLI: UNIVERSAL FILE SYSTEM & INGESTION</h2>
      <Article title="41.1 NON-AUDIO FILES">
        <p>Non-audio files are stored but not processed by audio engines. Users must not upload malware or executables.</p>
      </Article>
      <Article title="41.2 IPAD OPTIMIZATION">
        <p>The App bypasses some iPad file restrictions but cannot override OS-level security sandboxing or file system limitations.</p>
      </Article>
    </div>

    {/* SECTION XLII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XLII: USER INTERFACE NAVIGATION & AUDIO CONTROLS</h2>
      <Article title="42.1 SIDEBAR NAVIGATION">
        <p>Sidebar state is saved locally. The Company is not liable for layout shifts on small screens or unsupported resolutions.</p>
      </Article>
      <Article title="42.2 GLOBAL AUDIO FEEDBACK">
        <p>"Sound On" enables system audio. This is distinct from audio engine volume. Users should adjust volume to prevent spikes.</p>
      </Article>
    </div>

    {/* SECTION XLIII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XLIII: ANALYSIS HISTORY & DATA RETENTION</h2>
      <Article title="43.1 RECENT ANALYSES">
        <p>Analysis history is persistent. Users consent to the use of this data for AI training and historical tracking.</p>
      </Article>
      <Article title="43.2 COMPLETION METRICS">
        <p>Completion rates track successful processing. Failed analyses due to network error may not count towards this metric.</p>
      </Article>
    </div>

    {/* SECTION XLIV */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XLIV: WORKFLOW OPTIMIZATION & QUICK ACTIONS</h2>
      <Article title="44.1 QUICK ACTIONS">
        <p>Shortcuts load default presets. The Company is not liable for results if detailed settings are bypassed.</p>
      </Article>
      <Article title="44.2 FILTERING & SORTING">
        <p>Filtering hides data from view but does not delete it. Custom sorts may not persist after refresh unless saved.</p>
      </Article>
    </div>

    {/* SECTION XLV */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XLV: SOFTWARE LIFECYCLE & DEVELOPMENT ROADMAP</h2>
      <Article title="45.1 VERSION HISTORY">
        <p>The App evolves. Older features may be deprecated in newer versions to ensure security and stability.</p>
      </Article>
      <Article title="45.2 DEVELOPMENT STATISTICS">
        <p>Statistics are informational and do not guarantee future update frequency or specific feature releases.</p>
      </Article>
      <Article title="45.3 ROADMAP DISCLAIMER">
        <p>"Coming Soon" features are forward-looking statements and not guaranteed to launch by a specific date.</p>
      </Article>
    </div>

    {/* SECTION XLVI */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XLVI: CONTACT & SUPPORT CHANNELS</h2>
      <Article title="46.1 OFFICIAL SUPPORT">
        <p>The official support email is legal@spectromodel.com. Response times via other channels are not guaranteed.</p>
      </Article>
    </div>

    {/* SECTION XLVII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XLVII: GENRE DEFINITIONS & HISTORICAL CONTEXT</h2>
      <Article title="47.1 GENRE CATEGORIZATION">
        <p>Genres are defined by sonic characteristics. Misclassification of fusion genres is possible and not a system failure.</p>
      </Article>
      <Article title="47.2 REGIONAL GENRES">
        <p>Regional genres like "K-Pop" are identified by sonic markers, not artist nationality or ethnicity.</p>
      </Article>
    </div>

    {/* SECTION XLVIII */}
    <div className="mb-12 border-l-8 border-black pl-6 py-2">
      <h2 className="text-3xl font-black text-black mb-6 uppercase border-t-8 border-black pt-4 inline-block">SECTION XLVIII: ACADEMIC RESEARCH & THIRD-PARTY STUDIES</h2>
      <Article title="48.1 RESEARCH INTEGRATION">
        <p>The App uses peer-reviewed research. The Company does not warrant the absolute accuracy of external conclusions.</p>
      </Article>
      <Article title="48.2 RHYTHM RESEARCH">
        <p>Rhythm analysis is based on computational music analysis studies and FFT signal processing.</p>
      </Article>
      <Article title="48.3 PREDICTIVE MODELING">
        <p>Market fit is based on research regarding audio feature popularity and historical trend analysis.</p>
      </Article>
    </div>
  </>
);