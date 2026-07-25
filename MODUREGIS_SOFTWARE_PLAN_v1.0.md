# Moduregis 软件规划 v1.0

**产品名称：** Moduregis  
**定位：** Enterprise Capability Platform  
**版本状态：** 架构与交付规划  
**日期：** 2026-07-15

## 1. 产品定义

Moduregis 是企业自治能力（Capability）的控制面。它让企业能够以统一、可验证和可治理的方式发布、发现、组合、授权、执行并审计 Capability。

它解决的核心问题不是“如何实现 Agent 推理”，而是：

> 企业拥有哪些可调用能力；它们在什么条件下可被谁发现、选择、授权、执行、撤销和审计？

Moduregis 是 AxisRobo Autonomous Capability Stack 的产品中心。它向人、Agent、流程和外部系统提供一致的 Capability 生命周期与治理接口。

### 1.1 产品边界

| Moduregis 负责 | Moduregis 不负责 |
|---|---|
| Capability Contract、版本、生命周期与权威登记 | 规划算法和多 Agent 委托策略 |
| Capability Catalog、检索、解析与资格判断 | Agent reasoning loop、模型调用和工具执行 |
| 发布审批、策略绑定、授权编排与审计关联 | 长周期工作流状态机与人工任务执行 |
| 运行时路由、调用前校验、执行记录关联 | 企业北南向流量代理和协议转换 |
| 一致性测试、签名、撤销和来源证明 | 记忆检索、经验学习和遗忘算法 |

### 1.2 体系中的位置

```text
Human / API / Agent Intent
          |
          v
     Moduregis Intent Interface
          |
          +------------------------+
          |                        |
          v                        v
      ORCHADYN                 Resolver Service
  planning/delegation      matching/eligibility
          |                        |
          +-----------+------------+
                      v
             Moduregis Governor
       policy, approval, authorization
                      |
                      v
          Moduregis Runtime Broker
              /                 \
             v                   v
      PRAXOVELA              RHEOVELA
   agent execution       durable workflow

Cross-cutting integrations:
MNEMOVELA: search index, context and execution experience
AEGIVELA: identity, authorization, approval, revocation, attestation
Harmovela: task, state and delegation coordination semantics
LIMENORA: enterprise ingress, egress and protocol boundary
```

Harmovela 是贯穿运行时对象的协调协议，不是 Moduregis 的中央消息服务器。Moduregis 可以通过 Harmovela 事件适配器发布或消费事件，但不拥有具体传输基础设施。

## 2. 核心原则

1. **Registry 是权威源。** Capability 的标识、版本、状态、拥有者、签名、撤销状态和生效策略必须由 Moduregis Registry 权威保存。
2. **Contract 先于实现。** 任一 Capability 的可发现、可组合和可执行性以稳定 Contract 为准，不以某个 Agent、工具或部署实现为准。
3. **声明与验证分离。** 发布者声明能力；Attestor 验证工件、运行时和一致性；Governor 决定是否生效。
4. **授权不等于发现。** 能发现 Catalog 条目不代表能调用它；每次执行仍须经过 AEGIVELA 授权与策略检查。
5. **计划不等于流程。** ORCHADYN 产生 Capability Plan；Moduregis 治理并保存该 Plan；只有需要持久化时才由 RHEOVELA 物化为流程。
6. **控制面与数据面分离。** Registry、Catalog、Policy Binding 和 Audit Index 是控制面；实际模型、工具、流程和数据调用发生在运行时数据面。
7. **可撤销、可追责。** 每个发布、解析、授权、调用和状态变更均须关联主体、租户、时间、策略版本与证据引用。

## 3. 目标用户与首期场景

