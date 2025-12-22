import * as core from "@actions/core";
import * as path from "path";
import * as os from "os";
import { downloadArtifact, S3Config, GitHubContext } from "@kusold/artifact-s3";

function resolvePath(inputPath: string): string {
  // Handle tilde expansion
  if (inputPath.startsWith("~")) {
    return path.join(os.homedir(), inputPath.slice(1));
  }
  return path.resolve(inputPath);
}

async function run(): Promise<void> {
  try {
    // Get inputs
    const name = core.getInput("name") || undefined;
    const pattern = core.getInput("pattern") || undefined;
    const inputPath =
      core.getInput("path") || process.env.GITHUB_WORKSPACE || process.cwd();
    const mergeMultiple = core.getInput("merge-multiple") === "true";
    const repository =
      core.getInput("repository") || process.env.GITHUB_REPOSITORY || "";
    const runIdInput =
      core.getInput("run-id") || process.env.GITHUB_RUN_ID || "0";
    const runId = parseInt(runIdInput, 10);

    // S3-specific inputs
    const s3Bucket = core.getInput("s3-bucket", { required: true });
    const s3Prefix = core.getInput("s3-prefix") || undefined;
    const s3Endpoint = core.getInput("s3-endpoint") || undefined;
    const s3Region = core.getInput("s3-region") || "us-east-1";
    const s3ForcePathStyle = core.getInput("s3-force-path-style") === "true";

    // Build S3 config
    const s3Config: S3Config = {
      bucket: s3Bucket,
      prefix: s3Prefix,
      endpoint: s3Endpoint,
      region: s3Region,
      forcePathStyle: s3ForcePathStyle || !!s3Endpoint,
    };

    // Build GitHub context
    const context: GitHubContext = {
      repository: process.env.GITHUB_REPOSITORY || "unknown/unknown",
      runId: parseInt(process.env.GITHUB_RUN_ID || "0", 10),
      runAttempt: parseInt(process.env.GITHUB_RUN_ATTEMPT || "1", 10),
    };

    const destPath = resolvePath(inputPath);

    core.info(`Downloading artifacts...`);
    if (name) {
      core.info(`  Artifact name: ${name}`);
    } else if (pattern) {
      core.info(`  Pattern: ${pattern}`);
    } else {
      core.info(`  Downloading all artifacts`);
    }
    core.info(`  Repository: ${repository}`);
    core.info(`  Run ID: ${runId}`);
    core.info(`  Destination: ${destPath}`);
    core.info(`  S3 bucket: ${s3Bucket}`);
    if (s3Prefix) {
      core.info(`  S3 prefix: ${s3Prefix}`);
    }
    if (s3Endpoint) {
      core.info(`  S3 endpoint: ${s3Endpoint}`);
    }

    const result = await downloadArtifact(s3Config, context, {
      name,
      pattern,
      path: destPath,
      mergeMultiple,
      repository,
      runId,
    });

    core.setOutput("download-path", result.downloadPath);

    core.info("");
    core.info("Artifact download complete!");
    core.info(`  Downloaded: ${result.artifactNames.join(", ")}`);
    core.info(`  Files: ${result.filesDownloaded}`);
    core.info(`  Path: ${result.downloadPath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(errorMessage);
  }
}

run();
