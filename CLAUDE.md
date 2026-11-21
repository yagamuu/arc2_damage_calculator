# CLAUDE.md

ユーザーとの対話は日本語で行うこと。

## Agent skills

> Note: `docs/` is the Vue build output and is wiped on build, so agent docs live in `agent-docs/` instead. Read any skill reference to `docs/agents/` or `docs/adr/` as `agent-docs/agents/` / `agent-docs/adr/`.

### Issue tracker

Issues are tracked in GitHub Issues (`yagamuu/arc2_damage_calculator`) via the `gh` CLI. See `agent-docs/agents/issue-tracker.md`.

### Triage labels

Default five labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `agent-docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` at the repo root, ADRs in `agent-docs/adr/`. See `agent-docs/agents/domain.md`.