| 用户 | 主要诉求 | Moduregis 提供的能力 |
|---|---|---|
| 平台管理员 | 管理全企业能力资产与风险 | 租户、命名空间、审批、策略绑定、审计与撤销 |
| Capability 发布者 | 将 API、MCP Tool、Agent Skill 或流程能力产品化 | Contract、验证、版本发布、沙箱/生产阶段晋级 |
| Agent/应用开发者 | 稳定地发现和调用受控能力 | Catalog、Resolver、Intent API、短期授权引用 |
| 安全与合规团队 | 控制高风险动作并保留证据 | Policy Binding、Approval Position、Attestation、不可抵赖审计索引 |
| 业务流程负责人 | 将经过批准的能力计划转为可审计流程 | Plan Registry、流程物化请求、运行状态关联 |

首期仅支持四类 Capability：

1. `api.operation`：受控 REST、gRPC 或企业系统操作。
2. `mcp.tool`：具有输入输出 Schema 的 MCP 工具。
3. `agent.skill`：由 PRAXOVELA 执行、可声明前置条件和风险的 Skill。
4. `workflow.template`：由 RHEOVELA 执行的确定性流程模板。

容器作业、数据管道、机器人设备和人工作业可在 Contract v2 扩展，不能为首期范围扩大而弱化 v1 的验证与授权语义。

## 4. Capability 域模型

### 4.1 标识与生命周期

Capability 使用不可变逻辑标识与不可变版本：

```text
capability://{tenant}/{namespace}/{name}@{semantic-version}
```

示例：`capability://acme/hr/create-employee@1.2.0`

| 生命周期状态 | 含义 | 可发现 | 可执行 |
|---|---|---:|---:|
| `draft` | 发布者编辑中 | 否 | 否 |
| `submitted` | 等待自动或人工检查 | 否 | 否 |
| `verified` | Contract、工件和一致性检查通过 | 受限 | 否 |
| `published` | 已进入 Catalog | 是 | 取决于授权 |
| `suspended` | 临时停止，保留历史 | 否 | 否 |
| `deprecated` | 可发现但不推荐新调用 | 是 | 是，受策略限制 |
| `revoked` | 安全或合规撤销 | 否 | 否 |
| `retired` | 生命周期结束，仅审计可见 | 否 | 否 |

版本一经 `published` 不可原地修改。修订必须创建新版本；紧急终止使用 `suspended` 或 `revoked`，从而保留完整历史。

### 4.2 最小 Capability Contract

```yaml
apiVersion: moduregis.io/v1alpha1
kind: Capability
metadata:
  name: create-employee
  namespace: hr
  version: 1.2.0
  owner: hr-platform
spec:
  type: api.operation
  summary: Create an employee in the HR system
  intent:
    verbs: [create]
    entities: [employee]
  inputSchemaRef: schema://hr/create-employee/input@1
  outputSchemaRef: schema://hr/create-employee/output@1
  preconditions:
    - employee_not_exists
  effects:
    - system:hr.employee.created
  risk:
    declaredLevel: L3
    approvalMode: policy-determined
  execution:
    executorRef: limenora://hr-api/v2/employees
    placement: enterprise
  governance:
    policySetRef: policy://hr/employee-write@4
    dataClassifications: [personal]
  observability:
    evidenceProfile: standard
```

Contract 必须包含输入输出 Schema、前置条件、效果、风险声明、执行器引用、策略引用和证据要求。自然语言描述只能辅助检索，不能作为授权或执行的唯一依据。

### 4.3 权威数据与派生数据

| 数据 | 权威系统 | 派生或副本 |
|---|---|---|
| Capability Contract、版本、状态、Owner、签名 | Moduregis Registry | Catalog、MNEMOVELA、分析仓库 |
| 检索向量、关系图、使用经验、失败历史 | MNEMOVELA | Moduregis 可保存引用与摘要 |
| 身份、授权令牌、撤销、审批决定 | AEGIVELA | Moduregis 保存不可变 evidence reference |
| Plan、批准位置、Plan 生命周期 | Moduregis Plan Registry | ORCHADYN、RHEOVELA |
| 执行实例、检查点、补偿状态 | PRAXOVELA 或 RHEOVELA | Moduregis 保存 execution reference 与结果摘要 |
| 协调消息和任务状态流 | Harmovela 适配的传输系统 | Moduregis 保存关联 ID，不保存消息总线真相 |

