# SYSTEM DIRECTIVE & IMPLEMENTATION BLUEPRINT: JUMPA SPATIAL MACRO-TOOLS

## PART 1: AI SYSTEM INSTRUCTIONS (MACHINE-READABLE CONTEXT)

**IDENTITY:** You are a Principal Systems Engineer and Geospatial Architect. Your mandate is to implement the Macro-Tool Orchestration layer for the "Jumpa" spatial platform. You will write high-performance, memory-safe code exclusively in Rust, utilizing Axum, Tonic (gRPC), and PostGIS via SQLx.

**ARCHITECTURAL AXIOMS (STRICT):**

1. **The LLM is a Semantic Router:** The LLM is strictly prohibited from executing SQL, guessing geographic coordinates, or performing mathematical spatial operations. It solely outputs structured JSON parameters based on user intents.
2. **Agnostic Spatial Anchors Paradigm:** The system does not differentiate between "Users", "Offices", "POIs", or "Terminals" at the spatial computation level. Every entity is abstracted as an `AgnosticAnchor` possessing geometry, gravitational weight, and bounding constraints.
3. **Execution Separation (Cargo Workspace):**
   - **Rust API Gateway (Axum):** Responsible for I/O-bound operations, handling ingress traffic, LLM prompting, Data Hydration (fetching EWKB coordinates for IDs via SQLx), and orchestrating gRPC calls.
   - **Rust Spatial Engine (Tonic):** A standalone crate/microservice responsible exclusively for CPU-bound spatial mathematics, penalty-function optimizations, and Valhalla routing engine execution.
4. **Hermetic Build:** The entire workspace is managed by Bazel (Bzlmod) and Cargo.

### 1.1. MACRO-TOOL DEFINITION: `resolve_spatial_equation`

This is the singular, unified Macro-Tool the LLM will utilize to solve any meeting point or spatial routing query.

**JSON Schema (Function Calling Signature):**

**JSON**

```
{
  "name": "resolve_spatial_equation",
  "description": "Calculates the optimal spatial coordinate based on multiple agnostic geometric anchors, applying weights and boundary constraints, and returns localized POIs.",
  "parameters": {
    "type": "object",
    "properties": {
      "routing_mode": {
        "type": "string",
        "enum": ["euclidean_distance", "time_fairness_valhalla"]
      },
      "spatial_anchors": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "reference_id": { "type": "string", "description": "UUID or identifiable string of the entity" },
            "reference_type": { "type": "string", "enum": ["user_live", "saved_location", "poi_anchor", "corridor_line", "exclusion_polygon"] },
            "weight_multiplier": { "type": "number", "default": 1.0 },
            "max_radius_meters": { "type": "number", "description": "Boundary constraint" },
            "constraint_priority": { "type": "string", "enum": ["soft", "hard"], "default": "soft" }
          },
          "required": ["reference_id", "reference_type"]
        }
      },
      "poi_filters": {
        "type": "object",
        "properties": {
          "categories": { "type": "array", "items": { "type": "string" } },
          "price_tier": { "type": "string", "enum": ["low", "medium", "high"] }
        }
      }
    },
    "required": ["routing_mode", "spatial_anchors"]
  }
}
```

### 1.2. PROTOBUF CONTRACT (`spatial_engine.proto`)

This contract dictates the highly efficient binary data transfer between the Axum Gateway and the Spatial Engine via Tonic.

**Protocol Buffers**

```
syntax = "proto3";

package jumpa.spatial;

service SpatialEngine {
  rpc CalculateOptimalCoordinate (SpatialEquationRequest) returns (SpatialEquationResponse) {}
}

enum ConstraintPriority {
  SOFT = 0;
  HARD = 1;
}

enum GeometryType {
  POINT = 0;
  LINESTRING = 1;
  POLYGON = 2;
}

message AgnosticAnchor {
  string id = 1;
  GeometryType geom_type = 2;
  bytes ewkb_geometry = 3; // Extended Well-Known Binary from PostGIS
  float weight = 4;
  optional double max_radius_meters = 5;
  ConstraintPriority priority = 6;
}

message SpatialEquationRequest {
  string routing_mode = 1;
  repeated AgnosticAnchor anchors = 2;
}

message SpatialEquationResponse {
  double resolved_longitude = 1;
  double resolved_latitude = 2;
  bool constraint_violation_flag = 3; // True if a soft constraint was penalized
  string execution_metadata = 4;
}
```

### 1.3. SQLx POLYMORPHIC HYDRATION

The Rust Axum Gateway must hydrate the string IDs from the LLM into EWKB bytes before sending them to the Tonic gRPC channel. You must utilize SQLx macros (`query!`) to fetch geometries from the polymorphic `spatial_directory` table with absolute compile-time safety.

**Rust**

```
use sqlx::{FromRow, PgPool};
use bytes::Bytes;

#[derive(FromRow)]
pub struct HydratedAnchor {
    pub entity_id: String,
    pub entity_type: String,
    // SQLx automatically handles raw byte extraction for PostGIS geometries
    pub ewkb_geom: Vec<u8>,
}

// Example execution pattern for the Gateway
pub async fn fetch_geometries(pool: &PgPool, entity_ids: &[String]) -> Result<Vec<HydratedAnchor>, sqlx::Error> {
    let records = sqlx::query_as!(
        HydratedAnchor,
        "SELECT entity_id, entity_type, geom::bytea as ewkb_geom FROM spatial_directory WHERE entity_id = ANY($1)",
        entity_ids
    )
    .fetch_all(pool)
    .await?;

    Ok(records)
}
```

