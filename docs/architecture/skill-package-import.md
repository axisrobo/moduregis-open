# Skill Package Import

## Purpose

Registrar imports minimal `SKILL.md` metadata into an editable Capability Contract draft. Import is a publisher-assistance operation, not publication, conformance, authorization, or executor registration.

## Accepted Input

The initial importer supports only single-line `name` and `description` fields in opening YAML front matter:

```markdown
---
name: Code Review
description: Review a repository change.
---
```

The publisher supplies the target namespace and semantic version. The importer normalizes the name to the shared dotted identifier rules; `Engineering.Quality` plus `Code Review` becomes `engineering.quality.code_review`.

## Generated Draft

The draft includes identity, version, display metadata, tags, and empty signature collections. It intentionally omits:

- `permissions`
- `owner`
- `executor`
- `governance`

Those fields cannot be inferred safely from natural-language instructions. The generated object has a canonical digest but does not conform to the complete Capability Contract until the publisher fills the missing fields and runs conformance validation.

## CLI

```powershell
go run ./backend/cmd/moduregis-import-skill -skill-file ./SKILL.md -namespace engineering.quality -version 1.0.0
```

The command writes JSON containing `contract`, `digest`, and `missing_fields` to standard output. It does not persist data, sign an artifact, contact an executor, or publish a Capability.
