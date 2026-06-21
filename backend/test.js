import { SarvamAIClient } from "sarvamai";

async function main() {
    const client = new SarvamAIClient({
        apiSubscriptionKey: "sk_xm3qu7hf_oeQs8l8ttOn0shJCypHf8jwR"
    });

    // Create batch job — change mode as needed
    // const job = await client.speechToTextJob.createJob({
    //     model: "saaras:v3",
    //     mode: "translate",
    //     languageCode: "unknown",
    //     withDiarization: true,
    //     numSpeakers: 2
    // });
    const job = await client.speechToTextJob.createJob({
        model: "saaras:v3",
        mode: "translate",
        // Include languageCode only when it is known.
        languageCode: "unknown",
        targetLanguageCode: "en-IN",
        withDiarization: true,
        numSpeakers: 2
    });


    // Upload and process files
    const audioPaths = ["./bikas.mp3"];
    await job.uploadFiles(audioPaths);
    await job.start();

    // Wait for completion
    await job.waitUntilComplete();

    // Check file-level results
    const fileResults = await job.getFileResults();

    console.log(`\nSuccessful: ${fileResults.successful.length}`);
    for (const f of fileResults.successful) {
        console.log(`  ✓ ${f.file_name}`);
    }

    console.log(`\nFailed: ${fileResults.failed.length}`);
    for (const f of fileResults.failed) {
        console.log(`  ✗ ${f.file_name}: ${f.error_message}`);
    }

    // Download outputs for successful files
    if (fileResults.successful.length > 0) {
        await job.downloadOutputs("./output");
        console.log(`\nDownloaded ${fileResults.successful.length} file(s) to: ./output`);
    }
}

main().catch(console.error);