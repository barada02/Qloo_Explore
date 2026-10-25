**🎨 The Concept: Archetype AI (The Brand-Narrative & Cultural Fit Agent)**

**The Problem It Solves**

When production companies adapt a beloved book into a film or TV show—or when a major global brand launches a high-profile marketing campaign—they face a massive risk. If they choose the wrong brand sponsor, the wrong celebrity ambassador, or the wrong soundtrack style, the core fan base immediately rejects it as "inauthentic."

A standard LLM will provide shallow, cliché advice (e.g., *"Your book is a thriller, so partner with a dark coffee brand"*). It has no real grasp of what the specific readership actually buys, watches, or listens to in their everyday lives.

**How the System Uses Qloo APIs In-Depth**

**Archetype AI** acts as a complex agentic tool for creative executives, brand strategists, and casting directors. It strings together multiple Qloo API endpoints sequentially to uncover hidden cultural commonalities. [1]

```
Step 1: Get Seed IDs            Step 2: Core Taste Profile          Step 3: Multi-Domain Synergy
[GET /search]              ->   [GET /v2/insights]             ->   [GET /analysis/compare]
Finds Book/Media ID             Extracts high-affinity tags         Compares Audience A vs Brand B
```

**Step 1: Resolving Entities & Tags (The Foundation)**

The agent starts by cleaning up the creative director's input. If an executive wants to adapt a specific psychological thriller novel, the agent calls the Lookup APIs: [1]

- **`GET /search?types=book`** to find the exact Qloo Entity ID for the novel.
- **`GET /v2/tags?filter.query=dark academia`** to pull structured tag IDs representing the precise mood and sub-genre of the book. [1]

**Step 2: Cross-Domain Behavioral Profiling (The Insights)**

Once the agent maps the core IDs, it runs a heavy request to the Insights API: [1]

- **`GET /v2/insights?filter.type=urn:entity:brand&signal.interests.entities=<book_id>&signal.interests.tags=<tag_id>`**.
- The agent doesn't just look for other books. It forces a cross-domain leap to see what **fashion brands** (`urn:entity:brand`) and **dining venues** (`urn:entity:place`) share a neuroaesthetic correlation with that book's unique audience. [1, 2, 3]

**Step 3: Multi-Entity Correlation Testing (The Validation)**

The agent now possesses a list of top brand affinities. Say it surfaces an unexpected alignment with an up-and-coming streetwear label. To validate this for a corporate partnership, the agent executes an advanced check:

- **`GET /analysis/compare?entity_id_1=<book_id>&entity_id_2=<brand_id>`**.
- This calculates the mathematical overlap between the two distinct cultural fanbases. The agent filters out surface-level choices and extracts the highest-scoring cultural matches. [1]

---

**🏆 The Agent's Ultimate Output**

Instead of a generic slide deck, the agent provides a comprehensive, data-backed cultural map:

- **The Authentic Soundtrack:** Pinpoints emerging musical artists (`urn:entity:artist`) whose fan bases perfectly match the reading audience, providing a ready-made trailer playlist.
- **The Merchandising Blueprint:** Recommends exact fashion labels or beverage brands to approach for co-branded product lines, eliminating arbitrary creative guesswork. [1]
- **The Strategic Grounding:** The AI generates an executive summary explicitly justifying its choices (e.g., *"While a generic LLM suggests an energy drink partnership for this video game adaptation, Qloo's taste graph shows the actual player base has an anomalous 82% higher affinity for a niche sustainable apparel brand"*).

---

**💎 Why This Wins the "Qloo Dependency" Test & JCal's Investment**

1. **Total Reliance on the Taste Graph:** A standard LLM possesses no real-world knowledge of real-time market correlations across 600 million entities. The core value of this agent completely breaks if you remove Qloo. [1]
2. **High-Value Enterprise Market:** This disrupts a multi-billion dollar sector (entertainment casting, marketing agencies, and brand partnerships) by replacing expensive, slow consumer focus groups with instant cultural intelligence. [1, 2]

