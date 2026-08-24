import os
from mem0 import MemoryClient
from dotenv import load_dotenv
import time

load_dotenv()
client = MemoryClient(api_key=os.getenv("MEM0_API_KEY"))
user_id = "test_user_xyz_999"
text = "Can you explain it using a basketball analogy? I am a visual learner and I absolutely love basketball."
res = client.add(text, user_id=user_id)
print("Add result:", res)

time.sleep(3)
search_res = client.search("student learning preferences, hobbies, and past struggles", filters={"user_id": user_id})
print("Search result:", search_res)
