# ADR 0014: Resolver Structured Matching Semantics

## Status
Accepted

## Context
Resolver 需要把调用者 Intent 映射为候选 Capability。Phase 0 不引入语义向量或 Agent 规划；只验证结构化资格。

## Decision
- Resolver 输入：`Intent{CapabilityType, CapabilityID, Namespace, Verbs, Entities}`。
- Resolver 只读取已 `Published` 的 Capability 版本；`Draft`/`Submitted`/`Verified`/`Suspended`/`Revoked` 不得作为可执行候选。
- 如果 `CapabilityID` 非空，执行精确匹配；否则按 `CapabilityType` 或 `tags` 匹配。
- 返回 `Candidate{Capability, Score, Explanation}`，按 `Score` 排序；`Score` 为 0 表示不匹配。
- Resolver 不执行授权，只负责候选集合与资格解释；最终可执行性由 Governor/Broker 在调用前确认。
- Resolver 必须保留 `tenant_id` 与 `namespace` 隔离，不能跨租户返回候选。

## Consequences
- 语义检索和排序由 MNEMOVELA 后续接入；Resolver 保留结构化最终裁决。
- 高风险 Capability 的过滤不在 Resolver 中完成，而在 AEGIVELA 策略决策中完成。