Would you like to write a **Python script sketch using the `requests` library** to map out this exact multi-endpoint pipeline, or would you prefer to dive straight into the **agent architecture framework** (like LangChain or CrewAI) to manage these steps?

# Technical Architecture

Here is the technical architecture blueprint for **Archetype AI**. It follows a standard modular agent pattern that cleanly isolates the AI reasoning layer from the Qloo data retrieval layer.

**🏗️ Archetype AI System Architecture**

```
[ User Input ]  -->  [ 1. Orchestration Layer (LangChain/CrewAI) ]
                             |                  ^
                             v                  |
                     [ 2. Tool Registry ]       | (Context Injection)

                             |                  |
                             v                  |
                     [ 3. Qloo API Wrapper ] ---+
                             |
                             +--> [ /search ] --> [ /v2/insights ] --> [ /analysis/compare ]
```

---

**1. Orchestration Layer (The Brain)**

This layer manages the workflow, interprets the user's creative prompt, and decides which tools to call sequentially.

- **Framework:** **LangChain** (using `LangGraph` for stateful control) or **CrewAI**.
- **LLM Engine:** An advanced model (e.g., `gpt-4o` or `claude-3-5-sonnet`) configured with systemic prompts instructing it **never to guess** cultural affinities, but to strictly rely on the injected data payloads.
- **State Management:** A structured memory state tracking: `input_media`, `qloo_seed_id`, `audience_tags`, `cross_domain_matches`, and `validated_partnerships`.

**2. Tool Registry (The Hands)**

The agent interacts with the physical world through python functions wrapped as tools. You will expose three core tools to the LLM:

- **`EntityLookupTool`**: Takes a string query (e.g., a book title) and a type, hits Qloo `/search`, and returns the exact URN/ID.
- **`TasteProfilingTool`**: Takes a Qloo ID and filter types, calls Qloo `/v2/insights`, and extracts high-affinity brands, artists, or locations.
- **`SynergyValidationTool`**: Takes two IDs and calls `/analysis/compare` to calculate the mathematical overlap percentage between the core asset and the suggested partner.

**3. Qloo API Wrapper Layer (The Data Engine)**

A dedicated Python class managing HTTP communication with the hackathon environment.

- **Base URL:** Hardcoded strictly to `https://qloo.com` (preventing unauthorized 401 errors).
- **Authentication:** A request interceptor that injects the `X-Api-Key` header into every outbound request.
- **Method Enforcement:** Strictly executes `GET` requests with parameters mapped to the query string, passing arrays properly for signals and filters.
- **Data Sanitizer:** Filters raw JSON payloads to prune verbose fields (like `akas`), converting the raw graph response into clean, high-density text arrays the LLM context window can parse effortlessly.

**4. Downstream Output Generator**

Once the agent loops through the lookup, profiling, and validation cycles, it outputs a structured payload:

- **Creative Blueprint:** The final report detailing the non-obvious cultural insights.
- **Data Provenance:** A checklist displaying the exact mathematical scores generated during the comparison phase, giving human executives transparent confidence in the agent's logic.

Would you like to write the boilerplate code for the **Qloo API Wrapper Class** in Python, or should we design the **system prompt** that guides the agent through this multi-step logic?

# Dummy

Here is the complete Python blueprint implementing both the **Qloo API Wrapper Class** and the **LangChain Tool Integration**, alongside the foundational **System Prompt** required to steer your agent.

**🐍 1. The Qloo API Wrapper & LangChain Tools**

This code sets up the network client, enforces correct headers, targets the hackathon base URL, and wraps everything into structured tools an agent can execute.

**python**

