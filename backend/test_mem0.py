from app.services.mem0_client import extract_and_store_memory, get_student_context
from langchain_core.messages import HumanMessage

print("Storing memory...")
messages = [
    HumanMessage(content="I really like basketball, could you explain physics using basketball examples?"),
]
extract_and_store_memory(messages, user_id="test_user_999")

print("Retrieving memory...")
context = get_student_context("sports preferences", user_id="test_user_999")
print(f"Retrieved Context: \n{context}")