## 5. 产品模块

| 模块 | 职责 | 首期交付 |
|---|---|---|
| Registrar | 发布草稿、Schema 校验、签名提交、版本创建 | API、CLI、GitOps manifest 提交 |
| Registry | 权威 Contract、版本、状态、Owner 与策略绑定 | PostgreSQL 事务存储、不可变版本、状态机 |
| Catalog | 面向人和程序的浏览、过滤和文档视图 | 关键词/字段检索、标签、弃用提示 |
| Resolver Service | 根据 Intent、输入类型、上下文和约束给出候选集合 | 结构化匹配、资格过滤、可解释排序 |
| Planning Service | 企业内 ORCHADYN 的受控入口 | Plan 提交、策略上下文投影、Plan 归档 |
| Governor | 发布审批、策略评估、风险分流和调用前许可 | 与 AEGIVELA PDP、Approval Gateway 集成 |
| Runtime Broker | 将已授权调用路由到正确执行器并关联追踪 | 同步调用、异步回执、超时和幂等性 |
| Attestor | 验证 Contract、工件、执行器身份和一致性结果 | 签名、SBOM/镜像摘要引用、conformance 报告 |
| Console | 管理员、发布者、审计员的统一界面 | Catalog、发布、审批、调用历史、撤销 |
| Conformance Kit | SDK、fixture 与兼容性测试 | Contract linter、schema fixture、mock executor |

### 5.1 不应建立为 Moduregis 模块的能力

- **Agent loop、模型路由、MCP 适配：** 属于 PRAXOVELA 的 AXON Core 与 Janus。
- **沙箱、容器、WASM 和资源配额：** 属于 PRAXOVELA 的 Vulcan Forge。
- **持久流程、人工任务、定时器和补偿执行：** 属于 RHEOVELA。
- **Token 发行、scope attenuation、撤销协议与 PDP/PEP：** 属于 AEGIVELA；Moduregis 只声明和调用其接口。
- **企业入口代理、Webhook、外部协议转换：** 属于 LIMENORA。
- **向量检索、长期记忆、经验学习与遗忘：** 属于 MNEMOVELA。

## 6. 关键接口与工作流

### 6.1 发布到生产

```text
Publisher -> Registrar: submit Contract + executor evidence
Registrar -> Registry: create draft version
Registrar -> Attestor: validate schema, signature, executor identity
Attestor -> Registrar: conformance result
Registrar -> Governor: request publication decision
Governor -> AEGIVELA: evaluate policy / collect approval
Governor -> Registry: transition verified -> published
Registry -> Catalog: publish index event
Registry -> MNEMOVELA: project searchable metadata and relations
Registry -> Harmovela adapter: emit capability.published
```

发布 Gate：Schema 有效、Owner 已绑定、风险等级已声明、执行器身份可验证、所需策略存在、Conformance 通过、高风险能力的审批完成。任何 Gate 缺失时不得进入 `published`。

### 6.2 Intent 到执行

```text
Caller -> Moduregis: Intent + subject + context + constraints
Moduregis -> Resolver: candidate capabilities
Resolver -> Governor: eligibility and policy context
Governor -> AEGIVELA: authorization / approval / token
Moduregis -> ORCHADYN: plan only when composition or delegation is needed
ORCHADYN -> Moduregis: Capability Plan
Moduregis -> Governor: approve governed plan
Moduregis -> Runtime Broker: authorized invocation
Runtime Broker -> PRAXOVELA | RHEOVELA | LIMENORA executor
Executor -> Moduregis: execution reference, outcome, evidence reference
Moduregis -> MNEMOVELA: outcome and routing-experience projection
```

短时、低风险、单 Capability 调用不必经过 ORCHADYN 或 RHEOVELA。跨 Capability 分解、动态委托和重规划才调用 ORCHADYN；涉及等待、审批、定时或长期审计的 Plan 才物化至 RHEOVELA。

### 6.3 API 边界

