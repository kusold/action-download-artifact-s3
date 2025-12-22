# Download Artifact from S3

A drop-in replacement for [actions/download-artifact](https://github.com/actions/download-artifact) that downloads artifacts from S3-compatible storage instead of GitHub's built-in artifact storage.

## Usage

### Basic

```yaml
- uses: kusold/action-download-artifact-s3@v1
  with:
    name: my-artifact
    path: ./downloaded
    s3-bucket: my-artifacts-bucket
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Download All Artifacts

```yaml
- uses: kusold/action-download-artifact-s3@v1
  with:
    path: ./all-artifacts
    s3-bucket: my-artifacts-bucket
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Download with Pattern

```yaml
- uses: kusold/action-download-artifact-s3@v1
  with:
    pattern: build-*
    path: ./builds
    s3-bucket: my-artifacts-bucket
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Merge Multiple Artifacts

When downloading multiple artifacts, use `merge-multiple` to place all files in the same directory:

```yaml
- uses: kusold/action-download-artifact-s3@v1
  with:
    pattern: coverage-*
    path: ./merged-coverage
    merge-multiple: true
    s3-bucket: my-artifacts-bucket
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### With S3-Compatible Storage (Garage)

```yaml
- uses: kusold/action-download-artifact-s3@v1
  with:
    name: my-artifact
    path: ./downloaded
    s3-bucket: my-bucket
    s3-endpoint: https://garage.example.com
    s3-region: garage
    s3-force-path-style: 'true'
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.GARAGE_ACCESS_KEY }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.GARAGE_SECRET_KEY }}
```

### Download from Another Run

```yaml
- uses: kusold/action-download-artifact-s3@v1
  with:
    name: my-artifact
    path: ./downloaded
    run-id: 123456789
    s3-bucket: my-artifacts-bucket
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `name` | Artifact name to download | No | (all artifacts) |
| `path` | Destination directory | No | `$GITHUB_WORKSPACE` |
| `pattern` | Glob pattern for artifact names | No | - |
| `merge-multiple` | Merge multiple artifacts into same directory | No | `false` |
| `repository` | Repository to download from (`owner/repo`) | No | Current repo |
| `run-id` | Workflow run ID to download from | No | Current run |
| `s3-bucket` | S3 bucket name | **Yes** | - |
| `s3-prefix` | Prefix path within the bucket | No | - |
| `s3-endpoint` | S3-compatible endpoint URL | No | - |
| `s3-region` | AWS region | No | `us-east-1` |
| `s3-force-path-style` | Use path-style URLs | No | `false` |

## Outputs

| Output | Description |
|--------|-------------|
| `download-path` | Absolute path where artifacts were downloaded |

## Download Path Structure

When downloading artifacts, files are placed in the following structure:

**Single artifact (`name` specified):**
```
{path}/{artifact-name}/{original-upload-path}/...
```

**Multiple artifacts (no `name`, or `pattern`):**
```
{path}/{artifact-1-name}/{original-upload-path}/...
{path}/{artifact-2-name}/{original-upload-path}/...
```

**With `merge-multiple: true`:**
```
{path}/{original-upload-path}/...
```

## S3-Compatible Storage

This action works with any S3-compatible storage:

| Provider | Endpoint | Path Style |
|----------|----------|------------|
| AWS S3 | (not needed) | `false` |
| [Garage](https://garagehq.deuxfleurs.fr) | Your Garage URL | `true` |
| Cloudflare R2 | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` | `false` |
| MinIO | Your MinIO URL | `true` |
| DigitalOcean Spaces | `https://<REGION>.digitaloceanspaces.com` | `false` |
| Backblaze B2 | `https://s3.<REGION>.backblazeb2.com` | `false` |

## Complete Workflow Example

```yaml
name: Build and Test

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: npm run build

      - name: Upload build artifacts
        uses: kusold/action-upload-artifact-s3@v1
        with:
          name: build-output
          path: dist/
          s3-bucket: my-artifacts-bucket
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download build artifacts
        uses: kusold/action-download-artifact-s3@v1
        with:
          name: build-output
          path: ./dist
          s3-bucket: my-artifacts-bucket
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Run tests
        run: npm test
```

## Related

- [kusold/action-upload-artifact-s3](https://github.com/kusold/action-upload-artifact-s3) - Upload artifacts to S3
- [kusold/artifact-s3](https://github.com/kusold/artifact-s3) - Core library

## License

MIT
