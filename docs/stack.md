
# JUMPA: Comprehensive Architecture & Tech Stack Blueprint

## 1. Infrastructure and Repository Management

* **Bazel (Bzlmod) & Cargo Workspace**
  * **Core Function:** Absolute build system, monorepo manager, and Rust workspace orchestrator.
  * **Usage Instructions:** Fully responsible for compiling frontend TypeScript, building the Rust binaries (API Gateway and Spatial Engine), and assembling Docker images. Must maintain Hermetic Builds. Build execution outside of Bazel/Cargo Workspace configurations is strictly prohibited.
* **Docker**
  * **Core Function:** Runtime isolation (Containerization).
  * **Usage Instructions:** Apply a microservices architecture pattern utilizing the compiled Rust workspace. Must separate the Rust API Gateway, Rust Spatial Engine, Frontend SSR, Edge Proxy, and database instances into fully independent containers to facilitate workload-specific horizontal scaling.

## 2. Edge & Ingress Routing

* **Nginx**
  * **Core Function:** Primary reverse proxy, SSL/TLS terminator, and ingress controller.
  * **Usage Instructions:** Must act as the single public-facing entry point (Ports 80/443). Responsible for routing `/api/*` to the Axum Gateway, `/tiles/*` to Martin, and `/*` to the Astro SSR server. Must generate and inject W3C `traceparent` headers into all incoming HTTP requests before forwarding them to internal services.

## 3. Client Interface Layer (Frontend & View Layer)

* **Bun (SSR Runtime)**
  * **Core Function:** High-performance JavaScript runtime for server-side rendering.
  * **Usage Instructions:** Operates exclusively within a dedicated container to run the compiled Astro server. Responsible for rendering dynamic HTML and handling frontend hydration requests.
* **Astro (SSR Mode)**
  * **Core Function:** Primary framework for routing and static HTML delivery.
  * **Usage Instructions:** Implement the Islands architecture. **Critical Constraint:** Prohibited from loading runtimes of multiple UI frameworks (React, SolidJS, Svelte) simultaneously within a single URL instance to prevent client memory bloat.
* **Vanilla JavaScript & CSS (DOM & Compositor Manipulation)**
  * **Core Function:** Basic DOM interaction driver, high-performance animations, and UI state transitions.
  * **Usage Instructions:** Use exclusively for UI visibility modification tasks on static components rendered by Astro, without loading third-party dependencies. Strictly utilized for GPU-accelerated CSS transforms (e.g., `transform: scale()`, `transform-origin`) to execute the  **"Blackhole Transition"** . Must manipulate the chat layer's scaling over the underlying `FullScreenMap` to achieve a native, Wayland/Hyprland-level compositor fluidity.
* **React**
  * **Core Function:** Virtual DOM and lifecycle-based third-party library integrator.
  * **Usage Instructions:** Strictly restrict usage to wrapping specific libraries that demand the React ecosystem (specifically MapLibre GL JS and spatial WebGL/Canvas rendering libraries).
* **SolidJS**
  * **Core Function:** High-volume reactive data renderer without a Virtual DOM.
  * **Usage Instructions:** Deploy in isolated routes to handle application layers managing thousands of data rows, calculations, B2B analytics dashboards, and complex matrix filtering in real-time.
* **Svelte**
  * **Core Function:** Floating UI controller with zero runtime compilation (Zero-Runtime Micro-UI).
  * **Usage Instructions:** Use for high-frequency update elements (e.g., `ChatDrawer_FAB`, `BottomControlCard`, and real-time voting nodes) operating as an overlay on top of WebGL components, ensuring zero memory overhead on underlying layers.
* **Nano Stores**
  * **Core Function:** Agnostic global state management.
  * **Usage Instructions:** Use as the sole data synchronization protocol between component islands running different runtimes. Acts as the **Global Persistent State** manager to ensure the Jumpa session status remains active and globally accessible regardless of page navigation (The Spotify Model).

## 4. Orchestration and API Layer (Backend Gateway)

* **Rust (Axum)**
  * **Core Function:** Internal API Gateway, I/O-bound orchestrator, and semantic router for the LLM.
  * **Usage Instructions:** Must operate as an independent binary. Handles authentication (JWT extraction), payload validation, and HTTP/WebSocket communication. Delegating CPU-bound spatial computation to this layer is strictly prohibited.
  * **Architectural Rule 1 (Data Hydration Pipeline):** When receiving a macro-tool request from the LLM containing Agnostic Spatial Anchors (string IDs), Axum MUST execute parallel asynchronous database queries to PostGIS/Redis to convert these IDs into raw EWKB geometries BEFORE initiating the gRPC call to the Spatial Engine.
  * **Architectural Rule 2 (Express Bypass Pipeline):** If a user initiates an "Express Session" directly from the Discovery Home Map (where the destination is absolute), Axum MUST bypass the LLM routing and gRPC call to the Spatial Engine entirely. It must immediately transition the session state to `EN_ROUTE`, feeding the absolute coordinates directly to the frontend's routing visualizer.