首期对外 API 采用 REST/JSON，内部高频路径可补充 gRPC。所有写入 API 支持 `Idempotency-Key`，所有资源带有 `tenant_id` 与 `namespace`。

| API 组 | 关键操作 |
|---|---|
| `/v1/capabilities` | create draft、get version、search、deprecate、suspend、revoke |
| `/v1/publications` | submit、attestation status、approval status、publish |
| `/v1/resolve` | intent resolve、candidate explanation、eligibility result |
| `/v1/plans` | submit plan、get governed plan、approve/reject、materialize workflow |
| `/v1/invocations` | invoke、get status、cancel、get evidence references |
| `/v1/conformance` | validate manifest、run fixture suite、report compatibility |
| `/v1/audit` | query immutable audit index、export evidence manifest |

## 7. 技术架构

### 7.1 首期部署拓扑

```text
                         +-------------------------+
                         | Moduregis Console / CLI  |
                         +------------+------------+
                                      |
                         +------------v------------+
                         | API / Identity Adapter  |
                         +------------+------------+
                                      |
       +------------------------------+-------------------------------+
       |                              |                               |
+------v-------+              +-------v--------+             +--------v-------+
| Registry      |              | Resolver /     |             | Governor /     |
| PostgreSQL    |              | Catalog        |             | Runtime Broker |
+------+--------+              +-------+--------+             +--------+-------+
       |                               |                               |
       +---------------+---------------+-------------------------------+
                       |               |               |
                 +-----v----+    +-----v-----+   +-----v----------------+
                 | Attestor |    | Audit     |   | Integration adapters  |
                 |          |    | index     |   | AEGIVELA, ORCHADYN,   |
                 +----------+    +-----------+   | MNEMOVELA, Harmovela, |
                                                  | PRAXOVELA/RHEOVELA,   |
                                                  | LIMENORA              |
                                                  +-----------------------+
```

首期采用模块化单体（modular monolith）加独立 Worker，而不是一开始拆成大量微服务。原因是 Registry、发布状态机、Governor 和 Audit Index 存在强事务关联；过早分布式化会使一致性、可审计性和交付速度恶化。

建议基础设施：

| 用途 | 首期选择 | 演进条件 |
|---|---|---|
| 权威关系数据 | PostgreSQL | 读写分离或分区仅在容量证据出现后引入 |
| 缓存与短期协调 | Valkey/Redis | 仅保存可重建缓存，不保存权威状态 |
| 异步事件 | NATS JetStream 或 Kafka（二选一） | 由 Harmovela transport adapter 抽象 |
| 工件与证据文件 | S3 兼容对象存储 | Registry 只保存内容摘要与 URI |
| 搜索 | PostgreSQL 全文检索 | 复杂语义检索通过 MNEMOVELA 接入 |
| 身份与授权 | AEGIVELA，兼容 OIDC | Moduregis 不自建第二套 IAM |
| 可观测性 | OpenTelemetry | Trace ID 贯穿调用与证据链 |

### 7.2 多租户和隔离

- 所有权威记录以 `tenant_id` 为一级隔离键；`namespace` 用于租户内治理边界。
- 服务身份由 AEGIVELA 工作负载身份提供，禁止使用共享静态密钥调用内部接口。
- Resolver、Catalog 和 Audit 的查询均在策略过滤后返回，防止通过搜索枚举敏感 Capability。
- 工件和证据文件使用按租户隔离的对象前缀、短时签名 URL 与内容摘要校验。

### 7.3 审计模型

Moduregis 不取代各运行时的完整事件日志。它保存跨系统可关联的控制面审计索引：

```text
audit_event = {
  event_id, occurred_at, tenant_id, actor, action,
  capability_ref, plan_ref, invocation_ref,
  policy_version, decision, trace_id, evidence_refs, integrity_hash
}
```

运行时原始证据由 PRAXOVELA、RHEOVELA、AEGIVELA 或 LIMENORA 保存；Moduregis 保存内容摘要、位置与保留策略引用，使审计员能从一次调用追溯到发布版本、授权决定和执行证据。

## 8. 与其他产品的契约