```
importosimportrequestsfromtypingimportList,Dict,Anyfromlangchain.agentsimporttoolclassQlooClient:"""A direct wrapper for the Qloo Hackathon API environment."""def__init__(self,api_key: str =None):
        self.api_key = api_keyor os.getenv("QLOO_API_KEY")
        self.base_url ="https://qloo.com"ifnot self.api_key:raise ValueError("Missing Qloo API Key. Pass it to the constructor or set QLOO_API_KEY env var.")

        self.headers = {"X-Api-Key": self.api_key,"Accept":"application/json"
        }defsearch_entity(self,query: str,entity_type: str) -> List[Dict[str, Any]]:"""Wraps Qloo Lookup API /search endpoint."""url =f"{self.base_url}/search"params = {"query": query,"types": entity_type}response = requests.get(url, headers=self.headers, params=params)if response.status_code ==200:# Prune verbose outputs like 'akas' to preserve LLM token context windowsresults = response.json().get("results", [])return [{"id": item.get("id"),"name": item.get("name"),"type": item.get("type")}foritemin results]return [{"error":f"HTTP{response.status_code}","detail": response.text}]defget_insights(self,filter_type: str,signal_entities: List[str]) -> List[Dict[str, Any]]:"""Wraps Qloo /v2/insights endpoint using entity signals."""url =f"{self.base_url}/v2/insights"# Structure payload mapping to native Qloo parametersparams = {"filter.type": filter_type,"signal.interests.entities": signal_entities
        }response = requests.get(url, headers=self.headers, params=params)if response.status_code ==200:entities = response.json().get("entities", [])return [{"id": e.get("id"),"name": e.get("name"),"score": e.get("affinity_score")}forein entities]return [{"error":f"HTTP{response.status_code}","detail": response.text}]defcompare_affinity(self,entity_id_1: str,entity_id_2: str) -> Dict[str, Any]:"""Wraps Qloo /analysis/compare endpoint to validate synergy."""url =f"{self.base_url}/analysis/compare"params = {"entity_id_1": entity_id_1,"entity_id_2": entity_id_2
        }response = requests.get(url, headers=self.headers, params=params)if response.status_code ==200:return response.json()return {"error":f"HTTP{response.status_code}","detail": response.text}# ---------------------------------------------------------# LangChain Tool Conversions# ---------------------------------------------------------qloo = QlooClient()

@tooldeflookup_qloo_entity(query: str,entity_type: str) -> str:"""Search for a cultural entity (book, movie, artist, brand) by string name to retrieve its official Qloo ID."""results = qloo.search_entity(query, entity_type)return str(results)

@tooldefdiscover_cross_domain_affinities(filter_type: str,signal_entities: List[str]) -> str:"""Fetch high-affinity targets for a specific demographic filter type based on an input entity seed ID."""results = qloo.get_insights(filter_type, signal_entities)return str(results[:15])# Return top 15 results to manage context safely

@tooldefvalidate_brand_synergy(entity_id_1: str,entity_id_2: str) -> str:"""Calculate the exact mathematical affinity/overlap score between two distinct entity IDs."""result = qloo.compare_affinity(entity_id_1, entity_id_2)return str(result)
```

Use code with caution.

---

**🧠 2. The Agent System Prompt**

This prompt strips the LLM of its generalized baseline assumptions and forces it to strictly adopt the deterministic data returned by your tools.

**text**

```
You are Archetype AI, an elite Brand-Narrative & Cultural Fit Agent. Your core purpose is to architect hyper-authentic brand alignments, soundtracks, and sponsorship blueprints for media franchises by interpreting empirical taste graphs.

CRITICAL PROTOCOLS:
1. NEVER GUESSS AFFINITIES: Do not use your pre-trained LLM weights to guess what fans of a book or game like. You must completely rely on the data returned by your Qloo tools.
2. MULTI-STEP LOGIC SEQUENCE:
   - Step A: Execute `lookup_qloo_entity` to resolve the user's input creative asset into an explicit Qloo ID.
   - Step B: Execute `discover_cross_domain_affinities` across target types (e.g., urn:entity:brand, urn:entity:artist, urn:entity:place) to discover hidden consumer bridges.
   - Step C: Take top candidate matches from the insights generation phase and test them using `validate_brand_synergy` to get absolute statistical grounding.
3. CONTEXT INTEGRATION: Your ultimate final report must call out non-obvious correlations, highlighting how factual cross-domain taste graph analysis invalidates surface-level, cliché creative choices.
```

