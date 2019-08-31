import uuid

def create_sync(syncState: dict) -> dict:
    return dict(
        id=uuid.uuid4().hex.upper(),
        syncState=syncState
    )