| 产品 | Moduregis 输入 | Moduregis 输出 | 明确边界 |
|---|---|---|---|
| ORCHADYN | Intent、候选 Capability、约束和治理上下文 | 已治理的 Capability Plan、可用候选 | ORCHADYN 决定规划；Moduregis 决定登记、资格和治理 |
| PRAXOVELA | 已授权 invocation、Capability Contract、短期 token | execution outcome、checkpoint/evidence reference | PRAXOVELA 执行 Agent 行动；Moduregis 不运行 agent loop |
| MNEMOVELA | 已发布元数据投影、结果/经验事件 | 语义候选、上下文/经验摘要 | Registry 权威优先，MNEMOVELA 不修改 Capability 生命周期 |
| RHEOVELA | 已批准 Plan、物化策略 | process instance reference、状态与审计引用 | RHEOVELA 拥有流程实例与持久状态 |
| AEGIVELA | subject、Capability、请求范围、风险和上下文 | allow/deny/approval、短期 token、revocation/attestation | AEGIVELA 拥有身份、授权和撤销真相 |
| Harmovela | 可选的领域事件与任务关联 | 事件消费、状态关联 | 协议定义协调语义，不要求经过中央服务器 |
| LIMENORA | 外部执行器注册、边界策略结果 | API/MCP/Webhook 调用结果 | LIMENORA 拥有企业 ingress/egress 与协议转换 |

## 9. 交付路线图

### Phase 0：架构冻结与 Contract Foundation（4-6 周）

**目标：** 固化 v1 Capability Contract 与最小可验证发布链路。

- 定义 `Capability`、`Executor`、`PolicyBinding`、`Attestation` 的 JSON Schema 和 OpenAPI。
- 实现 PostgreSQL Registry、不可变版本、生命周期状态机与租户/命名空间隔离。
- 实现 manifest linter、fixture 驱动的 contract conformance harness。
- 提供 CLI：`validate`、`submit`、`get`、`list`。
- 接入 AEGIVELA 的身份验证接口；在其未完成前只用可替换 OIDC adapter 作开发替身。

**Gate：** 两种真实 Capability（一个 `mcp.tool`、一个 `api.operation`）从 manifest 到 `verified` 可复现；状态迁移、租户隔离和 schema compatibility 测试全部通过。

### Phase 1：Catalog、发布治理与审计（6-8 周）

**目标：** 企业可安全地发布、发现和撤销 Capability。

- 实现 Catalog、结构化检索、过滤、Owner 和依赖可视化。
- 实现 Governor 的发布 Gate、风险分流和人工审批位置。
- 实现 Attestor：签名、执行器身份、工件摘要和 conformance 报告绑定。
- 实现 Console 的发布、审批、版本比较、弃用和撤销界面。
- 建立控制面 Audit Index 与 OpenTelemetry trace propagation。

**Gate：** `draft -> published -> deprecated -> revoked` 生命周期可审计；撤销后 Resolver 和 Broker 在目标 SLO 内拒绝新调用；审计员可追溯一次调用的 Contract、策略版本和证据引用。

### Phase 2：解析、授权和单 Capability 执行（8-10 周）

**目标：** 将受控 Intent 解析为可解释、可授权的单 Capability 调用。

- 实现 Resolver 的 schema、标签、前置条件、风险和 placement 过滤。
- 接入 MNEMOVELA 的可选语义检索及经验排序，但保持结构化资格判断为最终裁决。
- 接入 AEGIVELA 的 Capability Token、approval、scope attenuation 和 revocation。
- 实现 Runtime Broker 与 PRAXOVELA、LIMENORA 的首批 executor adapters。
- 提供 invocation 状态、幂等性、失败分类和 evidence reference 回传。

**Gate：** 三个标准企业场景（CRM、HR、Finance）的单步骤调用满足授权、拒绝、审批、撤销和审计验收；未授权或撤销调用不能抵达执行器。

### Phase 3：Plan 治理与持久流程物化（8-12 周）

