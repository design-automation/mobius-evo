import { Storage } from "aws-amplify";

export async function uploadS3(s3Key, object, onSuccess, onError, onProgress) {
    const s3config = {
        level: "protected",
        progressCallback(progress) {
            onProgress((progress.loaded * 100) / progress.total);
        },
    };
    try {
        await Storage.put(s3Key, object, s3config);
        onSuccess();
    } catch (err) {
        onError();
    }
}

export async function listS3(resolved, rejected) {
    try {
        const files = await Storage.list("files/", { level: "protected" });
        resolved(files);
    } catch (err) {
        rejected();
    }
}

export async function getS3(s3Key, resolved, rejected) {
    try {
        const s3Url = await Storage.get(s3Key, { level: "protected" });
        resolved(s3Url);
    } catch (err) {
        rejected();
    }
}

export async function getS3Url(s3Key, resolved, rejected) {
    try {
        const s3Url = await Storage.get(s3Key, { level: "protected" });
        resolved(s3Url.split("?")[0].replace(/s3.us-east-1.amazonaws/g, "s3.amazonaws"));
    } catch (err) {
        rejected();
    }
}

export function getS3Public(s3Key, resolved, rejected) {
    try {
        const url = "https://" + Storage._config.AWSS3.bucket + ".s3." + Storage._config.AWSS3.region + ".amazonaws.com/public/" + s3Key;
        resolved(url);
    } catch (err) {
        rejected();
    }
    // try {
    //   const s3Url = await Storage.get(s3Key, { level: "public"});
    //   console.log(s3Url)
    //   console.log(s3Key)
    //   resolved(s3Url);
    // } catch (err) {
    //   rejected();
    // }
}

export async function downloadS3(s3Key, resolved, rejected) {
    try {
        const s3Blob = await Storage.get(s3Key, { level: "protected", download: true });
        const s3Text = await s3Blob.Body.text();
        resolved(s3Text);
    } catch (err) {
        rejected();
    }
}

export async function downloadGIFile(s3Key, resolved, rejected) {
    try {
        const s3Blob = await Storage.get(s3Key, { level: "public", download: true });
        const s3Text = await s3Blob.Body.text();
        resolved(s3Text);
    } catch (err) {
        rejected();
    }
}

export async function getSettingsFile(resolved, rejected) {
    try {
        const s3Blob = await Storage.get("settings.json", { level: "public", download: true });
        const s3Text = await s3Blob.Body.text();
        resolved(s3Text);
    } catch (err) {
        rejected();
    }
}

export async function deleteS3(s3Key, rejected) {
    const files = await Storage.list(s3Key, { level: "public" }).catch((err) => {
        console.log(err);
        return;
    });
    const allPromises = files.map((f) => {
        return Storage.remove(f.key, { level: "public" }).catch((err) => console.log(err));
    });
    await Promise.all(allPromises);
}
