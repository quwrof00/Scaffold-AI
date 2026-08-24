import os
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field

load_dotenv()

class RuleEngineResult(BaseModel):
    subject: str = Field(description="The academic subject (e.g. Mathematics, Physics, Biology, Chemistry, English, History, etc)")
    topic: str = Field(description="The broad topic of the subject (e.g. Human Heart, Quadratics, Kinematics)")
    intent: str = Field(description="Must be exactly one of: PROBLEM_SOLVING, CONCEPT_UNDERSTANDING, GENERAL")
    title: str = Field(description="A short 3-5 word title for this session")

def analyze_student_prompt(prompt: str) -> RuleEngineResult:
    """
    Uses the Groq LLM to quickly categorize a student's prompt.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is missing")

    llm = ChatGroq(temperature=0, model_name="openai/gpt-oss-20b", groq_api_key=api_key)
    
    # We use a structured output approach
    structured_llm = llm.with_structured_output(RuleEngineResult)
    
    system_prompt = """You are a classification engine for an educational app.
Your job is to read a student's prompt and extract the Subject, Topic, Intent, and generate a short Title.

Rules for Intent:
- If the student is asking to solve a specific math problem or equation (e.g. "solve x^2 - 4x = 0"), intent is PROBLEM_SOLVING.
- If the student is asking about a concept, definition, or theory (e.g. "I don't understand the human heart"), intent is CONCEPT_UNDERSTANDING.
- Otherwise, GENERAL.
"""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=prompt)
    ]
    
    result = structured_llm.invoke(messages)
    return result
