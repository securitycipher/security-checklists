# Security Checklists

Source-of-truth content for [SecurityCipher Security Checklists Hub](https://securitycipher.com/security-checklists/).

Edit checklist items in `categories/*.json`, update `manifest.json` when adding a new domain, then rebuild and deploy the site UI.

## Item fields (v2 schema)

Every control in `categories/*.json` should include:

| Field | Required | Description |
|-------|----------|-------------|
| `title` | yes | Control name |
| `description` | yes | What this check validates |
| `severity` | yes | `critical`, `high`, `medium`, or `low` |
| `how_to_find` | yes | Detection steps, console paths, CLI, and tooling |
| `how_to_fix` | yes | Remediation guidance |
| `tools` | yes | Array of recommended tools |
| `references` | no | Array of `{ "title", "url" }` links |

### Enrich existing items

```bash
python3 tools/enrich_checklist_items.py   # adds missing v2 fields
python3 tools/build_checklist_hub_data.py
python3 tools/push_security_checklists.py "Enrich checklist detail fields"
```

## Related GitHub repos

| Repo | Content |
|------|---------|
| [security-checklists](https://github.com/securitycipher/security-checklists) | This repo - hub source data |
| [awsome-websecurity-checklist](https://github.com/securitycipher/awsome-websecurity-checklist) | Web checklist markdown, 2FA/CAPTCHA bypass guides |
| [awsome-security-mindmaps](https://github.com/securitycipher/awsome-security-mindmaps) | Security mind maps |

## Structure

```
manifest.json          # Hub metadata + category index (title, icon, color, legacy URLs)
categories/
  web.json             # Web application security (176 controls)
  aws.json             # AWS cloud security (100 controls)
  mobile.json          # Android + iOS
  azure.json           # Microsoft Azure
  gcp.json             # Google Cloud Platform
  llm.json             # LLM / AI security
  mcp.json             # MCP server security
  api.json             # REST / GraphQL API security
  kubernetes.json      # Kubernetes and containers
```

Each category file:

```json
{
  "id": "web",
  "title": "Web Application Security",
  "sections": [
    {
      "title": "Authentication and Session Management",
      "items": [
        { "title": "Control name", "desc": "What to verify." }
      ]
    }
  ]
}
```

## Category JSON schema

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Slug used in hub anchors (`#checklist-web`) |
| `title` | yes | Display name |
| `sections` | yes | Array of section objects |
| `sections[].title` | yes | Section heading |
| `sections[].items` | yes | Checklist rows |
| `sections[].items[].title` | yes | Control title |
| `sections[].items[].desc` | no | Testing guidance |

## Manifest entry schema

| Field | Description |
|-------|-------------|
| `id` | Category slug (must match JSON filename) |
| `title` | Card and panel title |
| `description` | Short summary on the hub |
| `icon` | `web`, `mobile`, `aws`, `azure`, `gcp`, `llm`, `mcp`, `api`, `k8s` |
| `color` | Hex accent for cards and progress bars |
| `status` | `live` or `draft` |
| `legacy_url` | Optional path on securitycipher.com for the old standalone page |
| `file` | Path to category JSON (default `categories/{id}.json`) |

## Build site UI from this repo

From the main [securitycipher](https://github.com/securitycipher/securitycipher) workspace (or your local site repo):

```bash
# Ensure this repo is cloned alongside your site project
git clone https://github.com/securitycipher/security-checklists.git security-checklists

# Compile hub JSON and copy into WordPress mu-plugin assets
python3 tools/build_checklist_hub_data.py

# Deploy to production
python3 tools/deploy_homepage.py
```

The hub reads `mu-plugin/homepage/assets/checklist-hub-data.json`, which is generated from this repository.

## Adding a new checklist

1. Create `categories/your-slug.json` with sections and items.
2. Add an entry to `manifest.json` under `categories`.
3. Run `build_checklist_hub_data.py` and deploy.
4. Register the WordPress page in `mu-plugin/homepage/page-registry.php` if it needs a native shell.

## Legacy markdown

`AWS Cloud Security Checklist.md` remains as a human-readable reference. The live hub uses `categories/aws.json`.

## Links

- Hub: https://securitycipher.com/security-checklists/
- Web checklist (legacy): https://securitycipher.com/web-application-security-checklist/
- AWS checklist (legacy): https://securitycipher.com/aws-security-checklist/
- LLM checklist (legacy): https://securitycipher.com/llm-ai-security-checklist/
