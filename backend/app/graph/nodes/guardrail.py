import os
import re
from langchain_core.messages import HumanMessage, AIMessage
from langchain_groq import ChatGroq
from app.graph.state import GraphState

guardrail_model = ChatGroq(
    model="meta-llama/llama-prompt-guard-2-86m", 
    temperature=0, 
    api_key=os.getenv("GROQ_API_KEY", "dummy")
)

BANNED_PATTERNS = [
    re.compile(r"(?i)\b(ignore previous( instructions)?|system prompt|give me the answer|just give the answer|tell me the answer|bypass|jailbreak)\b"),
    re.compile(r"(?i)\b(fuck|shit|bitch|asshole|cunt)\b")
]

def guardrail_node(state: GraphState) -> GraphState:
    """Checks the latest human message for safety violations."""
    messages = state.get("messages", [])
    if not messages:
        return state
        
    latest_msg = messages[-1]
    if getattr(latest_msg, "type", None) != "human":
        # Only check human messages
        state["is_safe"] = True
        return state
        
    content = latest_msg.content
    
    # 1. Regex Layer
    for pattern in BANNED_PATTERNS:
        if pattern.search(content):
            print(f"[GUARDRAIL] Regex caught unsafe content matching {pattern.pattern}")
            state["is_safe"] = False
            state["safety_violation_reason"] = "Inappropriate language or prompt injection attempt detected (Regex)."
            state["messages"] = [AIMessage(content="I'm here to help you learn, but we need to keep the conversation appropriate and focused. Please rephrase that!")]
            return state

    # 2. LLM Prompt Guard Layer
    try:
        res = guardrail_model.invoke([HumanMessage(content=content)])
        score_str = res.content.strip()
        score = float(score_str)
        print(f"[GUARDRAIL] Prompt Guard Score: {score}")
        if score > 0.5:
            state["is_safe"] = False
            state["safety_violation_reason"] = "Prompt Guard detected a potential injection or jailbreak attempt."
            state["messages"] = [AIMessage(content="I can't follow those instructions. Let's stay focused on the learning topic!")]
            return state
    except ValueError:
        print(f"[GUARDRAIL] Failed to parse float from Prompt Guard output: {res.content if 'res' in locals() else 'unknown'}")
    except Exception as e:
        print(f"[GUARDRAIL] Error calling Prompt Guard model: {e}")
        
    state["is_safe"] = True
    return state