* **GraphQL (async-graphql)**
  * **Core Function:** Code-first data query specification protocol.
  * **Usage Instructions:** Implement utilizing Rust procedural macros (`#[Object]`) to automatically generate the strict GraphQL schema directly from Rust structs, guaranteeing type safety.

## 5. Spatial Computation Layer (Microservice)

* **Rust (Spatial Engine / Tonic)**
  * **Core Function:** Low-level, CPU-bound spatial computation engine.
  * **Usage Instructions:** Use exclusively to process geometric optimization (Weighted Geometric Median), Valhalla routing graph matrix extraction, and isochrone intersection algorithms. Operates autonomously without HTTP routes.
  * **Architectural Rule (Constraint Mitigation Pipeline):** If Valhalla isochrone intersections return a Null result (Infeasible Region), the Spatial Engine MUST NOT panic or return an error. It must autonomously fall back to a Penalty-Function Weighted Geometric Median algorithm and return the resolved coordinate with a `constraint_violation_flag` set to true.
* **gRPC (Protocol Buffers)**
  * **Core Function:** Internal binary inter-service communication protocol.
  * **Usage Instructions:** The sole standard for synchronous data transmission between Axum and the Spatial Engine.

## 6. Data Persistence & Caching Layer

* **PostgreSQL + PostGIS + pgvector**
  * **Core Function:** Relational database and single source of truth for identity, business domains, and static geography.
  * **Usage Instructions:** Implements the Hybrid Schema Pattern. Business logic data (users, B2B venue catalogs, reviews) must be stored in separated tables. All geographic geometries MUST be indexed within a single, unified `spatial_directory` table to ensure O(1) spatial lookup speeds.
* **ScyllaDB**
  * **Core Function:** High-throughput, low-latency NoSQL wide-column store.
  * **Usage Instructions:** Deployed explicitly for the  **Communication Domain** . Must handle all write-heavy operations, including 1-on-1 direct messages, group chat logs, and the high-frequency event sourcing of the Jumpa Session Lifecycle (RSVP status updates, voting increments).
* **SQLx & Scylla Rust Driver**
  * **Core Function:** Asynchronous database drivers.
  * **Usage Instructions:** Use SQLx within Rust Axum to execute raw spatial SQL queries, strictly utilizing the `query!` macro to guarantee compile-time database schema validation. Use the official `scylla` Rust crate for asynchronous chat payload insertions.
* **Redis (rs_mq / redis-rs)**
  * **Core Function:** Asynchronous in-memory storage and spatial caching.
  * **Usage Instructions:** Deploy for caching B2B venue Discovery feeds via Geohash indexing, caching live transient GPS coordinates of users during the `EN_ROUTE` phase, application-level rate limiting, and background job queue scheduling.
* **Object Storage (Cloudflare R2 / MinIO)**
  * **Core Function:** BLOB storage for application media and observability data.
  * **Usage Instructions:** Adhere to Dev/Prod Parity. Use a localized MinIO container for hermetic offline development, and seamlessly inject Cloudflare R2 environment variables for production environments. The database must only store S3 URL strings, never raw binary files.

## 7. Observability & Distributed Tracing Stack

* **Grafana Tempo & OpenTelemetry (OTel) Collector**
  * **Core Function:** Highly scalable, index-free distributed tracing backend.
  * **Usage Instructions:** Tempo writes trace blocks directly to S3/MinIO. Rust applications must not send traces directly to Tempo; they must send OTLP data to the OTel Collector container, which batches and forwards the data to Tempo.
  * **Architectural Rule (The Tracing Pipeline):**
    1. **Initiation (Nginx):** Inbound request arrives. Nginx natively generates a unique W3C `traceparent` Trace ID. Nginx sends its duration metrics to the OTel Collector and forwards the request + Trace ID to Rust Axum.
    2. **Orchestration (Rust Axum):** Axum extracts the `traceparent` header. It utilizes `tracing-opentelemetry` to record span durations for JWT validation, SQLx database hydration, and LLM prompting. Axum injects this exact Trace ID into the gRPC metadata.
    3. **Computation (Rust Spatial Engine):** The Tonic server receives the gRPC call, extracts the Trace ID, and records internal span durations for Valhalla routing and mathematical optimizations.
    4. **Aggregation (OTel Collector):** Axum and Tonic asynchronously transmit their completed spans to the Collector, which unifies them under the single Trace ID and writes the finalized block to Grafana Tempo for visual debugging.

## 8. Spatial Service Infrastructure

* **Self-Hosted Vector Tiles Server (Martin / PMTiles)**
  * **Core Function:** Spatial vector tile provider.
  * **Usage Instructions:** Configure to distribute `.pbf` binary files directly from the PostGIS database to the Astro/React client instances, bypassing commercial third-party mapping APIs.
