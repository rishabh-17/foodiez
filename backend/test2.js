export const transcriptTextWithSarvamAI = async (filePath, companyId) => {
    if (!filePath || typeof filePath !== "string") {
        throw new Error('Invalid filePath: The "path" argument must be a valid string.');
    }

    if (!existsSync(filePath)) {
        throw new Error(`FilePath not found: ${filePath}`);
    }

    const client = new SarvamAIClient({
        apiSubscriptionKey: process.env.SARVAM_API_KEY
    });

    let tempDir;

    try {
        // ===============================
        // 🔥 Dynamic Language Selection
        // ===============================

        // Determine language code: let Sarvam auto‑detect language.
        // For recordings where the source language varies, we keep it "unknown".
        // If you have a known source language for a particular case, you can override it here.
        let languageCode = "unknown"; // auto‑detect
        // Example override for a known company (uncomment if needed)
        // if (companyId?.toString().trim() === "67e560a6ae2e0d3f96b5eb09") {
        //     languageCode = "hi-IN";
        // }
        console.log("🔵 Creating Sarvam Job... Language:", languageCode);
        // Choose mode based on whether we know the source language.
        const mode = languageCode !== "unknown" ? "translate" : "transcribe";
        const job = await client.speechToTextJob.createJob({
            model: "saaras:v3",
            mode: "translate",
            // Include languageCode only when it is known.
            ...(languageCode !== "unknown" && { languageCode }),
            targetLanguageCode: "en-IN",
            withDiarization: true,
            numSpeakers: 2
        });

        await job.uploadFiles([path.resolve(filePath)]);
        await job.start();
        await job.waitUntilComplete();

        const fileResults = await job.getFileResults();
        console.log(fileResults)

        if (!fileResults.successful.length) {
            throw new Error("Sarvam transcription failed.");
        }

        // ===============================
        // 🔥 Download Output
        // ===============================

        tempDir = path.join(os.tmpdir(), `sarvam_${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        await job.downloadOutputs(tempDir);

        const files = fs.readdirSync(tempDir);
        const jsonFile = files.find(f => f.endsWith(".json"));

        if (!jsonFile) {
            throw new Error("No JSON output file found from Sarvam.");
        }

        const jsonPath = path.join(tempDir, jsonFile);
        const rawOutput = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        // ===============================
        // 🔥 Extract Segments Safely
        // ===============================

        let segments = [];

        if (Array.isArray(rawOutput?.segments)) {
            segments = rawOutput.segments;
        } else if (Array.isArray(rawOutput?.results?.segments)) {
            segments = rawOutput.results.segments;
        } else if (
            rawOutput?.results?.channels?.[0]?.alternatives?.[0]?.words
        ) {
            const words =
                rawOutput.results.channels[0].alternatives[0].words;

            let currentSpeaker = null;
            let currentText = "";
            let startTime = 0;

            words.forEach((w, i) => {
                if (currentSpeaker === null) {
                    currentSpeaker = w.speaker || 0;
                    startTime = w.start;
                    currentText = w.word;
                } else if (currentSpeaker !== w.speaker) {
                    segments.push({
                        speaker: currentSpeaker,
                        start: startTime,
                        end: w.start,
                        text: currentText
                    });

                    currentSpeaker = w.speaker;
                    startTime = w.start;
                    currentText = w.word;
                } else {
                    currentText += " " + w.word;
                }

                if (i === words.length - 1) {
                    segments.push({
                        speaker: currentSpeaker,
                        start: startTime,
                        end: w.end,
                        text: currentText
                    });
                }
            });
        } else if (rawOutput?.transcript) {
            segments = [{
                speaker: 0,
                start: 0,
                end: 0,
                text: rawOutput.transcript
            }];
        }

        if (!segments.length) {
            throw new Error("Sarvam returned transcript but structure is unknown.");
        }

        // ===============================
        // 🔥 Normalize (KEEP SAME FIELD NAMES)
        // ===============================

        let phrases = [];
        let fullText = "";
        let durationMilliseconds = 0;

        segments.forEach(segment => {
            const speakerRaw = segment.speaker ?? 0;

            const speaker =
                typeof speakerRaw === "string"
                    ? parseInt(speakerRaw.replace(/\D/g, ""))
                    : Number(speakerRaw);

            const startMs = Math.round((segment.start || 0) * 1000);
            const endMs = Math.round((segment.end || 0) * 1000);

            durationMilliseconds = Math.max(durationMilliseconds, endMs);

            phrases.push({
                speaker,
                offsetMilliseconds: startMs,
                durationMilliseconds: endMs - startMs,
                text: segment.text || ""
            });

            fullText += (segment.text || "") + " ";
        });

        console.log("✅ Sarvam transcription parsed successfully");

        // Always translate to English regardless of mode (transcribe or translate)
        finalPhrases = await translatePhrasesToEnglish(phrases);


        console.log(fullText, "transcription of sarvam---------")
        return {
            durationMilliseconds,
            combinedPhrases: [{ text: fullText.trim() }],
            phrases: finalPhrases
        };

    } catch (error) {
        console.error("❌ Sarvam transcription failed:", error);
        throw new Error(`Sarvam error: ${error.message}`);
    } finally {
        if (tempDir && fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }
};