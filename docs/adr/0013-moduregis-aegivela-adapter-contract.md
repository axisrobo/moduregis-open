# ADR 0013: Moduregis-AEGIVELA Adapter Contract

## Status
Accepted

## Context
Moduregis 是 Capability 控制面，不拥有身份、授权、审批、撤销或执行授权的真相。AEGIVELA 是 AxisRobo 的安全结构（Security Fabric），拥有这些真相。Phase 0 需要一条可替换的、版本化的 AEGIVELA 适配端口，使 Moduregis 在不依赖 AEGIVELA 私有实现细节的情况下获得：
1. 将 bearer artifact 解析为可信 Principal；
2. 对控制面动作（`capability:read`, `capability:publish`, `capability:invoke`, `adapter:activate`）做策略决策；
3. 为每次执行请求签发短期、受众绑定的 Execution Grant。

## Decision
在 `internal/aegivela` 定义四个端口：
- `Authorizer` — 将 bearer token 转换为 `Principal`；
- `ActivationAuthorizer` — 已存在的 Adapter 激活授权端口；
- `PolicyEvaluator` — 对 `Principal` + `action` + `resource` + `namespace` 返回 `PolicyDecision`；
- `ExecutionGrantor` — 为 `Principal` + `GrantRequest` 返回 `ExecutionGrant`。

环境配置：
- `AEGIVELA_BASE_URL`：AEGIVELA API 基础地址；
- `AEGIVELA_INTERNAL_TOKEN`：服务间认证 token；
- `AEGIVELA_MODE`：`stub`（开发/测试）或 `remote`（真实服务）。

远程端点（v1alpha1 占位，待 AEGIVELA 团队最终确认）：
- `POST /v1/identity/bridge` — 返回 Principal；
- `POST /v1/policy/decisions/evaluate` — 返回 PolicyDecision；
- `POST /v1/grants/issue` — 返回 ExecutionGrant。

Stub 通过白名单 `AEGIVELA_STUB_ALLOWED_ACTIONS` 控制哪些动作被允许，所有缺失配置都返回 `ErrUnavailable`，保持 fail-closed。

## Consequences
- Moduregis 不自建 IAM、PDP 或 Grant 发行。
- `aegivela.DenyAll` 被替换为可配置的 `Stub` 或 `RemoteClient`。
- 新增 `internal/aegivela` 端口不得导入 `internal/adapters` 或 `internal/moduregis` 持久层，保持端口纯净。
- 当 AEGIVELA 端点最终确定后，仅更新 `remote.go`，不影响 Governor、Broker 或 API。
