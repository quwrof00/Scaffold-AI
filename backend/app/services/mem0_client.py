import os
from mem0 import MemoryClient
from dotenv import load_dotenv

load_dotenv()

# Initialize Mem0 managed client
# Ensure MEM0_API_KEY is present in your backend/.env file
memory_client = MemoryClient(api_key=os.getenv("MEM0_API_KEY", "dummy-mem0-key"))

def extract_and_store_memory(messages: list, user_id: str):
    """
    Takes a list of conversation messages (Langchain format or raw strings), 
    extracts facts, and stores them in Mem0 for the specific user.
    """
    # Mem0 expects the messages in a specific format or raw text.
    # Usually we pass the latest user message or a dict of role/content.
    # Let's extract the human messages to send to mem0.
    text_to_store = ""
    for msg in messages:
        if getattr(msg, "type", None) == "human":
            text_to_store += f"{msg.content}\n"
        elif isinstance(msg, dict) and msg.get("role") == "user":
            text_to_store += f"{msg.get('content')}\n"
            
    if text_to_store.strip():
        try:
            print(f"[MEM0] Extracting and storing memory for user {user_id}. Text: {repr(text_to_store)}")
            memory_client.add(text_to_store, user_id=user_id)
            print(f"[MEM0] Memory stored successfully for user {user_id}!")
        except Exception as e:
            print(f"[MEM0] Error storing memory to Mem0: {e}")

def get_student_context(query: str, user_id: str) -> str:
    """
    Retrieves relevant facts about the student for the given query.
    """
    try:
        print(f"[MEM0] Searching memories for user {user_id} with query: {repr(query)}")
        response = memory_client.search(query, filters={"user_id": user_id})
        
        # Managed Mem0 returns a dict with 'results' key, OSS version returns a list
        results = response.get("results", []) if isinstance(response, dict) else response
        
        facts = [res.get("memory", "") for res in results if "memory" in res]
        if facts:
            context_str = "Retrieved memories about this student:\n- " + "\n- ".join(facts)
            print(f"[MEM0] Found {len(facts)} facts. Context:\n{context_str}")
            return context_str
        print("[MEM0] No relevant memories found.")
    except Exception as e:
        print(f"[MEM0] Error retrieving memory from Mem0: {e}")
        
    return ""
