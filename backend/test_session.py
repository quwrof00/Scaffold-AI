import asyncio
from app.db.database import AsyncSessionLocal
from app.db.models import User, StudentProfile, Session as DBSession, SessionIntent, InputType
from sqlalchemy import select
from app.services.rule_engine import analyze_student_prompt
from datetime import datetime, timezone

async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(StudentProfile))
        profile = result.scalars().first()
        if not profile:
            print("No profile found.")
            return
        
        print(f"Testing for student: {profile.id}")
        try:
            analysis = analyze_student_prompt("I don't understand the components of a human heart...")
            print(f"Analysis successful: {analysis}")
            
            new_session = DBSession(
                studentId=profile.id,
                title=analysis.title,
                subject=analysis.subject,
                topic=analysis.topic,
                intent=SessionIntent.CONCEPT_UNDERSTANDING,
                inputType=InputType.TEXT
            )
            db.add(new_session)
            await db.commit()
            print("DB save successful!")
        except Exception as e:
            print(f"Failed: {e}")
            import traceback
            traceback.print_exc()

asyncio.run(main())