**目标：** 支持由 ORCHADYN 规划、由 Moduregis 治理、由 RHEOVELA 执行的跨 Capability 工作。

- 定义 Capability Plan Contract、plan version、approval position 和 alternative/recovery reference。
- 建立 ORCHADYN Planning Service adapter：输入约束投影、输出 Plan 验证与归档。
- 实现 Plan Governor：策略检查、人工批准、变更影响分析与 replan 边界。
- 接入 RHEOVELA Plan Materializer，保存 process instance 与 plan version 的双向链接。
- 使用 Harmovela adapter 关联 delegation/task/state 事件，不绑定单一消息系统。

**Gate：** 一个 HR onboarding 场景可从 Intent 生成 Plan、在审批点暂停、物化为流程、执行、补偿并提供完整关联审计。

### Phase 4：企业化与生态（持续迭代）

**目标：** 形成可部署、可扩展和可验证的企业产品。

- GitOps 发布流、promotion policy、环境差异策略和灾难恢复演练。
- 多区域/多租户运维、SLO、容量模型和保留策略。
- SDK（TypeScript、Go、Python）、Terraform/Helm、CI policy checks。
- 第三方 Capability publisher onboarding 与 compatibility certification。
- Enterprise 模块：高级组织治理、合规包、跨区域策略、运营分析和支持工具。

**Gate：** 至少一个生产邻近试点中，Capability 发布、授权、调用、撤销和审计的端到端指标可重复收集，并具备可公开的脱敏参考工件。

## 10. 首期仓库规划

```text
Moduregis/
  README.md
  MODUREGIS_SOFTWARE_PLAN_v1.0.md
  backend/
    cmd/
    internal/
  frontend/
    console/
  docs/
    architecture/
      capability-contract.md
      registry-and-lifecycle.md
      resolver-and-broker.md
      governance-and-audit.md
      integration-contracts.md
    adr/
    api/
  contracts/
    capability/
    plan/
    events/
    fixtures/
  deploy/
    compose/
    helm/
  tests/
    contract/
    integration/
    e2e/
```

初期后端采用 Go，实现 API、Worker、Registry、Resolver、Governor、Runtime Broker 和产品适配器；Console 采用 TypeScript/React；SDK 可按 Go、TypeScript 和 Python 分别发布。Contract 始终以语言无关的 JSON Schema/OpenAPI 固化。Go 的并发、部署和运维优势应服务于模块化单体边界，而不是成为过早拆分微服务或复制 domain model 的理由。

## 11. 测试、SLO 与上线门槛

### 11.1 必备测试层

| 层级 | 验证内容 |
|---|---|
| Contract | Schema 有效性、向后兼容规则、正反 fixture、各 SDK 一致性 |
| Domain | 生命周期状态机、版本不可变、租户隔离、资格规则、幂等性 |
| Integration | AEGIVELA、PRAXOVELA、MNEMOVELA、RHEOVELA、LIMENORA adapters |
| Security | 越权发现、scope escalation、撤销竞态、伪造 attestation、跨租户访问 |
| End-to-end | 发布、解析、授权、执行、失败、补偿、撤销和审计追溯 |
| Resilience | Registry 恢复、事件重复/乱序、executor 超时、依赖不可用、灾备恢复 |

### 11.2 初始 SLO（试点目标）

| 指标 | 目标 |
|---|---:|
| Registry 读 API 月可用性 | 99.9% |
| 已缓存结构化 Resolver p95 | 小于 150 ms |
| Broker 在授权后新增开销 p95 | 小于 100 ms，不含执行器时间 |
| 高优先级撤销传播到 Broker | 小于 60 s |
| 发布审计事件可查询延迟 | 小于 5 min |
| 跨租户数据泄漏 | 0 容忍，阻断上线 |

这些指标是试点验收假设，不应在没有实际基线前作为对外性能承诺。

## 12. 开源与企业版边界