## PART 2: HUMAN-READABLE IMPLEMENTATION GUIDE

This section breaks down the end-to-end lifecycle of the `resolve_spatial_equation` tool, detailing the underlying mathematics, the Valhalla routing integration, and the architectural hand-offs within the Rust workspace.

### Phase 1: Input Parsing & Data Hydration (Rust Axum Layer)

1. **LLM Extraction:** The user inputs a complex prompt. The LLM responds with the `resolve_spatial_equation` JSON payload containing an array of `spatial_anchors`.
2. **Concurrent Hydration:** The Axum Gateway receives `reference_id` strings. It utilizes `tokio::spawn` or `tokio::join!` to execute highly concurrent lookups:
   - Queries Redis asynchronously for `user_live` coordinates.
   - Executes SQLx polymorphic queries to PostGIS for `saved_location` or `poi_anchor` types to fetch their raw EWKB data.
3. **Protobuf Serialization:** Axum maps the `weight_multiplier`, `max_radius_meters`, and the fetched `ewkb_geom` bytes into the `prost`-generated structs, compiles the `SpatialEquationRequest` Protobuf, and transmits it via the local gRPC channel to the Spatial Engine.

### Phase 2: Spatial Engine Execution (Rust Tonic Layer)

This is where the complex, CPU-bound spatial mathematics occur. The Tonic microservice parses the Protobuf and branches its execution based on the `routing_mode`.

#### Branch A: `euclidean_distance` (Mathematical Optimization)

If the query relies on geometric vectors rather than road networks, the engine employs a modified Weiszfeld algorithm equipped with **Penalty Functions** to resolve conflicting constraints (e.g., pulling towards Anchor A while restricted by a radius from Anchor B).

Rust evaluates the following objective function to find the optimal coordinate **$y$**:

$$
\arg\min_{y \in \mathbb{R}^2} \left( \sum_{i=1}^{n} w_i \| x_i - y \|_2 + \lambda \sum_{j \in C} \max(0, \| c_j - y \|_2 - R_j)^2 \right)
$$

- **$w_i \| x_i - y \|_2$**: The standard gravitational pull of each anchor point **$x_i$** multiplied by its assigned weight **$w_i$**.
- **$\lambda$**: The penalty multiplier constant (a strictly large number).
- **$c_j$**: The coordinate of an anchor that has a defined `max_radius_meters`.
- **$R_j$**: The boundary constraint radius.
- **The Mechanism:** If the proposed point **$y$** is inside the radius **$R_j$**, the penalty evaluates to **$0$**. If **$y$** breaches the radius to satisfy a heavy weight elsewhere, the penalty grows quadratically, forcing the algorithm to iteratively adjust **$y$** back towards the boundary limit, gracefully finding the most optimal compromise without throwing an application panic.

#### Branch B: `time_fairness_valhalla` (Routing Network Optimization)

If the prompt requires fair travel times considering actual roads and traffic, Euclidean math is insufficient.

1. **Valhalla Binding:** The Spatial Engine utilizes C++ bindings or FFI (Foreign Function Interface) to communicate directly with the embedded Valhalla routing engine.
2. **Isochrone Generation:** Rust instructs Valhalla to generate time-distance polygons (isochrones) for every anchor point simultaneously.
3. **Geometric Intersection:** Rust utilizes a geometry crate (e.g., `geo` or `geos` bindings) to calculate the topological intersection of these Valhalla-generated polygons.
4. **Boundary Snapping (Hard Constraints):** If an anchor has a `constraint_priority: "hard"` (e.g., an exclusion zone polygon), and the resulting point falls inside it, Rust executes a projection function. It calculates the closest point on the exterior boundary ring of the exclusion zone and "snaps" the final coordinate to that safe boundary.

### Phase 3: Spatial Resolution & Output (Rust Axum & PostGIS Layer)

1. **gRPC Return:** The Tonic engine returns the finalized, mathematically resolved `[longitude, latitude]` coordinate back to the Axum Gateway.
2. **POI Query:** Axum utilizes SQLx to execute a final, compile-time verified PostGIS query. Using `ST_DWithin`, it searches the unified `spatial_directory` (joined with the business tables) for commercial venues surrounding the newly resolved coordinate, applying the `categories` and `price_tier` filters initially extracted by the LLM.
3. **Response Delivery:** The final array of venue structs is serialized into the `async-graphql` response and transmitted back to the Astro/React client to trigger the MapLibre 3D `flyTo` animation and render the markers.

### Phase 4: Tiered Mitigation Protocol

If the Spatial Engine encounters a mathematically impossible scenario (e.g., two hard constraint boundaries that are physically isolated by 100km with no intersection), it MUST NOT panic. It sets the `constraint_violation_flag = true` in the gRPC response and returns the most logical midpoint derived from the fallback algorithm.

The Axum Gateway intercepts this flag and utilizes SQLx to dynamically expand the `ST_DWithin` search radius by 50% iteratively (up to 3 times). This ensures the client always receives a valid list of POIs, categorically preventing a "No Results Found" dead-end experience.