| 层 | Core | Enterprise |
|---|---|---|
| Contract 与 Conformance | Schema、SDK、fixture、linter | 认证服务与支持包 |
| Registry | 单/基础多租户、版本、生命周期、基础 Catalog | 大规模多租户、跨区域复制、保留治理 |
| Governance | 基础 policy binding、审批接口 | 组织策略包、审批矩阵、合规包、风险分析 |
| Runtime Broker | 标准 adapters、调用契约、基础审计 | 高可用编排、运营控制、SLA 与高级连接器 |
| Console | 基础发布、检索、调用历史 | 运营仪表盘、合规报告、组织管理 |

开源部分必须足以让用户发布、验证、发现和受控调用 Capability；企业版不能把核心 Contract 或安全修复变成黑盒依赖。

## 13. 论文与理论对应

| 研究线 | 对 Moduregis 的贡献 | 产品化边界 |
|---|---|---|
| MOSAIC | Capability 的建模、组合、Contract 与治理设计时理论 | Moduregis Contract、Registry、Conformance 的主要理论来源 |
| APEX | Capability activation、assurance、stateful execution、recovery、placement | Governor、Broker、Plan/Invocation lifecycle 的运行时语义 |
| ORCHID | 目标分解、Capability graph、约束传播与委托 | ORCHADYN；Moduregis 仅提供其企业入口和 Plan governance |
| EASEF | 双重身份、授权、scope attenuation、执行证据和撤销 | AEGIVELA；Moduregis 通过 policy/authorization contracts 集成 |
| Harmovela ART | task、state、delegation、recovery 的协调协议语义 | Harmovela SDK/adapters；Moduregis 不拥有协议本体 |
| NOUS / ENGRAM / MNEME / LETHE | 上下文、经验、检索、修订与遗忘 | MNEMOVELA；Moduregis 只投影元数据与消费检索结果 |
| INTER | 跨系统与跨协议互操作 | LIMENORA 和 Moduregis adapters 的互操作约束 |

### 13.1 论文去重裁决

- Moduregis 不建立与产品同名、重复 MOSAIC/APEX 的论文系列。
- MOSAIC 负责设计时 Capability 理论；APEX 负责激活、保证与执行状态语义。
- 授权 token、delegation attenuation、device/workload binding、revocation 的原创论证归入 EASEF，不在 APEX 中重复。
- 动态工作流物化只有在产生独立、可验证的新理论时才形成论文，不以 RHEOVELA 产品名强行立项。

## 14. 当前决策与待决问题

### 已决

1. Moduregis 是 Capability 控制面，不是 Agent Runtime、流程引擎、Gateway 或 Memory 系统。
2. Registry 是 Capability 权威源；MNEMOVELA 只能持有可重建的索引、关系和经验投影。
3. AEGIVELA 是身份、授权、审批、撤销和 attestation 的权威安全系统。
4. 首期采用模块化单体，优先验证 Contract 和治理闭环。
5. `Capability Contract` 是跨产品稳定边界，必须先于 Console 和复杂智能检索冻结。

### 待决（Phase 0 前必须完成）

1. Capability Contract v1 是否采用 JSON Schema 2020-12，并以 OpenAPI 3.1 发布 HTTP 表面。
2. Contract 的兼容性规则：哪些字段可向后兼容增加，哪些变更必须提升 major version。
3. AEGIVELA 尚未可用时的开发 OIDC adapter 的精确 token claim 映射。
4. Harmovela 的首期 transport adapter 选择 NATS JetStream 还是 Kafka；只能选择一个作为参考实现。
5. 首批试点租户、Capability 类型和 CRM/HR/Finance 场景的真实系统边界。

## 15. 下一步

1. 创建 `contracts/capability`，完成 `Capability Contract v1alpha1`、正反 fixtures 与兼容性规则。
2. 撰写 Registry 生命周期 ADR，冻结状态迁移、撤销语义和版本不可变规则。
3. 以一个 `mcp.tool` 和一个 `api.operation` 实现 Phase 0 垂直切片。
4. 与 AEGIVELA、PRAXOVELA、LIMENORA 团队共同冻结 authorization、invocation 和 evidence reference 三个适配契约。
